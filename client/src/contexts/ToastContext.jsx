import { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";

const ToastContext = createContext(null);

const MAX_CONCURRENT_TOASTS = 5;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type, duration }];

      // If we exceed the limit, remove the oldest toasts
      if (newToasts.length > MAX_CONCURRENT_TOASTS) {
        return newToasts.slice(newToasts.length - MAX_CONCURRENT_TOASTS);
      }

      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
