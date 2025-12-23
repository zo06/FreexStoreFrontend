"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex w-full h-11 px-4 py-2.5 text-sm rounded-xl",
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
          "active:scale-[0.99]",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/10",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
          // Selection
          "selection:bg-cyan-500/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

