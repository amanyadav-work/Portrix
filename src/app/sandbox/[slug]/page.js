'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { WebContainer } from '@webcontainer/api'
import stripAnsi from 'strip-ansi';
import { Editor } from '@monaco-editor/react'
import JSZip from 'jszip'
import { FileTree } from '@/components/FileTree.js'
import { buildTree, getFileLanguage, updateSceneSettingsFile } from '@/utils/sandbox'
import { entryCandidates } from '@/constants/entryCandidates';
import { Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import useFetch from '@/hooks/useFetch';
import AddModelModal from '../_components/AddModelModal';
import FloatingPanel from '../_components/FloatingPanel';
import SandboxPreview from '../_components/SandboxPreview';
import TerminalWindow from '../_components/TerminalWindow';
import Loader from './_components/Loader';
import { convertFilesToZipData, extractFilesFromZipData } from '@/utils/zipUtils';
import { toast } from 'sonner';



export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SandboxPage />
    </Suspense>
  );
}


const SandboxPage = () => {

  const { slug } = useParams();
  const [webcontainerInstance, setWebcontainerInstance] = useState(null)
  const [loading, setLoading] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEdit, setIsEdit] = useState(false)
  const [fileContent, setFileContent] = useState('')
  const [entryFile, setEntryFile] = useState('');
  const [files, setFiles] = useState('')
  const [fileTree, setFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [modelInfo, setModelInfo] = useState('')
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const searchParams = useSearchParams()
  const repo = searchParams.get('repo')
  const hasBootedRef = useRef(false);
  const [statusStep, setStatusStep] = useState('Initializing...');



  const bufferedLog = (line) => {
    const cleanLine = stripAnsi(line).trim();

    // If line is special but empty after trimming, ignore it.
    const isSpecial = cleanLine.includes('[extra]') || cleanLine.includes('[npm install]');
    const specialContent = cleanLine.replace(/\[extra\]|\[npm install\]/g, '').trim();

    if (isSpecial && specialContent === '') {
      // Ignore empty special lines completely
      return;
    }

    setConsoleLogs(prev => {
      const lines = prev ? prev.split('\n') : [];

      if (isSpecial) {
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1];
          const lastIsSpecial = lastLine.includes('[extra]') || lastLine.includes('[npm install]');
          if (lastIsSpecial) {
            lines[lines.length - 1] = cleanLine; // Replace last special line
          } else {
            lines.push(cleanLine); // Append if last line not special
          }
        } else {
          lines.push(cleanLine); // No previous logs, just add
        }
      } else {
        lines.push(cleanLine);
      }

      return lines.join('\n');
    });
  };




  const {
    data: sandboxData,
    error,
    isLoading,
    refetch,
  } = useFetch({
    auto: true,
    url: slug ? `/api/sandbox/${slug}` : '',
    method: 'GET',
    onSuccess: (res) => {
      intialization(res)
    }
  });

  const { refetch: saveSandbox, isLoading: saving } = useFetch({
    url: `/api/sandbox/${slug}`,
    method: 'PATCH',
    onSuccess: (res) => {
      toast.success(res.message || 'Sandbox Saved')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save sandbox')
    },
  });


  const intialization = async (res) => {
    if (!res.zipData) {
      console.warn('No zipData in sandbox');
      return;
    }

    const { files: extractedFiles, imageUrls } = await extractFilesFromZipData(res.zipData);

    // Store into state
    setFiles(extractedFiles);
    setImageUrls(imageUrls);
    setFileTree(buildTree(extractedFiles));

    // ---- ✅ CONTINUE TO BOOT WEB CONTAINER ----
    if (webcontainerInstance) {
      await webcontainerInstance.teardown();
    }
    let instance = webcontainerInstance;
    if (!instance) {
      instance = await bootWebContainer(extractedFiles);
    }
    if (!instance) throw new Error("Failed to boot WebContainer");

    const entry = entryCandidates.find((f) => extractedFiles[f.toLowerCase()]);
    if (!entry) throw new Error("No entry file found.");
    setEntryFile(entry);
    setFileContent(extractedFiles[entry]);
    // 3. Install dependencies
    setStatusStep('Installing dependencies...');
    const install = await instance.spawn('npm', ['install']);
    install.output.pipeTo(new WritableStream({
      write(data) {
        bufferedLog(`[npm install]: ${data}`);
      }
    }));
    await install.exit;

    // 4. Install required deps for R3F/GSAP/Three
    setStatusStep('Installing 3D libraries...');
    const extraInstall = await instance.spawn('npm', [
      'install',
      '@react-three/drei@^9.122.0',
      '@react-three/fiber@^8.18.0',
      'three@^0.160.1',
      'gsap@^3.12.5'
    ]);
    extraInstall.output.pipeTo(new WritableStream({
      write(data) {
        bufferedLog(`[extra]: ${data}`);
      }
    }));
    await extraInstall.exit;

    // 5. Start dev server
    setStatusStep('Starting development server...');
    instance.on('server-ready', (port, url) => {
      setStatusStep('Server is ready!');
      setPreviewUrl(url);
      setLoading(false);
    });


    const devServer = await instance.spawn('npm', ['run', 'dev']);
  }




  const bootWebContainer = async (filesToWrite) => {
    if (webcontainerInstance) {
      console.log('[WebContainer] Already booted');
      return webcontainerInstance;
    }

    if (hasBootedRef.current) {
      console.warn('WebContainer already booted');
      return webcontainerInstance;
    }

    hasBootedRef.current = true;

    const instance = await WebContainer.boot();
    setWebcontainerInstance(instance);
    setStatusStep('WebContainer Booted...');

    for (const [name, content] of Object.entries(filesToWrite)) {
      if (!name || name.endsWith('/')) {
        console.warn(`Skipping invalid or directory entry: "${name}"`);
        continue;
      }

      // Ensure parent directory exists
      const pathParts = name.split('/');
      if (pathParts.length > 1) {
        const dirPath = '/' + pathParts.slice(0, -1).join('/');
        await instance.fs.mkdir(dirPath, { recursive: true });
      }

      // Write file safely
      await instance.fs.writeFile('/' + name, content ?? '');
    }

    return instance;
  };



  useEffect(() => {
    return () => {
      if (webcontainerInstance) {
        webcontainerInstance.teardown();
        setWebcontainerInstance(null);
        hasBootedRef.current = false;
      }
    };
  }, []);






  const handleFileSelect = async (filePath) => {
    setSelectedFile(filePath);

    if (webcontainerInstance && filePath) {
      try {
        const content = await webcontainerInstance.fs.readFile('/' + filePath, 'utf-8');
        setFileContent(content);

        // Set new value into Monaco and clear undo stack
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            model.setValue(content);
            model.pushStackElement(); // Clear undo stack
          }
        }
      } catch (err) {
        console.error('Failed to read file from WebContainer:', err);
      }
    }
  };



  const handleDownloadZip = async () => {
    const zip = new JSZip();

    for (const [filename, content] of Object.entries(files)) {
      if (typeof content === 'string') {
        zip.file(filename, content); // text file
      } else if (content instanceof Uint8Array) {
        zip.file(filename, content); // binary file
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };




  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const capture = (type, ...args) => {
      const message = args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');

      // Only add logs containing 'client'
      if (message.includes('client')) {
        setConsoleLogs(prev => prev + `\n[${type.toUpperCase()}] ${message}`);
      }
    };

    console.log = (...args) => {
      capture('log', ...args);
      originalLog(...args);
    };

    console.error = (...args) => {
      capture('error', ...args);
      originalError(...args);
    };

    console.warn = (...args) => {
      capture('warn', ...args);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.scrollTo(0, 0);

    if (isEdit) {
      if (webcontainerInstance) {
        const updatedData = {
          "sec-1": {
            "name": "sec-1",
            "modelTransform": {
              "posX": 1.9999999999999991,
              "posY": 0,
              "posZ": 3.9000000000000004,
              "rotX": 0,
              "rotY": 0,
              "rotZ": 0
            },
            "background": {
              "type": "solid",
              "color1": "#580000",
              "color2": "#350000"
            },
            "lights": [
              {
                "id": 1751443059446.0015,
                "type": "Directional",
                "intensity": 25,
                "color": "#ff3300",
                "position": [
                  2,
                  5,
                  3
                ],
                "castShadow": false,
                "angle": 0,
                "penumbra": 0,
                "distance": 0,
                "decay": 1
              },
              {
                "id": 1751443059446.1401,
                "type": "Ambient",
                "intensity": 28,
                "color": "#803030",
                "position": [
                  0,
                  0,
                  0
                ],
                "castShadow": false,
                "angle": 0,
                "penumbra": 0,
                "distance": 0,
                "decay": 1
              }
            ],
            "selectedAnimation": "01_Sphere_bot_Roll",
            "loopCount": "Infinity"
          },
          "sec-2": {
            "name": "sec-2",
            "modelTransform": {
              "posX": 3.0000000000000004,
              "posY": 0,
              "posZ": 0,
              "rotX": 0,
              "rotY": 0,
              "rotZ": 0
            },
            "background": {
              "type": "solid",
              "color1": "#131313",
              "color2": "#350000"
            },
            "lights": [
              {
                "id": 1751443133070.8755,
                "type": "Directional",
                "intensity": 9.3,
                "color": "#ffffff",
                "position": [
                  88.7,
                  56.1,
                  0
                ],
                "castShadow": false,
                "angle": 0,
                "penumbra": 0,
                "distance": 0,
                "decay": 1
              }
            ],
            "selectedAnimation": "Idle",
            "loopCount": "Infinity"
          }
        }

        updateSceneSettingsFile({
          webcontainerInstance,
          updatedData: updatedData,
          setFiles,
          files,
          setFileTree,
          buildTree,
        });
      }
      document.body.classList.remove('overflow-hidden', 'no-scrollbar');
    } else {
      document.body.classList.add('overflow-hidden', 'no-scrollbar');
    }
  }, [isEdit, webcontainerInstance])

  const handleSaveClick = async () => {
    const zipData = await convertFilesToZipData(files);
    saveSandbox({
      payload: { zipData, modelID: modelInfo._id },
    });
  };

  return (

    <div className={`main-container h-full ${!isEdit && 'overflow-hidden no-scrollbar'} `}>


      {false && (
        <div className="fixed inset-0 z-50 bg-red-900 bg-opacity-90 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-sm font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <Loader
          fullScreen
          statusStep={statusStep}
          logs={consoleLogs}
          onRetry={() => window.location.reload()}
        />
      ) :
        (<>

          {previewUrl && <div className='fixed z-50 bottom-0 right-0 w-fit  p-1 rounded-t-lg flex items-center gap-3'>
            <Button
              onClick={() => setIsEdit(!isEdit)} size='sm'>
              {isEdit ? <X size={14} /> : <Edit3 size={14} />}
              {isEdit ? 'Exit Edit Mode' : 'Edit Code'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">Add Model.jsx</Button>
              </DialogTrigger>
              <AddModelModal
                setModelInfo={setModelInfo}
                webcontainerInstance={webcontainerInstance}
                setFiles={setFiles}
                files={files}
                setFileTree={setFileTree}
              />
            </Dialog>

            <Button onClick={handleSaveClick} disabled={saving} size='sm'>
              {saving ? 'Saving...' : 'Save Sandbox'}
            </Button>
            <Button onClick={handleDownloadZip} size='sm'>
              Download ZIP
            </Button>
            <Button size='sm'>
              <Link
                href={`/webcontainer/connect/${encodeURIComponent(previewUrl)}`}
                size="sm"
                target="_blank"
              >
                Show Preview
              </Link>
            </Button>

          </div>}
          {/* Sandbox Preview  */}
          {webcontainerInstance && <section className={`sandbox-preview relative w-full h-full ${!isEdit ? 'block' : 'hidden'}`}>
            <SandboxPreview logs={consoleLogs} url={previewUrl} webcontainerInstance={webcontainerInstance} />
            {(previewUrl) && <FloatingPanel
              modelPath={modelInfo.url}
              files={files}
              setFiles={setFiles}
              setFileTree={setFileTree}
              buildTree={buildTree}
              webcontainerInstance={webcontainerInstance}
            />
            }
          </section>
          }

          {(isEdit && previewUrl) && <>
            <main className="content-area p-1 ">
              {/* File Tree */}
              <aside className="file-tree-pane">
                {fileTree && (
                  <FileTree tree={fileTree} onSelect={handleFileSelect} selectedFile={selectedFile} />
                )}
              </aside>

              {/* Editor */}
              <section className="editor-pane">
                <h2 className="px-4 py-3 font-semibold text-lg">Repo: {repo}</h2>

                <div className="editor-wrapper">
                  {(selectedFile && imageUrls[selectedFile]) ? (
                    <div className="p-4  rounded max-h-[70vh] overflow-auto">
                      <img
                        src={imageUrls[selectedFile]}
                        alt={selectedFile}
                        className="max-w-full max-h-[70vh] object-contain rounded"
                      />
                    </div>
                  ) : (fileContent || selectedFile) && webcontainerInstance && entryFile ? (
                    <Editor
                      height="100%"
                      width="100%"
                      language={getFileLanguage(selectedFile)}
                      theme="vs-dark"
                      defaultValue={fileContent}
                      onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        monacoRef.current = monaco;
                      }}
                      onChange={async (newCode) => {
                        setFileContent(newCode);
                        if (selectedFile && webcontainerInstance) {
                          await webcontainerInstance.fs.writeFile('/' + selectedFile, newCode);
                          setFiles(prev => ({ ...prev, [selectedFile]: newCode }));
                        }
                      }}

                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        smoothScrolling: true,
                        automaticLayout: true,
                      }}
                    />

                  ) : (
                    <div className="p-4 text-gray-400">Loading editor...</div>
                  )}
                </div>


              </section>
            </main>
            <TerminalWindow webcontainerInstance={webcontainerInstance} logs={consoleLogs} />
          </>}
        </>)
      }


    </div>
  );

}

