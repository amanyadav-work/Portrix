'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { handleAddSceneRendererFile, handleInjectRenderScriptToIndexHtml, handleInjectSceneRenderer } from '@/utils/sandbox';
import useFetch from '@/hooks/useFetch';
import { DropzoneField } from '@/components/DropzoneField';
import { useUser } from '@/contexts/UserContext';
import Loader from '@/components/ui/Loader';
import { cn } from '@/lib/utils';
import { FileBoxIcon } from 'lucide-react';

const AddModelModal = ({
  setModelInfo,
  webcontainerInstance,
  setFiles,
  files,
  setFileTree,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null)
  const { user } = useUser();

  const { data: models, isLoading: allModelLoading } = useFetch({
    url: '/api/model',
    auto: true,
    onSuccess: async (result) => {
      console.log("Models:", result)
    },
    onError: (err) => {
      console.error('Load Model error:', err);
      toast.error('Could not load models');
    },
  });



  const { isLoading: addingModel, refetch: addModel } = useFetch({
    url: '/api/model',
    method: 'POST',
    onSuccess: async (result) => {
      console.log("Model Created:", result)
      const modelPath = result.url;
      setModelInfo(result);

      try {
        await addFilesToWebContainer(modelPath);
        toast.success('Model added!');
        document.getElementById('btn-modal-popup-close')?.click();
      } catch (err) {
        console.error('Renderer error:', err);
        toast.error('Failed to inject model');
      }
    },
    onError: (err) => {
      console.error('Upload error:', err);
      toast.error('Upload failed');
    },
  });

  const addFilesToWebContainer = async (modelPath) => {
    if (!webcontainerInstance) return;
    await handleInjectRenderScriptToIndexHtml({
      webcontainerInstance,
      files,
      setFiles,
      setFileTree,
    });

  };

  const handleAddModel = async () => {
    if (selectedModel) {
      setModelInfo(selectedModel);
      await addFilesToWebContainer(selectedModel.url);
      document.getElementById('btn-modal-popup-close')?.click();
      return;
    }
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        await addModel({
          payload: {
            data: reader.result,
            name: file.name,
          },
        });
      } catch (err) {
        toast.error('Upload failed');
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
    };
  };
  if (allModelLoading) <Loader size={18} />
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload a .glb Model</DialogTitle>
      </DialogHeader>

      {allModelLoading ? (
        <div className="flex justify-center py-10">
          <Loader size={24} />
        </div>
      ) : (
        models?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
            {models.map((model) => {
              const isSelected = selectedModel?.url === model.url;
              return (
                <div
                  key={model._id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    'p-4 border rounded-md cursor-pointer flex flex-col items-center gap-2 transition-all duration-150',
                    isSelected
                      ? 'bg-muted border-primary text-primary'
                      : 'hover:bg-accent hover:border-accent-foreground'
                  )}
                >
                  <FileBoxIcon size={36} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-center truncate w-full">
                    {model.name}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}

      <DropzoneField
        accept={{ 'model/gltf-binary': ['.glb'] }}
        multiple={false}
        onDrop={setSelectedFiles}
        value={selectedFiles}
      />

      {selectedFiles.length > 0 && (
        <p className="text-xs mt-2 text-muted-foreground">
          Selected file: <strong>{selectedFiles[0].name}</strong>
        </p>
      )}

      <DialogFooter className="pt-4">
        <DialogClose asChild id="btn-modal-popup-close">
          <Button type="button" variant="secondary" disabled={addingModel}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleAddModel} disabled={addingModel || (!selectedFiles.length && !selectedModel)}>
          {addingModel ? 'Uploading...' : 'Add Model'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModelModal;
