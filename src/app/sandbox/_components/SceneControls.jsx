import React, { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { updateSceneSettingsFile } from "@/utils/sandbox";
import { createReactiveObject, defaultSectionState, getAllAnimationNames, lightPropsByType, normalizeLightType } from "@/utils/tweakpane";
import { Move, Plus } from "lucide-react";
import ScrollShadow from "@/components/ScrollShadow";
import { Button } from "@/components/ui/button";


export default function Tweakpane({ modelPath, files,
  setFiles,
  setFileTree,
  buildTree,
  sections, setSections,
  selectedSectionKey, setSelectedSectionKey,
  setDialogOpen,
  webcontainerInstance }) {

  const [animations, setAnimations] = useState(["Idle", "Walk", "Run", "Jump"])

  const paneRef = useRef(null);
  const containerRef = useRef(null);

  const reactiveRef = useRef(null);



  useEffect(() => {
    if (webcontainerInstance) {

      updateSceneSettingsFile({
        webcontainerInstance,
        updatedData: sections,
        setFiles,
        files,
        setFileTree,
        buildTree,
      });
    }
  }, [sections])

  useEffect(() => {
    if (!modelPath) return;
    getAllAnimationNames(modelPath)
      .then((names) => {
        setAnimations([...names, ...animations]);
      })
      .catch((error) => {
        console.error("Failed to load animations:", error);
      });
  }, [modelPath])


  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.dispose();
      paneRef.current = null;
    }

    const pane = new Pane({ container: containerRef.current, title: "Settings" });
    paneRef.current = pane;

    // Use actual state object directly, NOT deep clone
    const currentSection = sections[selectedSectionKey];
    const onChange = () => {
      setSections((prev) => ({
        ...prev,
        [selectedSectionKey]: { ...reactiveRef.current },
      }));
    };


    // Initialize reactiveRef.current directly to currentSection (no cloning)
    reactiveRef.current = createReactiveObject(currentSection, onChange);

    // MODEL TRANSFORM folder
    const modelTransformFolder = pane.addFolder({ title: "Model Transform" });
    Object.keys(reactiveRef.current.modelTransform).forEach((key) => {
      modelTransformFolder.addBinding(reactiveRef.current.modelTransform, key, {
        step: 0.1,
        min: -100,
        max: 100,
      });
    });

    // BACKGROUND folder
    const backgroundFolder = pane.addFolder({ title: "Background" });
    backgroundFolder.addBinding(reactiveRef.current.background, "type", {
      options: { solid: "solid", gradient: "gradient" },
    });
    backgroundFolder.addBinding(reactiveRef.current.background, "color1");
    if (reactiveRef.current.background.type === "gradient") {
      backgroundFolder.addBinding(reactiveRef.current.background, "color2");
    }

    // LIGHTS folder
    const lightsFolder = pane.addFolder({ title: "Lights" });

    reactiveRef.current.lights.forEach((light, idx) => {
      const lightFolder = lightsFolder.addFolder({ title: `Light ${idx + 1} (${light.type})` });

      lightFolder.addBinding(light, "type", {
        options: { directional: "Directional", point: "Point", spot: "Spot", ambient: "Ambient" },
      }).on("change", (ev) => {
        const newType = ev.value;
        const typeKey = normalizeLightType(newType);
        const props = lightPropsByType[typeKey] || [];

        // **Instead of replacing light object, mutate it in-place**
        light.type = newType;

        // Reset properties based on new type but only those missing or undefined
        // Keep existing values intact if present
        props.forEach(prop => {
          if (light[prop] === undefined) {
            // Default values by property type
            if (prop === 'color') light[prop] = "#ffffff";
            else if (prop === 'position') light[prop] = [0, 0, 0];
            else if (prop === 'castShadow') light[prop] = false;
            else if (prop === 'decay') light[prop] = 1;
            else light[prop] = 0;
          }
        });

        onChange(); // Trigger update to React state
      });

      const typeKey = normalizeLightType(light.type);
      const props = lightPropsByType[typeKey] || [];

      if (props.includes("intensity"))
        lightFolder.addBinding(light, "intensity", { min: 0, max: 10, step: 0.1 }).on("change", onChange);
      if (props.includes("color"))
        lightFolder.addBinding(light, "color").on("change", onChange);

      if (props.includes("position")) {
        // Use direct binding to light.position array elements with reactive set
        lightFolder
          .addBinding(
            {
              get x() {
                return light.position[0];
              },
              set x(v) {
                light.position[0] = v;
                onChange();
              },
            },
            "x",
            { step: 0.1, min: -100, max: 100 }
          );
        lightFolder
          .addBinding(
            {
              get y() {
                return light.position[1];
              },
              set y(v) {
                light.position[1] = v;
                onChange();
              },
            },
            "y",
            { step: 0.1, min: -100, max: 100 }
          );
        lightFolder
          .addBinding(
            {
              get z() {
                return light.position[2];
              },
              set z(v) {
                light.position[2] = v;
                onChange();
              },
            },
            "z",
            { step: 0.1, min: -100, max: 100 }
          );
      }

      if (props.includes("castShadow"))
        lightFolder.addBinding(light, "castShadow").on("change", onChange);

      if (props.includes("angle")) {
        if (light.angle === undefined) light.angle = 0;
        lightFolder.addBinding(light, "angle", { min: 0, max: Math.PI / 2, step: 0.01 }).on("change", onChange);
      }
      if (props.includes("penumbra")) {
        if (light.penumbra === undefined) light.penumbra = 0;
        lightFolder.addBinding(light, "penumbra", { min: 0, max: 1, step: 0.01 }).on("change", onChange);
      }
      if (props.includes("distance")) {
        if (light.distance === undefined) light.distance = 0;
        lightFolder.addBinding(light, "distance", { min: 0, max: 100, step: 0.1 }).on("change", onChange);
      }
      if (props.includes("decay")) {
        if (light.decay === undefined) light.decay = 1;
        lightFolder.addBinding(light, "decay", { min: 0, max: 5, step: 0.01 }).on("change", onChange);
      }

      lightFolder.addButton({ title: "Delete" }).on("click", () => {
        setSections((prev) => {
          const current = prev[selectedSectionKey];
          const newLights = current.lights.filter((_, i) => i !== idx);
          return {
            ...prev,
            [selectedSectionKey]: {
              ...current,
              lights: newLights,
            },
          };
        });
      });
    });

    // ANIMATION folder
    const animationFolder = pane.addFolder({ title: "Animation" });

    animationFolder.addBinding(reactiveRef.current, "selectedAnimation", {
      label: "Animation Tyoe",
      options: animations.reduce((acc, cur) => {
        acc[cur] = cur;
        return acc;
      }, {}),
    });

    animationFolder.addBinding(reactiveRef.current, "loopCount", {
      label: "Loop Count",
      options: {
        Infinity: "Infinity",
        Once: 1,
        Twice: 2,
        Thrice: 3,
        "5 times": 5,
        "10 times": 10,
        "15 times": 15,
      },
    });

    return () => {
      pane.dispose();
      paneRef.current = null;
      reactiveRef.current = null;
    };
  }, [selectedSectionKey, sections[selectedSectionKey].lights.length, sections[selectedSectionKey]?.lights.map(light => light.type).join("|"), sections[selectedSectionKey].background.type, animations.length]);

  const onSectionChange = (e) => {
    setSelectedSectionKey(e.target.value);
  };



  const addLight = () => {
    setSections((prev) => {
      const current = prev[selectedSectionKey];
      const newLight = {
        id: Date.now() + Math.random(),
        type: "Directional",
        intensity: 1,
        color: "#ffffff",
        position: [0, 0, 0],
        castShadow: false,
        angle: 0,
        penumbra: 0,
        distance: 0,
        decay: 1,
      };
      return {
        ...prev,
        [selectedSectionKey]: {
          ...current,
          lights: [...current.lights, newLight],
        },
      };
    });
  };

  const exportJson = () => {
    const jsonStr = JSON.stringify(sections, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "sections-config.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-t-md">
        <div className="w-full flex items-center gap-2">

          <select
            value={selectedSectionKey}
            onChange={onSectionChange}
            className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-md text-xs px-2 py-1 cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            aria-label="Select Section"
          >
            {Object.entries(sections).map(([key, section]) => (
              <option key={key} value={key}>
                {section.name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setDialogOpen(true)}
            size='sm'
            title="Add Section"
          >
            Section  <Plus size={12} />
          </Button>

          <Button
            onClick={addLight}
            disabled={!selectedSectionKey}
            size='sm'
            title="Add Light"
          >
            Light <Plus size={12} />
          </Button>

          <Button
            onClick={exportJson}
            title="Export Config"
            size='sm'
          >
            Export
          </Button>
        </div>

        <Button
          className="drag-handle cursor-move"
          title="Drag btn"
          size='sm'
        >
          <Move size={12} />
        </Button>
      </div>

      {/* Tweakpane container */}
      <ScrollShadow className="h-96 w-full no-scrollbar overflow-auto">
        <div ref={containerRef} className="h-96" />
      </ScrollShadow>
    </>
  );


}
