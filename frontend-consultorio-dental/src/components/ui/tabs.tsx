import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

/** Pestañas de docs/DISEÑO-FINAL (Perfil de paciente): subrayado, gap 28px, línea inferior #e5e7eb. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex w-full items-end gap-7 overflow-x-auto border-b border-line",
        className
      )}
      {...props}
    />
  )
}

/** Activa: texto #1f2328/800 con borde inferior de 3px #fc7186; inactiva: #6b7280/600. */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px inline-flex items-center justify-center gap-2 border-b-[3px] border-transparent px-0.5 pb-3.5 text-base font-semibold whitespace-nowrap text-ink-4 transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:underline disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:font-extrabold data-[state=active]:text-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none animate-fade-up", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
