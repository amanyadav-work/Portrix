// src/constants/sceneSettings.js

function generateId() {
  return Date.now() + Math.random();
}

export function getSceneSettings() {
  return {
    "section-1": {
      name: "section-1",
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
          id: generateId(),
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
          id: generateId(),
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
    },
  };
}
