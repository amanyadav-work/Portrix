'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WebContainer } from '@webcontainer/api'
import stripAnsi from 'strip-ansi';
import { Editor } from '@monaco-editor/react'
import JSZip from 'jszip'
import { FileTree } from '@/components/FileTree.js'
import { buildTree, getFileLanguage, handleAddSceneRendererFile, handleInjectSceneRenderer, updateSceneSettingsFile } from '@/utils/sandbox'
import SandboxPreview from './_components/SandboxPreview'
import TerminalWindow from './_components/TerminalWindow';
import { entryCandidates } from '@/constants/entryCandidates';
import { Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddModelModal from './_components/AddModelModal';
import FloatingPanel from './_components/FloatingPanel';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';





export default function SandboxPage() {
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
  const [modelPath, setModelPath] = useState('')
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const searchParams = useSearchParams()
  const repo = searchParams.get('repo')
  const [error, setError] = useState(null);



  useEffect(() => {
    if (!repo) return;

    const setupSandbox = async () => {
      try {
        setLoading(true);

        // 1. Fetch and unzip repo
        const res = await fetch(`/api/fetch-repo?repo=${repo}`);
        const blob = await res.blob();
        const zip = await blob.arrayBuffer();
        const JSZip = (await import('jszip')).default;
        const zipContent = await JSZip.loadAsync(zip);

        const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md'];
        const binaryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];

        const getExtension = (filename) => {
          const parts = filename.split('.');
          return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
        };

        const files = {};
        await Promise.all(
          Object.keys(zipContent.files).map(async (filename) => {
            const file = zipContent.files[filename];
            if (!file.dir) {
              const shortName = filename.split('/').slice(1).join('/');
              const ext = getExtension(shortName);
              if (textExtensions.includes(ext)) {
                files[shortName] = await file.async('string');
              } else if (binaryExtensions.includes(ext)) {
                files[shortName] = await file.async('uint8array');
                const url = URL.createObjectURL(new Blob([files[shortName]]));
                setImageUrls((prev) => ({ ...prev, [shortName]: url }));
              } else {
                files[shortName] = await file.async('string');
              }
            }
          })
        );

        setFiles(files);
        setFileTree(buildTree(files));

        // 2. Boot WebContainer
        const instance = await WebContainer.boot();
        setWebcontainerInstance(instance);

        for (const [name, content] of Object.entries(files)) {
          const pathParts = name.split('/');
          if (pathParts.length > 1) {
            const dirPath = '/' + pathParts.slice(0, -1).join('/');
            await instance.fs.mkdir(dirPath, { recursive: true });
          }
          await instance.fs.writeFile('/' + name, content ?? '');
        }

        const entry = entryCandidates.find((f) => files[f.toLowerCase()]);
        if (!entry) throw new Error("No entry file found.");
        setEntryFile(entry);
        setFileContent(files[entry]);

        // 3. Install dependencies
        const install = await instance.spawn('npm', ['install']);
        await install.exit;

        const extraInstall = await instance.spawn('npm', [
          'install',
          '@react-three/drei@^9.122.0',
          '@react-three/fiber@^8.18.0',
          'three@^0.160.1',
          'gsap@^3.12.5'
        ]);
        await extraInstall.exit;

        // 4. Run dev server
        instance.on('server-ready', (port, url) => {
          setPreviewUrl(url);
          setLoading(false);
        });

        const devServer = await instance.spawn('npm', ['run', 'dev']);

      } catch (err) {
        console.error(err);
        setError('Failed to set up the sandbox. See console.');
        setLoading(false);
      }
    };

    setupSandbox();
  }, [repo]);


  useEffect(() => {
    if (!webcontainerInstance || !entryFile) return;

    const runDevServer = async () => {
      const install = await webcontainerInstance.spawn('npm', ['install']);
      install.output.pipeTo(new WritableStream({
        write(data) {
          setConsoleLogs(`[npm install] ${stripAnsi(data)}`);
        }
      }));

      await install.exit;

      //  Install required dependencies for 3D rendering
      const extraInstall = await webcontainerInstance.spawn('npm', [
        'install',
        '@react-three/drei@^9.122.0',
        '@react-three/fiber@^8.18.0',
        'three@^0.160.1',
        'gsap@^3.12.5'
      ]);
      extraInstall.output.pipeTo(new WritableStream({
        write(data) {
          setConsoleLogs(`[setup install] ${stripAnsi(data)}`);
        }
      }));

      await extraInstall.exit;


      webcontainerInstance.on('server-ready', (port, url) => {
        setConsoleLogs(`[server-ready] Server running at ${url}`);
        setPreviewUrl(url);
      });



      const devServer = await webcontainerInstance.spawn('npm', ['run', 'dev']);
      devServer.output.pipeTo(new WritableStream({
        write(data) {
          setConsoleLogs(`\n[vite dev] ${stripAnsi(data)}`);
        }
      }));



      return () => {
        if (devServer) {
          devServer.kill();
        }
        if (install) {
          install.kill();
        }
      };
    };

    runDevServer();

    return () => {
      if (webcontainerInstance) {
        webcontainerInstance.teardown?.(); // If supported
      }
    }
  }, [webcontainerInstance, entryFile]);


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

  useEffect(() => {
    window.scrollTo(0, 0);

    if (isEdit) {
       if (webcontainerInstance) {
        const updatedData={
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
  }, [isEdit])


  return (

    <div className={`main-container h-full ${!isEdit && 'overflow-hidden no-scrollbar'} `}>


      {error && (
        <div className="fixed inset-0 z-50 bg-red-900 bg-opacity-90 text-white flex items-center justify-center text-center px-4">
          <div>
            <p className="text-xl font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <Loader
          text={`Installing deps for ${repo}`}
        />
      ) :
        (<>

          {/* Sandbox Preview  */}
          <section className="sandbox-preview relative w-full h-full">
            {previewUrl && <div className='fixed z-50 bottom-0 right-0 w-fit bg-gray-800 text-white p-1 rounded-t-lg flex items-center gap-3'>
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
                  setModelPath={setModelPath}
                  webcontainerInstance={webcontainerInstance}
                  setFiles={setFiles}
                  files={files}
                  setFileTree={setFileTree}
                />
              </Dialog>

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
            {webcontainerInstance && <div className={`${!isEdit ? 'visible' : 'invisible'}`}>
              <SandboxPreview logs={consoleLogs} url={previewUrl} webcontainerInstance={webcontainerInstance} />
              {( previewUrl) && <FloatingPanel
                modelPath={modelPath}
                files={files}
                setFiles={setFiles}
                setFileTree={setFileTree}
                buildTree={buildTree}
                webcontainerInstance={webcontainerInstance}
              />
              }
            </div>
            }
          </section>

          {(isEdit && previewUrl) && <>
            <main className="content-area p-1 bg-black">
              {/* File Tree */}
              <aside className="file-tree-pane">
                {fileTree && (
                  <FileTree tree={fileTree} onSelect={handleFileSelect} selectedFile={selectedFile} />
                )}
              </aside>

              {/* Editor */}
              <section className="editor-pane">
                <h2 className="px-4 py-3 text-white font-semibold text-lg">Repo: {repo}</h2>

                <div className="editor-wrapper">
                  {(selectedFile && imageUrls[selectedFile]) ? (
                    <div className="p-4 bg-gray-900 rounded max-h-[70vh] overflow-auto">
                      <img
                        src={imageUrls[selectedFile]}
                        alt={selectedFile}
                        className="max-w-full max-h-[70vh] object-contain rounded"
                      />
                    </div>
                  ) : (fileContent || selectedFile) && webcontainerInstance && entryFile ? (
                    <Editor
                      height="70vh"
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

