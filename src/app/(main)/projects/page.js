'use client'
import { useRef, useState } from "react"
import { useGsap } from "@/hooks/useGsap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import SearchBox from "@/components/ui/search"
import useFetch from "@/hooks/useFetch"
import Loader from "@/components/ui/Loader"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AddProjectsModal from "./_components/AddProjectsModal"


const Page = () =>{
  const [search, setSearch] = useState('')
  return(
    <>
    <CardHeader isPage className='pb-3 space-y-2'>
      <CardTitle>Your Projects</CardTitle>
      <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
           <Button size='sm'>
            New Project
           </Button>
        </DialogTrigger>
        <AddProjectsModal/>
      </Dialog>
        <SearchBox search={search} setSearch={setSearch} placeholder='Search for a project'/>
      </div>
    </CardHeader>
    <CardContent isPage >
      <Projects/>
    </CardContent>
    </>
  )
}

const Projects = () => {
  const containerRef = useRef(null)
  const cardsRef = useRef([])
  const router = useRouter()

  // Fetch sandboxes
  const { data, error, isLoading, refetch } = useFetch({
    url: '/api/sandbox',
    method: 'GET',
    auto: true,
  })

  // Animate container and cards after data loads
  useGsap(containerRef.current, 'fade-in')
  useGsap(cardsRef.current, 'stagger-fade', { delay: 0.2, stagger: 0.15 })

  if (isLoading) return <Loader/>
  if (error) return <p className="text-red-600">Error: {error}</p>
  if (!data?.sandboxes?.length) return <p>No projects found.</p>

  return (
    <div ref={containerRef} className="space-y-6 space-x-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.sandboxes.map((sandbox, index) => (
          <Card
            key={sandbox._id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={()=>router.push(`/sandbox/${sandbox.slug}`)}
          >
            <CardHeader className="text-lg font-medium mb-1">{sandbox.name}</CardHeader>
            <CardContent className="text-sm text-muted-foreground truncate">
              {sandbox.description || 'No description provided.'}
            </CardContent>
            <CardContent className="text-xs text-blue-600 truncate">
              <a
                href={sandbox.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {sandbox.github_url}
              </a>
            </CardContent>
          </Card>

        ))}
      </div>
    </div>
  )
}


export default Page