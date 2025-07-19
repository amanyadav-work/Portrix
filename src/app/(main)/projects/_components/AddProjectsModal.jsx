'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { DialogContent } from '@/components/ui/dialog'
import FormField from '@/components/ui/FormField'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import useFetch from '@/hooks/useFetch'
import { toast } from 'sonner'
import { useUser } from '@/contexts/UserContext'
import Loader from '@/components/ui/Loader'

// Zod schema for validation
const formSchema = z.object({
  github_url: z
    .string()
    .url('Enter a valid URL')
    .startsWith('https://github.com/', {
      message: 'GitHub URL must start with https://github.com/',
    }),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
})

export default function AddProjectsModal() {
  const router = useRouter()
  const { user } = useUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      github_url: '',
      name: '',
      description: '',
    },
  })


  const { refetch, isLoading } = useFetch({
    url: '/api/sandbox/create',
    method: 'POST',
    headers: {},
    withAuth: true,
    onSuccess: (res) => {
      // After success, redirect to the sandbox page for the created repo
      toast.success(res.message || 'Project Creation Successful')
      router.push(`/sandbox/${res.sandbox.slug}`)
    },
    onError: (err) => {
      // You can show an error toast or similar here
      toast.error('Sandbox creation failed:', err)
    },
  })


const onSubmit = (formData) => {
  refetch({
    payload: {
      ...formData,
    },
  })
}

return (
  <DialogContent
  >
    <DialogTitle>
      Add GitHub Sandbox
    </DialogTitle>

    <DialogDescription className="space-y-1 text-center">
      Paste your GitHub repo URL to load it in a sandbox.
    </DialogDescription>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        id="github_url"
        label="GitHub Repository URL"
        placeholder="https://github.com/user/repo"
        register={register}
        errors={errors}
      />

      <FormField
        id="name"
        label="Project Name"
        placeholder="My Project"
        register={register}
        errors={errors}
      />

      <FormField
        id="description"
        label="Description"
        placeholder="A short description..."
        register={register}
        errors={errors}
        isTextArea
      />

      <Button type="submit" className="w-full">
        {isLoading ? <Loader /> : 'Load Sandbox'}
      </Button>
    </form>
  </DialogContent>
)
}
