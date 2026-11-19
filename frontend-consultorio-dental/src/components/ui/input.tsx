import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input de docs/DISEÑO-FINAL: 46px (formularios de modal), borde #d1d5db, radio 9, 15px.
 * Foco: borde #fc7186 + halo rgba(252,113,134,.18). Barras de filtros: 44px/radio 8 (className);
 * pantallas de acceso: 52px/radio 10/16px (variante `auth` del campo).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[46px] w-full min-w-0 rounded-[9px] border border-input bg-surface px-3.5 text-[15px] text-foreground transition-[border-color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ink-5 focus-visible:border-coral focus-visible:ring-3 focus-visible:ring-coral/18 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-line-soft disabled:bg-field disabled:text-ink-4 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
