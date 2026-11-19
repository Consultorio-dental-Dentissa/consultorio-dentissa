import * as React from "react"

import { cn } from "@/lib/utils"

/** Textarea de docs/DISEÑO-FINAL: borde #d1d5db, radio 9, padding 12x14, 15px/1.5, sin redimensionar. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-none rounded-[9px] border border-input bg-surface px-3.5 py-3 text-[15px] leading-normal text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-ink-5 focus-visible:border-coral focus-visible:ring-3 focus-visible:ring-coral/18 disabled:cursor-not-allowed disabled:border-line-soft disabled:bg-field disabled:text-ink-4 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
