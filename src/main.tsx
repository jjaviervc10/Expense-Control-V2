import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { BudgetProvider } from "./context/BudgetContext";
import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* 🔔 Tipado global */
declare global {
  interface Window {
    OneSignal: any;
  }
}

function OneSignalInit() {
  useEffect(() => {
    if (!window.OneSignal) return;

    window.OneSignal = window.OneSignal || [];

    window.OneSignal.push(() => {
      // ⛔ Evita doble init
      if (window.OneSignal._initialized) return;

      window.OneSignal.init({
        appId: "b19ba635-c385-4174-919a-d32ebea87b97",
        notifyButton: {
          enable: false, // usamos botón personalizado
        },
        allowLocalhostAsSecureOrigin: true,
      });

      window.OneSignal._initialized = true;

      window.OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
        console.log("🔔 Subscription changed:", isSubscribed);
      });
    });
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <>
            <OneSignalInit />
            <AppRouter />
            <ToastContainer position="top-center" />
          </>
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
