import { FlameIcon } from "lucide-react"
import { AuthForm } from "@/components/AuthForm"
import Link from "next/link"

export default function Register() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2 relative">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <FlameIcon className="size-4" />
                        </span>
                        <span>XP Life.</span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <AuthForm type="signup"/>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="Random/_b878f8bb-f58e-483f-9798-f696388d2472.jpeg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}


export const metadata = {
    title: "Register | XP Life",
    description: "Register to XP Life and gamify your personal growth.",
  };