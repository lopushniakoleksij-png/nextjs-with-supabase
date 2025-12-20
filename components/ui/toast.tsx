"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

export const ToastProvider = ToastPrimitives.Provider
export const ToastViewport = ToastPrimitives.Viewport

export function Toast({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>) {
  return (
    <ToastPrimitives.Root
      className={cn(
        "bg-black text-white border border-white/20 rounded-md p-4",
        className
      )}
      {...props}
    />
  )
}

export const ToastTitle = ToastPrimitives.Title
export const ToastDescription = ToastPrimitives.Description
export const ToastClose = ToastPrimitives.Close

