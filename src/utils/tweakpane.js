// src/utils/tweakpaneUtils.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Function to get animation names from GLTF
export function getAllAnimationNames(path) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      path,
      (gltf) => {
        const animationNames = gltf.animations.map(clip => clip.name);
        resolve(animationNames);
      },
      undefined,
      (error) => {
        reject(`Failed to load model: ${error.message}`);
      }
    );
  });
}

export const normalizeLightType = (type) => {
  if (!type) return "";
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (capitalized === "Spot") return "SpotLight";
  if (capitalized === "Directional") return "DirectionalLight";
  if (capitalized === "Point") return "PointLight";
  if (capitalized === "Ambient") return "AmbientLight";
  return capitalized;
};

export const lightPropsByType = {
  SpotLight: ['color', 'intensity', 'position', 'castShadow', 'angle', 'penumbra', 'distance'],
  DirectionalLight: ['color', 'intensity', 'position', 'castShadow'],
  PointLight: ['color', 'intensity', 'position', 'castShadow', 'distance', 'decay'],
  AmbientLight: ['color', 'intensity'],
};

export const defaultSectionState = () => ({
  modelTransform: {
    posX: 0,
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  },
  background: {
    type: "gradient",
    color1: "#580000",
    color2: "#350000",
  },
  lights: [
    {
      id: Date.now() + Math.random(),
      type: "Directional",
      intensity: 25,
      color: "#ff3300",
      position: [2, 5, 3],
      castShadow: false,
      angle: 0,
      penumbra: 0,
      distance: 0,
      decay: 1,
    },
    {
      id: Date.now() + Math.random(),
      type: "Ambient",
      intensity: 28,
      color: "#803030",
      position: [0, 0, 0],
      castShadow: false,
      angle: 0,
      penumbra: 0,
      distance: 0,
      decay: 1,
    },
  ],
  selectedAnimation: "Idle",
  loopCount: "Infinity",
});


export function createReactiveObject(obj, onChange) {
  return new Proxy(obj, {
    get(target, prop) {
      const val = target[prop];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        return createReactiveObject(val, onChange);
      }
      return val;
    },
    set(target, prop, value) {
      target[prop] = value;
      onChange();
      return true;
    },
  });
}
