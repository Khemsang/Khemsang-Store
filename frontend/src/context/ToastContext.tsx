import { createContext, useContext, useState, ReactNode, useRef } from "react";
import Toast from "../components/common/Toast";

interface ToastContextType {
  showToast: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
  ) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: string }>
  >([]);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    const now = Date.now();
    
    // Prevent duplicate toasts with same message within 5 seconds (increased for better UX)
    if (
      lastToastRef.current &&
      lastToastRef.current.message === message &&
      now - lastToastRef.current.timestamp < 5000
    ) {
      return;
    }
    
    lastToastRef.current = { message, timestamp: now };
    setToasts((prev) => [...prev, { id: now, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string) => showToast(message, "success");
  const error = (message: string) => showToast(message, "error");
  const info = (message: string) => showToast(message, "info");
  const warning = (message: string) => showToast(message, "warning");

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type as any}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
