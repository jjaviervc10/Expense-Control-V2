// src/hooks/useAutoLogout.ts
import { useEffect } from "react";
import { toast } from "react-toastify";

export function useAutoLogout(timeoutMs = 120000, warningMs = 10000) {
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let warningTimeout: ReturnType<typeof setTimeout>;

    const logout = () => {
      toast.dismiss();
      localStorage.removeItem("token");
      window.location.href = "/";
    };

    const showWarning = () => {
      toast.warning("⚠️ Tu sesión está por cerrarse por inactividad", {
        toastId: "logout-warning",
        autoClose: warningMs,
      });
      warningTimeout = setTimeout(logout, warningMs);
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      toast.dismiss("logout-warning");

      timeout = setTimeout(showWarning, timeoutMs - warningMs);
    };

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // iniciar

    return () => {
      clearTimeout(timeout);
      clearTimeout(warningTimeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs, warningMs]);
}
