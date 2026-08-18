"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Toast {
  id: number;
  text: string;
  tone: "success" | "error";
}

interface ToastApi {
  success(text: string): void;
  error(text: string): void;
}

const Ctx = createContext<ToastApi | null>(null);

/**
 * Minimal toast system: a stack in the bottom corner, one auto-dismiss timer
 * per toast, `role="status"` so screen readers announce saves. The success
 * variant repeats what the save was ("Gespeichert."); the error variant
 * stays a bit longer so the admin has time to read the reason.
 */
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((tone: Toast["tone"], text: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, text, tone }]);
    const dismissAfter = tone === "error" ? 6000 : 3000;
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), dismissAfter);
  }, []);

  const api: ToastApi = {
    success: (text) => push("success", text),
    error: (text) => push("error", text),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.tone === "error" ? "a-toast-error" : ""}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastHost>");
  return ctx;
}

/**
 * Warn before navigating away with unsaved changes. Standalone hook so any
 * form can opt in — the browser will show its own confirmation dialog.
 */
export function useUnsavedWarning(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // returnValue is required for older browsers; the string itself is ignored.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
