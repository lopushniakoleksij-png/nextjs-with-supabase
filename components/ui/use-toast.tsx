"use client";

import * as React from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

const ToastContext = React.createContext<{
  toasts: ToastProps[];
  toast: (toast: Omit<ToastProps, "id">) => void;
}>({
  toasts: [],
  toast: () => {},
});

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
  return React.useContext(ToastContext);
}

