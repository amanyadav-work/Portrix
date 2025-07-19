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
import { handleAddSceneRendererFile, handleInjectSceneRenderer } from '@/utils/sandbox';
import useFetch from '@/hooks/useFetch';
import { DropzoneField } from '@/components/DropzoneField';
import { useUser } from '@/contexts/UserContext';
import Loader from '@/components/ui/Loader';

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
        await handleAddSceneRendererFile({
          webcontainerInstance,
          setFiles,
          files,
          setFileTree,
        });

        await handleInjectSceneRenderer({
          webcontainerInstance,
          setFiles,
          modelPath,
          componentPath: './components/SceneRenderer.jsx',
        });

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

  const handleAddModel = async () => {
    if (selectedModel) {
      setModelInfo(selectedModel);
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
      {models?.length > 0 &&
        <div className='grid grid-cols-4 gap-2 mb-4'>
          {models?.map((model) => (
            <div
              key={model._id}
              className="p-2 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setSelectedModel([{
                  name: model.name,
                  url: model.url,
                }]);
              }}
            >
              <img
                src={model.thumbnail || '/placeholder-thumbnail.png'}
                alt={model.name}
                className="w-full h-32 object-cover mb-2"
              />
              <div className="text-sm font-medium">{model.name}</div>
            </div>
          ))}
        </div>
      }
      <div className="space-y-4">
        <DropzoneField
          accept={{ 'model/gltf-binary': ['.glb'] }}
          multiple={false}
          onDrop={setSelectedFiles}
          value={selectedFiles}
        />
      </div>

      <DialogFooter className="pt-4">
        <DialogClose asChild id="btn-modal-popup-close">
          <Button type="button" variant="secondary" disabled={addingModel}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleAddModel} disabled={addingModel}>
          {addingModel ? 'Uploading...' : 'Add Model'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModelModal;
