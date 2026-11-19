import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Interruptor de docs/DISEÑO-FINAL: 42x24, padding 3, thumb blanco 18px, activo #fc7186, inactivo #d1d5db. */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent px-[3px] transition-colors outline-none after:absolute after:-inset-x-2 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive data-[size=default]:h-6 data-[size=default]:w-[42px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] data-checked:bg-primary data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white ring-0 transition-transform group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[18px] group-data-[size=sm]/switch:data-checked:translate-x-3 data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
