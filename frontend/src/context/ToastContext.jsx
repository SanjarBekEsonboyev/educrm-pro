import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToastState] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToastState({ msg, type, id: Date.now() });
    setTimeout(() => setToastState((t) => (t && t.msg === msg ? null : t)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="ap"
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 2000,
            padding: "14px 20px", borderRadius: 14, minWidth: 260, maxWidth: 420,
            background: "var(--bg2)", border: `1px solid ${toast.type === "warning" ? "rgba(255,170,0,.3)" : toast.type === "danger" ? "rgba(255,61,90,.3)" : "rgba(0,214,143,.3)"}`,
            boxShadow: "0 20px 60px rgba(0,0,0,.5)", color: "var(--t1)", fontSize: 13, fontWeight: 600,
          }}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
