"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

export const ToastProvider = ToastPrimitives.Provider
export const ToastViewport = ToastPrimitives.Viewport

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "bg-background border rounded-md p-4 shadow-md",
      className
    )}
    {...props}
  />
))
Toast.displayName = "Toast"

export const ToastTitle = ToastPrimitives.Title
export const ToastDescription = ToastPrimitives.Description
export const ToastClose = ToastPrimitives.Close

