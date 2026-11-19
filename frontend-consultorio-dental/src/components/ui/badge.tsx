import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Badge de docs/DISEÑO-FINAL: píldora (radio 20px), 13.5px/700, padding 5x12, fondo suave +
 * texto intenso. Sin punto de color: el estatus se distingue por color y texto.
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-[5px] text-[13.5px] leading-none font-bold whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-brand-soft text-brand",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-danger-soft text-destructive",
        outline: "border-border text-foreground",
        ghost: "text-muted-foreground",
        link: "text-brand underline-offset-4 hover:underline",
        success: "bg-success-soft text-success",
        base: "bg-fill-strong text-ink-3",
        warning: "bg-warning-soft text-warning",
        primary: "bg-success-soft text-success",
        /* Estados de cita */
        pending: "bg-neutral-soft text-ink-3",
        completed: "bg-info-soft text-info",
        canceled: "bg-danger-soft text-destructive",
        confirmed: "bg-success-soft text-success",
        rescheduled: "bg-warning-soft text-warning",
        /* Estado "En curso" del panel */
        inProgress: "bg-brand-soft text-brand",
        /* Roles */
        admin: "bg-violet-soft text-violet",
        assistant: "bg-sky-soft text-sky",
        patient: "bg-brand-soft text-brand",
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
  | "primary"
  | "pending"
  | "confirmed"
  | "canceled"
  | "completed"
  | "rescheduled"
  | "inProgress"
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
