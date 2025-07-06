'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUrl('');
    setError('');
  };

  async function uploadGLB(file, modelId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: reader.result, modelId }),
          });

          const result = await res.json();

          if (res.ok && result.url) {
            resolve(result.url);
          } else {
            reject(result.error || 'Upload failed');
          }
        } catch (err) {
          reject('Upload error: ' + err.message);
        }
      };

      reader.onerror = () => reject('File reading failed');
    });
  }

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setUrl('');

    try {
      const modelId = `model-${Date.now()}`;
      const uploadedUrl = await uploadGLB(file, modelId);
      setUrl(uploadedUrl);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload a .glb File</h2>

      <input type="file" accept=".glb" onChange={handleFileChange} />
      <br /><br />

      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>{error}</p>
      )}

      {url && (
        <div style={{ marginTop: 20 }}>
          <strong>Uploaded URL:</strong>
          <p>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          </p>
        </div>
      )}
    </div>
  );
}
