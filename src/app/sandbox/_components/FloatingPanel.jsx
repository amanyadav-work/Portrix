'use client';
import { defaultSectionState } from "@/utils/tweakpane";
import { useRef, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import Draggable from 'react-draggable';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tweakpane from "./SceneControls";

const sectionSchema = z.object({
    id: z
        .string()
        .min(1, "Section ID is required")
        .regex(/^[a-z0-9\-]+$/, "Use lowercase letters, numbers, and dashes only"),
});



const FloatingPanel = ({ modelPath, files,
    setFiles,
    setFileTree,
    buildTree,
    webcontainerInstance }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const dragRef = useRef(null); // 1. Create a ref
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(sectionSchema),
    });

    const [sections, setSections] = useState({});
    const [selectedSectionKey, setSelectedSectionKey] = useState(null);
    const initializeSection = () => {
        setSections({ [inputValue]: { name: inputValue, ...defaultSectionState() } });
        setSelectedSectionKey(inputValue);
        setDialogOpen(false);
        setInputValue("")
        console.log("Section initialized:", sections);
    };

    const onSubmit = (data) => {
        const id = data.id;

        if (sections[id]) {
            alert("A section with this ID already exists.");
            return;
        }

        const newSection = {
            name: id,
            ...defaultSectionState(),
        };

        setSections((prev) => ({
            ...prev,
            [id]: newSection,
        }));

        setSelectedSectionKey(id);
        setDialogOpen(false);
        reset();
    };

    return (
        <>
            <Draggable bounds="parent" nodeRef={dragRef} handle=".drag-handle">
                <div ref={dragRef}
                    className="absolute top-20 right-20 z-50 text-gray-800 shadow-lg rounded-md w-[320px]"
                >
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        {Object.keys(sections).length === 0 && <div className="h-fit rounded-md bg-white p-4 flex flex-col gap-2 drag-handle cursor-move">
                            <h2 className="text-lg font-semibold">Scene Controls</h2>
                            <p className="text-sm text-gray-500">Manage your 3D scene sections and files.</p>
                            <DialogTrigger asChild>
                                <Button size="sm" disabled={Object.keys(sections).length > 0}>
                                    Create Section
                                </Button>
                            </DialogTrigger>
                        </div>
                        }
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create First Section</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                                <Input
                                    placeholder="Enter section ID"
                                    {...register("id")}
                                    autoFocus
                                />
                                {errors.id && (
                                    <p className="text-red-500 text-sm">{errors.id.message}</p>
                                )}

                                <DialogFooter>
                                    <Button type="submit">Create</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>

                    </Dialog>
                    {sections && 
                        Object.keys(sections).length > 0
                        && <Tweakpane
                            modelPath={modelPath}
                            files={files}
                            setFiles={setFiles}
                            setFileTree={setFileTree}
                            buildTree={buildTree}
                            setDialogOpen={setDialogOpen}
                            webcontainerInstance={webcontainerInstance}
                            sections={sections}
                            setSections={setSections}
                            selectedSectionKey={selectedSectionKey}
                            setSelectedSectionKey={setSelectedSectionKey}
                        />}
                </div>
            </Draggable>
        </>

    )
}

export default FloatingPanel
