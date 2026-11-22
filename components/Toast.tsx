import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global dispatcher helper
export const showToast = (type: ToastType, title: string, message?: string, duration = 4000) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("hackhub-toast", {
      detail: {
        id: Math.random().toString(36).substring(2, 9),
        type,
        title,
        message,
        duration,
      },
    });
    window.dispatchEvent(event);
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("hackhub-toast", handleToast);
    return () => window.removeEventListener("hackhub-toast", handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-950/40";
      case "error":
        return "border-rose-500/30 bg-rose-950/40";
      case "warning":
        return "border-amber-500/30 bg-amber-950/40";
      default:
        return "border-cyan-500/30 bg-cyan-950/40";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${getBorderColor(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition p-1 shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
