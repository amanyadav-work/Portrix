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

const AddModelModal = ({ setModelPath, webcontainerInstance, setFiles, files, setFileTree }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data, error, isLoading, refetch } = useFetch({
    url: '/api/upload',
    method: 'POST',
    withAuth: false,
    auto: false,
    onSuccess: async (result) => {
      const modelPath = result.url;
      setModelPath(modelPath);

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
    if (selectedFiles.length === 0) {
      toast.error('Please select a .glb file');
      return;
    }

    const file = selectedFiles[0];
    const modelId = `model-${Date.now()}`;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        await refetch({
          payload: {
            data: reader.result,
            modelId,
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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload a .glb Model</DialogTitle>
      </DialogHeader>

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
          <Button type="button" variant="secondary" disabled={isLoading}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleAddModel} disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Add Model'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddModelModal;
