// components/ui/Loader.jsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Loader({ fullScreen = false, statusStep = '', logs = '', onRetry }) {
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    // Auto-show logs if there's enough data
    if (logs?.length > 100) setShowLogs(true)
  }, [logs])

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col items-center justify-center text-center px-6 py-12 space-y-6 ${
          fullScreen ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur' : ''
        }`}
      >
        <div>
          <p className="text-xl font-semibold">Setting up your sandbox...</p>
          <p className="text-sm text-muted-foreground mt-2">{statusStep}</p>
        </div>

        {showLogs && (
          <div className="max-h-64 w-full md:w-[600px] overflow-y-auto bg-black text-green-400 text-xs p-4 rounded border border-gray-700 font-mono text-left shadow-inner">
            {logs}
          </div>
        )}

        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Retry Setup
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
