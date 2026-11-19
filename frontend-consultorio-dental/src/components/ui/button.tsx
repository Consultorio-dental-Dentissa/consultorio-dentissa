import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Botón base (docs/DISEÑO-FINAL): primario rosa #fc7186 (hover #ec5d73) de 44px y 15px/700,
 * secundario gris #eceef1, contorno #d1d5db, destructivo #ef4444. `brand` es el CTA de las
 * pantallas de acceso (54px, 17px/800, radio 10) y `great`/`lg` las alturas de acceso/landing.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent text-[15px] font-bold whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        brand: "rounded-[10px] bg-primary text-[17px] font-extrabold text-primary-foreground hover:bg-primary-hover",
        login: "rounded-[10px] bg-primary text-[17px] font-extrabold text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-fill-strong text-ink-2 hover:bg-[#e1e4e8]",
        soft: "bg-fill text-ink-3 hover:bg-fill-hover",
        outline: "border-input bg-surface text-ink-3 hover:bg-field",
        ghost: "text-ink-2 hover:bg-fill aria-expanded:bg-fill",
        selectedGhost: "bg-brand-soft text-brand",
        destructive: "bg-danger-dot text-white hover:bg-destructive focus-visible:ring-destructive/25",
        dangerOutline: "border-line bg-surface text-destructive hover:border-danger-soft hover:bg-danger-soft",
        dangerGhost: "bg-transparent text-destructive hover:bg-danger-soft",
        success: "bg-success-soft text-success hover:bg-success-soft-hover",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-[22px]",
        xs: "h-9 px-3.5 text-sm",
        sm: "h-[38px] px-4 text-[14.5px]",
        lg: "h-[52px] rounded-[10px] px-7 text-base",
        great: "h-[54px] px-6",
        icon: "size-11",
        "icon-xs": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-[38px] [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
