import * as React from "react"

import { cn } from "@/lib/utils"
import ScrollShadow from "../ScrollShadow";

function Card({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card"
      className={cn(
        "bg-stone-900/60 text-card-foreground flex flex-col gap-3.5 rounded-[3px] border pb-6 shadow-xs relative",
        className
      )}
      {...props} />)
  );
}

function CardHeader({
  className,
  isPage = false,
  ...props
}) {
  return (
    (<div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-2.5 sm:px-4 md:px-6 pt-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-3",isPage && "sticky top-0 z-10 !px-0 bg-background py-8",
        className
      )}
      {...props} />)
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-title"
      className={cn("leading-none text-xl font-semibold", className)}
      {...props} />)
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />)
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />)
  );
}
function CardContent({ className, isPage, children, ...props }) {
  const content = (
    <div
      data-slot="card-content"
      className={cn("h-full px-6", className, isPage && "px-0 pb-6")}
      {...props}
    >
      {children}
    </div>
  );

  return isPage ? (
    <ScrollShadow
      direction="vertical"
      parentClass=" h-[80vh]" // important to allow scroll inside flex layout
      className="h-full"
    >
      {content}
    </ScrollShadow>
  ) : (
    content
  );
}





function CardFooter({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="card-footer"
      className={cn("flex items-center px-2.5 sm:px-4 md:px-6 [.border-t]:pt-6", className)}
      {...props} />)
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}