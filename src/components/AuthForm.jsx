"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, setToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { baseSchema, signupSchema } from "@/utils/zodSchema/auth";
import { useState } from "react";
import useFetch from "@/hooks/useFetch";
import FormField from "./ui/FormField";
import { Lock, MailIcon, User } from "lucide-react";

export function AuthForm({ className, type = "signin", ...props }) {
  const isSignup = type === "signup";
  const authUrl = isSignup ? "/api/auth/register" : "/api/auth/login";
  const formSchema = isSignup ? signupSchema : baseSchema;
  const router = useRouter();
  const { setUser } = useUser();
  const { refetch, isLoading } = useFetch({
    url: authUrl,
    method: "POST",
    withAuth: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [rememberMe, setRememberMe] = useState(false);

const onSubmit = async (formValues) => {
  const payload = {
    email: formValues.email,
    password: formValues.password,
  };

  if (isSignup) {
    payload.name = formValues.name;
  }

  refetch({
    payload, 
    onSuccess: (result) => {
      if (result?.user && result?.jwttoken) {
        setToken(result.jwttoken, result.user._id, rememberMe);
        console.log("User logged in:",result);
        setUser(result.user);
        router.push("/dashboard");
      } else {
        toast.error("Something went wrong");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
    }
  });
};


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isSignup ? "Create an account" : "Login to your account"}</h1>
        <p className="text-sm text-muted-foreground">
          {isSignup ? "Sign up with your email and password" : "Sign in to continue"}
        </p>
      </div>

      <div className="grid gap-4">
        {isSignup && (
          <FormField
            id="name"
            label="Name"
            icon={<User size={15} />}
            placeholder="Name"
            register={register}
            errors={errors}
          />
        )}

        <FormField
          id="email"
          label="Email"
          icon={<MailIcon size={15} />}
          placeholder="you@example.com"
          register={register}
          errors={errors}
        />

        <FormField
          id="password"
          label="Password"
          icon={<Lock size={15} />}
          placeholder="••••••••"
          register={register}
          errors={errors}
          isSecret
        />
        {!isSignup && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(val) => setRememberMe(!!val)} // ✅ sync state
            />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : isSignup ? "Register" : "Login"}
        </Button>
      </div>

      <div className="text-xs text-center">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </>
        )}
      </div>
    </form>
  );
}
