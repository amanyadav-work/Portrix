'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    if (!url.startsWith('https://github.com/')) {
      alert('Invalid GitHub URL')
      return
    }

    const ownerRepo = url.replace('https://github.com/', '')
    router.push(`/sandbox?repo=${ownerRepo}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Paste GitHub Repo URL</h1>

        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
        />

        <Button onClick={handleSubmit} className="w-full">
          Load Sandbox
        </Button>
      </div>
    </main>
  )
}
