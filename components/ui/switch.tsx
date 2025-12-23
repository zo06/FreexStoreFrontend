"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        // Border and background
        "border-2 border-white/20 backdrop-blur-md",
        // Transitions
        "transition-all duration-300 ease-in-out",
        // Unchecked state
        "data-[state=unchecked]:bg-white/10",
        // Checked state
        "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-cyan-600",
        "data-[state=checked]:border-cyan-400/50",
        "data-[state=checked]:shadow-lg data-[state=checked]:shadow-cyan-500/30",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-slate-900",
        // Hover state
        "hover:data-[state=unchecked]:bg-white/15 hover:data-[state=unchecked]:border-white/30",
        "hover:data-[state=checked]:shadow-xl hover:data-[state=checked]:shadow-cyan-500/40",
        // Active state
        "active:scale-95",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base styles
          "pointer-events-none block h-5 w-5 rounded-full",
          // Background
          "bg-white shadow-lg",
          // Transitions
          "transition-all duration-300 ease-in-out",
          // Position
          "data-[state=unchecked]:translate-x-0.5",
          "data-[state=checked]:translate-x-[1.35rem]",
          // Scale on checked
          "data-[state=checked]:scale-95",
          // Ring effect
          "ring-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

