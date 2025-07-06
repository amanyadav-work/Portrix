import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition",
  {
    variants: {
      variant: {
        green: "text-white bg-green-600 border-transparent hover:bg-green-700 focus:ring-green-500",
        gray: "text-white bg-gray-600 border-transparent hover:bg-gray-700 focus:ring-gray-500",
        outline: "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-400",
      },
      size: {
        sm: "text-xs px-2 py-1",
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

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    (<Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />)
  );
}

export { Button, buttonVariants }
