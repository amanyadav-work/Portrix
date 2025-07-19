import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "w-fit inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
  {
    variants: {
      variant: {
        /** ✅ Supabase-style green */
        green: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
        /** ✅ Subtle neutral background */
        gray: "bg-gray-800 text-white hover:bg-gray-700 focus-visible:ring-gray-500",
        /** ✅ Clean outline */
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-500",
        /** ✅ Minimal button */
        ghost: "bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300",
        /** ✅ Danger */
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        /** ✅ Supabase link-style */
        link: "text-green-600 hover:text-green-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "text-xs px-2 py-1 rounded-[4px]",
        md: "text-xs px-3 py-1.5",
        default: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "green",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
