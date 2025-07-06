'use client';

import { useParams } from 'next/navigation';
import SandboxPreview from '@/app/sandbox/_components/SandboxPreview';

export default function ConnectToWebContainerPage() {
    const params = useParams();
    const encodedUrl = params.id;
    const previewUrl = decodeURIComponent(encodedUrl);
   

    return (
        <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
            {/* <h1 className="text-xl font-bold mb-4">{status}</h1>
      <p className="text-gray-400 text-sm">
        This page tries to re-establish connection to the running project.
      </p> */}
            <div className="flex-1 w-full">
                <SandboxPreview url={previewUrl} />
            </div>
        </div>
    );
}
