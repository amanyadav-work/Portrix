import { getSceneSettings } from "@/constants/sceneSettingsTemplate";


/**
 * Creates SceneRenderer.jsx in the in-browser file system and updates UI state.
 * 
 * @param {object} options
 * @param {object} options.webcontainerInstance - WebContainer FS instance
 * @param {string} options.modelPath - Path to the .glb model (e.g., "/models/Compressed-Sphere-Bot.glb")
 * @param {Function} options.setFiles - State setter for the virtual file map
 * @param {Function} options.setFileTree - State setter for the file tree
 * @param {Function} options.buildTree - Function that returns a new file tree object
 */


/**
 * Creates SceneRenderer.jsx and sceneSettings.json
 */




export function buildTree(items) {
  const root = {};

  Object.keys(items).forEach((filePath) => {
    const parts = filePath.split('/'); // Split the file path by '/'
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        // Create a directory or file
        current[part] = index === parts.length - 1 ? { __type: 'blob' } : {}; // Mark last part as a file
      }
      current = current[part]; // Move into the current part
    });
  });

  return root;
}



export const handleAddSceneRendererFile = async ({
  webcontainerInstance,
  setFiles,
  files,
  setFileTree,
}) => {
  if (!webcontainerInstance) {
    console.error("Missing required parameters: webcontainerInstance");
    return;
  }

  const jsxPath = '/src/components/SceneRenderer.jsx';
  const jsonPath = '/sceneSettings.json';


  const defaultSceneSettings = getSceneSettings();
const modelContent = `
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import sceneSettingsJson from '/sceneSettings.json'

gsap.registerPlugin(ScrollTrigger)

import { useThree } from '@react-three/fiber'

function AnimatedScene({ modelPath, activeSection, sceneSettings }) {
  const meshRef = useRef()
  const { scene: gltfScene } = useGLTF(modelPath)
  useGLTF.preload(modelPath)

  const { scene: threeScene } = useThree()
  const target = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler()
  }).current

  const [lightStates, setLightStates] = useState([])

  useEffect(() => {
    if (!activeSection) return
    const section = sceneSettings[activeSection]
    if (!section || !section.modelTransform) return

    const { modelTransform, background, lights } = section

    gsap.to(target.position, {
      x: modelTransform.posX,
      y: modelTransform.posY,
      z: modelTransform.posZ,
      duration: 1,
      ease: 'power1.out'
    })

    gsap.to(target.rotation, {
      x: modelTransform.rotX,
      y: modelTransform.rotY,
      z: modelTransform.rotZ,
      duration: 1,
      ease: 'power1.out'
    })

    if (background.type === 'solid') {
      const bgColor = new THREE.Color(background.color1)
      if (!threeScene.background) {
        threeScene.background = new THREE.Color(bgColor)
      }

      const current = threeScene.background
      gsap.to(current, {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b,
        duration: 1,
        onUpdate: () => {
          threeScene.background.setRGB(current.r, current.g, current.b)
        }
      })
    } else {
      threeScene.background = null
    }

    setLightStates(lights || [])
  }, [activeSection, threeScene, sceneSettings])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(target.position, 0.1)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, target.rotation.x, 0.1)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, target.rotation.y, 0.1)
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, target.rotation.z, 0.1)
    }
  })

  return (
    <>
      {lightStates.map((light) => {
        const props = {
          key: light.id,
          position: light.position,
          intensity: light.intensity,
          color: light.color,
          castShadow: light.castShadow
        }
        switch (light.type) {
          case 'Directional':
            return <directionalLight {...props} />
          case 'Point':
            return <pointLight {...props} />
          case 'Ambient':
            return <ambientLight {...props} />
          case 'Spot':
            return (
              <spotLight
                {...props}
                angle={light.angle || Math.PI / 6}
                penumbra={light.penumbra || 0}
                decay={light.decay || 1}
                distance={light.distance || 0}
              />
            )
          default:
            return null
        }
      })}
      <primitive object={gltfScene} ref={meshRef} />
    </>
  )
}

export default function SceneRenderer({ modelPath = 'https://white-deane-36.tiiny.site/models/Compressed-Sphere-Bot.glb' }) {
  const [sceneSettings, setSceneSettings] = useState(sceneSettingsJson);
  const [activeSection, setActiveSection] = useState(Object.values(sceneSettings)[0].name);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event?.data?.type) return

      if (event.data.type === "UPDATE_SCENE_SETTINGS") {
        setSceneSettings(event.data.data)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sectionList = Object.values(sceneSettings)

      sectionList.forEach((section, index, arr) => {
        ScrollTrigger.create({
          trigger: \`#\${section.name}\`,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(section.name),
          onEnterBack: () => setActiveSection(section.name),
        })
      })
    })
    return () => ctx.revert()
  }, [sceneSettings])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none'
      }}
    >
      <Canvas
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 10], fov: 50 }}
        shadows
      >
        <AnimatedScene modelPath={modelPath} activeSection={activeSection} sceneSettings={sceneSettings} />
      </Canvas>
    </div>
  )
}
`


  try {
    // Create the JSX file
    await webcontainerInstance.fs.mkdir('/src/components', { recursive: true });
    await webcontainerInstance.fs.writeFile(jsxPath, modelContent);

    const jsxRelativePath = jsxPath.slice(1);
    setFiles(prev => ({ ...prev, [jsxRelativePath]: modelContent }));

    // Create the JSON file in root
    const jsonContent = JSON.stringify(defaultSceneSettings, null, 2);
    await webcontainerInstance.fs.writeFile(jsonPath, jsonContent);

    const jsonRelativePath = jsonPath.slice(1);
    const updatedFiles = {
      ...files,
      [jsxRelativePath]: modelContent,
      [jsonRelativePath]: JSON.stringify(defaultSceneSettings, null, 2),
    };

    setFiles(updatedFiles);
    setFileTree(buildTree(updatedFiles)); // ✅ use updated object directly

  } catch (error) {
    console.error('Error creating SceneRenderer.jsx or sceneSettings.json:', error);
  }
};




export async function handleInjectSceneRenderer({
  webcontainerInstance,
  setFiles,
  modelPath,
  componentPath = './components/SceneRenderer.jsx', // default import path
}) {
  if (!webcontainerInstance || !modelPath) return;

  const candidates = [
    'index.jsx',
    'index.js',
    'main.js',
    'src/index.jsx',
    'src/index.js',
    'src/main.jsx',
    'src/main.js',
  ];

  let indexFile = null;
  for (const candidate of candidates) {
    try {
      await webcontainerInstance.fs.readFile('/' + candidate, 'utf-8');
      indexFile = candidate;
      break;
    } catch {
      // not found, try next
    }
  }

  if (!indexFile) {
    console.error('No suitable index file found in the project.');
    return;
  }

  try {
    let content = await webcontainerInstance.fs.readFile('/' + indexFile, 'utf-8');

    // Ensure import exists
    if (!content.includes('SceneRenderer')) {
      content = `import SceneRenderer from '${componentPath}';\n` + content;
    }

    // Find the <StrictMode>... block and inject <SceneRenderer /> at the end
    const renderMatch = content.match(/createRoot\(([\s\S]+?)\)\.render\(\s*([\s\S]+?)\)/m);

    if (renderMatch) {
      const [fullMatch, rootEl, renderBody] = renderMatch;

      if (!renderBody.includes('<SceneRenderer')) {
        // Inject just before </StrictMode>
        const updatedRenderBody = renderBody.replace(
          /<\/StrictMode>/,
          `  <SceneRenderer modelPath="${modelPath}"/>\n  </StrictMode>`
        );

        const newRender = `createRoot(${rootEl}).render(${updatedRenderBody})`;
        content = content.replace(fullMatch, newRender);
      }
    }



    await webcontainerInstance.fs.writeFile('/' + indexFile, content);

    setFiles(prev => ({ ...prev, [indexFile]: content }));


  } catch (error) {
    console.error('Error injecting SceneRenderer:', error);
  }
}


export const handleAddHelloWorldFile = async () => {
  if (!webcontainerInstance) return;

  const basePath = '/src/components';
  const baseName = 'HelloWorld';
  const extension = '.jsx';
  let fileIndex = 0;
  let filePath = `${basePath}/${baseName}${extension}`;

  // Ensure the directory exists
  await webcontainerInstance.fs.mkdir(basePath, { recursive: true });

  // Loop to avoid overwriting existing file
  while (true) {
    try {
      await webcontainerInstance.fs.readFile(filePath, 'utf-8');
      fileIndex++;
      filePath = `${basePath}/${baseName}${fileIndex}${extension}`;
    } catch {
      break; // File doesn't exist, so we can use this path
    }
  }

  const componentName = `${baseName}${fileIndex || ''}`;
  const fileContent = `import React from 'react';

export default function ${componentName}() {
  return <div>Hello, World!</div>;
}
`;

  try {
    await webcontainerInstance.fs.writeFile(filePath, fileContent);

    const relativePath = filePath.replace(/^\//, ''); // Remove leading slash
    setfilesss(prev => ({ ...prev, [relativePath]: fileContent }));
    const updatedTree = buildTree({ ...filesss, [relativePath]: fileContent });
    setFileTree(updatedTree);

  } catch (error) {
    console.error('Error creating HelloWorld:', error);
  }
};


export const handleInjectRenderScriptToIndexHtml = async ({
  webcontainerInstance,
  files,
  setFiles,
  setFileTree,
}) => {
  if (!webcontainerInstance) return;

  const indexPath = '/index.html';

  try {
    // Read existing index.html content
    let indexContent = await webcontainerInstance.fs.readFile(indexPath, 'utf-8');

    const scriptContent = `
<script>
  // Render function as you provided
  function renderExternal() {
    if (window.HelloWorld && window.React && window.ReactDOM) {
      const containerId = 'external-component-container';
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
      }
      ReactDOM.render(
        React.createElement(window.HelloWorld),
        container
      );
    } else {
      setTimeout(renderExternal, 50);
    }
  }
  async function fetchAndRenderComponent(id = 'helloWorld') {
    try {
      const res = await fetch(\`${window.location.origin}/api/component/\${id}\`);
      if (!res.ok) throw new Error(\`Failed to fetch component \${id}\`);
      const data = await res.json();
      const code = data.code; // JSX string
      const compiledCode = Babel.transform(code, { presets: ['react'] }).code;
      const exports = {};
      const module = { exports };
      const func = new Function('React', 'module', 'exports', compiledCode);
      func(React, module, exports);
      window.HelloWorld = module.exports.default;
      renderExternal();
    } catch (error) {
      console.error('Error fetching or rendering component:', error);
    }
  }
  fetchAndRenderComponent('helloWorld');
</script>`;

    // Inject the script before closing </body> tag if exists, else at the end
    if (indexContent.includes('</body>')) {
      indexContent = indexContent.replace('</body>', `${scriptContent}\n</body>`);
    } else {
      indexContent += scriptContent;
    }

    // Write back updated index.html
    await webcontainerInstance.fs.writeFile(indexPath, indexContent);

    // Update React state files + fileTree
    setFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles, ['index.html']: indexContent };
      setFileTree(buildTree(updatedFiles));
      return updatedFiles;
    });
  } catch (error) {
    console.error('Failed to inject render script into index.html:', error);
  }
};




export const updateSceneSettingsFile = async ({
  webcontainerInstance,
  updatedData,
  setFiles,
  files,
  setFileTree,
}) => {
  if (!webcontainerInstance || !updatedData) {
    console.error("Missing WebContainer instance or update data");
    return;
  }

  const filePath = '/sceneSettings.json';

  try {
    // Convert updated data to pretty JSON
    const jsonContent = JSON.stringify(updatedData, null, 2);

    // Write to file system
    // await webcontainerInstance.fs.writeFile(filePath, jsonContent);

    // Update file state
    const relativePath = filePath.slice(1); // remove leading slash
    setFiles(prev => ({ ...prev, [relativePath]: jsonContent }));

    // Update file tree
    const updatedTree = buildTree({ ...files, [relativePath]: jsonContent });
    setFileTree(updatedTree);

    const iframe = document.getElementById("preview-iframe");
    if (iframe && iframe.contentWindow) {
      const serializableData = JSON.parse(JSON.stringify(updatedData)); // Safe clone

      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_SCENE_SETTINGS",
          data: serializableData,
        },
        "*"
      );

    }

  } catch (error) {
    console.error('Error updating sceneSettings.json:', error);
  }
};


export const getFileLanguage = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jsx':
    case 'tsx':
      return 'javascriptreact'; // For JSX/TSX files
    case 'css':
      return 'css'; // For CSS files
    case 'html':
      return 'html'; // For HTML files
    case 'json':
      return 'json'; // For JSON files
    case 'js':
    case 'ts':
      return 'javascript'; // For JS/TS files
    default:
      return 'plaintext'; // Default for unknown types
  }
}
