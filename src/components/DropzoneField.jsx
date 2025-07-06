import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';

export const DropzoneField = ({
  multiple = false,
  accept,
  onDrop: externalOnDrop,
  value,
}) => {
  const [internalFiles, setInternalFiles] = useState([]);
  const files = value || internalFiles;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (!value) {
        setInternalFiles(acceptedFiles);
      }
      if (externalOnDrop) {
        externalOnDrop(acceptedFiles);
      }
    },
    [externalOnDrop, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple,
    accept,
  });

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          {isDragActive
            ? 'Drop the file(s) here...'
            : 'Drag & drop files here, or click to browse'}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700">
            Selected file{files.length > 1 ? 's' : ''}:
          </span>
          <ul className="text-sm text-gray-600 space-y-1">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};