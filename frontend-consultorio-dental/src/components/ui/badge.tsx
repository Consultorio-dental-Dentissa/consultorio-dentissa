import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3! border-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground font-bold rounded-md [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20 font-bold rounded-md",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-100 text-green-700 font-bold rounded-md",
        base: "bg-gray-200 font-bold text-gray-600 rounded-md",
        warning: "bg-orange-100 text-orange-800 font-bold rounded-md",
        primary: "bg-green-200 text-green-800 font-bold rounded-md",

        /* Badges for appointments statuses */
        pending: "bg-gray-200 text-gray-800 font-bold rounded-md",
        completed: "bg-blue-200 text-blue-800 font-bold rounded-md",
        canceled: "bg-red-200 text-red-800 font-bold rounded-md",
        confirmed: "bg-green-200 text-green-800 font-bold rounded-md",
        rescheduled: "bg-orange-200 text-orange-800 font-bold rounded-md",

        /* Badges for users roles */
        admin: "bg-rose-200 text-rose-800 font-bold rounded-md",
        assistant: "bg-purple-200 text-purple-800 font-bold rounded-md",
        patient: "bg-blue-100 text-blue-800 font-bold rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "success"
  | "base"
  | "warning"
  | "pending"
  | "confirmed"
  | "canceled"
  | "completed"
  | "rescheduled"
  | "admin"
  | "assistant"
  | "patient";

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
