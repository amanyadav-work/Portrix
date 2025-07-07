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

const AddModelModal = ({
  setModelPath,
  webcontainerInstance,
  setFiles,
  files,
  setFileTree,
  sandboxId=Math.random().toString(36).substring(2, 15), // Default sandboxId if not provided
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { user } = useUser();

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
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        await refetch({
          payload: {
            data: reader.result,
            userId: user._id,
            sandboxId,
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
