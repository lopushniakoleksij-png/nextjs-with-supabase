"use client";

import * as React from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextValue = {
  toasts: ToastProps[];
  toast: (toast: Omit<ToastProps, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  function toast(data: Omit<ToastProps, "id">) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...data }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}

