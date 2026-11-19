import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Etiqueta de campo de docs/DISEÑO-FINAL: 14.5px/700 #374151 (15px en las pantallas de acceso). */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-[14.5px] leading-tight font-bold text-ink-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
