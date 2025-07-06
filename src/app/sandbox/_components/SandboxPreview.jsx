// components/SandboxPreview.jsx
'use client'
import { useEffect, useRef, useState } from 'react'
import TerminalWindow from './TerminalWindow'

export default function SandboxPreview({ logs, url }) {
  const iframeRef = useRef(null)
  const [hasIframe, setHasIframe] = useState(false)

  useEffect(() => {
    console.log('Setting iframe source to:', url)
    if (url && !hasIframe) {
      setHasIframe(true)
    }
  }, [url])

  return (
    <div className="w-full h-screen rounded-lg bg-black text-white text-xs p-1 shadow-lg font-mono">
      {!hasIframe ? (
        <div className="flex flex-col items-center w-full justify-center h-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
          <p className="mt-2 text-green-400">Preview Loading..</p>
        </div>
      ) : (
        <>
          <div className='absolute bottom-0 left-0 w-fit bg-gray-800 text-white p-1 rounded-t-lg flex items-center gap-3'>
            {logs}
            <div className="flex justify-end p-0.5">
              <button
                onClick={() => {
                  if (iframeRef.current) {
                    iframeRef.current.src = iframeRef.current.src;
                  }
                }}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                🔁 Refresh Preview
              </button>
            </div>

          </div>

          <iframe
            ref={iframeRef}
            src={url}
             id="preview-iframe"
            className="w-full h-full rounded-lg border-2 border-gray-800"
          />
          {/* Add below iframe */}
        </>
      )}
    </div>


  )
}
