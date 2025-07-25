import { Dribbble, Facebook, GithubIcon, Globe2, Instagram, LinkedinIcon } from "lucide-react"
import Link from "next/link"

const Footer = () => {
    return (
        <div className="w-full space-y-3 p-3.5 border-t-2 bg-conic">
            <footer className="my-container mx-auto flex gap-2 justify-between items-start">
                <div className="w-[30%]">
                    <h2 className="h-[63px] mb-5 uppercase flex flex-col justify-end items-start text-sm font-medium">About Absento</h2>
                    <p className="text-xs max-w-[80%]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio repellat tempora tempore nisi quo a cupiditate numquam eligendi sint dolorum eius voluptatibus, nihil saepe sunt quas officiis harum. Mollitia, aperiam!</p>
                    <h2 className="h-[50px] mb-3.5 uppercase flex flex-col justify-end items-start text-sm font-medium">Awards</h2>
                    <div className="space-y-2.5 text-xs">
                        {/* {['Orpetron.com','Web Guru Awards.com','WD Awards.com']
                            .map(item => {
                                return <Link href='/' className="block text-xs opacity-90">{item}</Link>
                            })
                        } */}
                        Opsum dolor sit, amet consectetur adipisicing elit. Nulla, voluptate! Dolorem accusamus ea consequatur iusto? Sunt.
                    </div>
                </div>
                <div className="w-[15%] ">
                    <h2 className="h-[63px] mb-5 uppercase flex flex-col justify-end items-start text-sm font-medium">Company</h2>
                    <div className="space-y-4.5">
                        {['Our Projects', 'Contact Us', 'Open Source', 'The Blog'].map(item => {
                            return <Link  key={item}  href='/' className="block text-xs opacity-90">{item}</Link>
                        })
                        }
                    </div>
                </div>
                <div className="w-[40%]">
                    <h2 className="h-[63px] mb-5 uppercase flex flex-col justify-end items-start text-sm font-medium">Services</h2>
                    <div className="space-y-4.5 grid grid-cols-2">
                        {['Web Development', 'Mobile Apps', 'SEO Services', 'UI Design', 'UX Design', 'Digital Marketing', 'Cloud Solutions', 'Database Management', 'Cybersecurity Services', 'Software Consulting', 'Tech Support', 'App Development']
                            .map(item => {
                                return <Link href='/'  key={item}  className="block text-xs opacity-90">{item}</Link>
                            })
                        }
                    </div>
                </div>
                <div className="w-[15%]">
                    <h2 className="h-[63px] mb-5 uppercase flex flex-col justify-end items-start text-sm font-medium">Contacts</h2>
                    <div className="space-y-2.5">
                        {['+91 7900168479', '123 Elm Street, City, 767333']
                            .map(item => {
                                return <Link href='/'  key={item}  className="block text-xs opacity-90">{item}</Link>
                            })
                        }
                    </div>
                    <h2 className="h-[50px] mb-3.5 uppercase flex flex-col justify-end items-start text-sm font-medium">Inquiries</h2>
                    <div className="space-y-2.5">
                        {['inquiries@absento.com']
                            .map(item => {
                                return <Link href='/'  key={item}  className="block text-xs opacity-90">{item}</Link>
                            })
                        }
                    </div>
                    <h2 className="h-[50px] mb-3.5 uppercase flex flex-col justify-end items-start text-sm font-medium">Careers</h2>
                    <div className="space-y-2.5">
                        {['dream@absento.com']
                            .map(item => {
                                return <Link href='/' key={item} className="block text-xs opacity-90">{item}</Link>
                            })
                        }
                    </div>
                </div>
            </footer>
            <div className="my-container text-xs mx-auto pt-4 pb-0 border-t mt-14 flex justify-between items-center">
                <p>&copy; {new Date().getFullYear()} Absento Ai - Designed & Developed By   <a className="border-b w-fit pb-0.5 border-muted-foreground border-dashed" target="_blank" href="https://amanwebdev.site/">Aman Yadav</a></p>
                <div className="flex gap-3">
                    <Dribbble className="rounded-full border border-muted-foreground p-2" size={33} />
                    <Instagram className="rounded-full border border-muted-foreground p-2" size={33} />
                    <Facebook className="rounded-full border border-muted-foreground p-2" size={33} />
                    <LinkedinIcon className="rounded-full border border-muted-foreground p-2" size={33} />
                    <GithubIcon className="rounded-full border border-muted-foreground p-2" size={33} />
                    <Globe2 className="rounded-full border border-muted-foreground p-2" size={33} />
                </div>
            </div>
        </div >
    )

}

export default Footer