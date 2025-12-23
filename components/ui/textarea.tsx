import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex w-full min-h-[120px] px-4 py-3 text-sm rounded-xl resize-y",
        // Background and border
        "bg-white/10 backdrop-blur-md",
        "border-2 border-white/20",
        // Text and placeholder
        "text-white placeholder:text-gray-400/70",
        // Transitions
        "transition-all duration-300 ease-in-out",
        // Hover state
        "hover:bg-white/15 hover:border-white/30",
        // Focus state
        "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50",
        "focus:bg-white/15 focus:shadow-lg focus:shadow-cyan-500/20",
        // Active state
        "active:scale-[0.995]",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/10",
        // Selection
        "selection:bg-cyan-500/30",
        // Scrollbar styling
        "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

