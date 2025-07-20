import React, { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { updateSceneSettingsFile } from "@/utils/sandbox";
import { createReactiveObject, defaultSectionState, getAllAnimationNames, lightPropsByType, normalizeLightType } from "@/utils/tweakpane";
import { Lock, Move, Plus } from "lucide-react";
import ScrollShadow from "@/components/ScrollShadow";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "@/components/ui/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import EditSheetContent from "../[slug]/_components/EditSheet";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  lightCount: z.coerce.number().int().min(0).max(10),
});


export default function Tweakpane({
  dragEnabled,
  setDragEnabled,
  modelPath, files,
  setFiles,
  setFileTree,
  buildTree,
  sections, setSections,
  selectedSectionKey, setSelectedSectionKey,
  setDialogOpen,
  webcontainerInstance }) {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: sections[selectedSectionKey]?.name ?? "",
      lightCount: sections[selectedSectionKey]?.lights?.length ?? 0
    }
  });


  const onSubmit = (data) => {
    setSections((prev) => {
      const current = prev[selectedSectionKey];
      const newKey = data.name;
      const currentLights = current.lights ?? [];
      const currentLength = currentLights.length;
      const targetLength = data.lightCount;

      let newLights;

      if (targetLength > currentLength) {
        const toAdd = Array(targetLength - currentLength).fill(0).map(() => ({
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
        }));
        newLights = [...currentLights, ...toAdd];
      } else if (targetLength < currentLength) {
        newLights = currentLights.slice(0, targetLength); // delete from the end
      } else {
        newLights = currentLights;
      }

      // If name didn't change
      if (newKey === selectedSectionKey) {
        return {
          ...prev,
          [selectedSectionKey]: {
            ...current,
            name: data.name,
            lights: newLights,
          },
        };
      }

      // Name changed = key change
      const { [selectedSectionKey]: _, ...rest } = prev;

      return {
        ...rest,
        [newKey]: {
          ...current,
          name: newKey,
          lights: newLights,
        },
      };
    });

    setSelectedSectionKey(data.name);
    reset({
      name: data.name,
      lightCount: (sections[data.name] ?? sections[selectedSectionKey])?.lights?.length ?? 0,
    });
  };



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
    reset({
      name: sections[selectedSectionKey]?.name ?? "",
      lightCount: sections[selectedSectionKey]?.lights?.length ?? 0,
    });
  }, [selectedSectionKey, reset, sections]);


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

  console.log(selectedSectionKey, sections)



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

          <Select
            value={selectedSectionKey}
            onValueChange={setSelectedSectionKey}
          >
            <SelectTrigger className="w-full select-none text-xs">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sections).map(([key, section]) => (
                <SelectItem key={key} value={key}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setDialogOpen(true)}
            title="Add Section"
          >
            <Plus size={15} />
          </Button>


          <Popover>
            <PopoverTrigger asChild>
              <Button
                title="Edit Section"
              >
                <Plus size={15} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}>
                <FormField
                  id="name"
                  label="Section Name"
                  register={register}
                  errors={errors}
                />

                <FormField
                  id="lightCount"
                  label="Number of Lights to Add"
                  register={register}
                  errors={errors}
                  type="number"
                  min={0}
                  max={10}
                />

                <Button type="submit" size="sm" className="w-full">
                  Save Changes
                </Button>
              </form>
            </PopoverContent>
          </Popover>


          <Sheet>
            <SheetTrigger> <Plus size={15} /></SheetTrigger>
            <EditSheetContent />
          </Sheet>
          <Button
            onClick={exportJson}
            title="Export Config"
            size='sm'
          >
            Export
          </Button>
        </div>

        <Button v
          onClick={() => setDragEnabled((prev) => !prev)}
          className={`${dragEnabled ? "bg-transparent text-background" : "bg-muted text-foreground"} h-full hover:bg-muted/20`}
          title={dragEnabled ? "Disable Drag" : "Enable Drag"}
          size="sm"
        >
          {dragEnabled ? <Move size={16} /> : <Lock size={16} />}
        </Button>


      </div>

      {/* Tweakpane container */}
      <ScrollShadow className="border rounded-sm w-full no-scrollbar overflow-auto">
        <div ref={containerRef} className="h-96" />
      </ScrollShadow>
    </>
  );


}
