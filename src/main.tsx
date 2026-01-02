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
    const waitForOneSignal = () => {
      if (window.OneSignal && window.OneSignal.push) {
        window.OneSignal.push(() => {
          window.OneSignal.init({
            appId: "b19ba635-c385-4174-919a-d32ebea87b97",
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
          });

          console.log("✅ OneSignal initialized!");

          // Evento opcional
          window.OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
            console.log("🔔 Subscription changed:", isSubscribed);
          });
        });
      } else {
        // Reintenta cada 200ms hasta que esté listo
        setTimeout(waitForOneSignal, 200);
      }
    };

    waitForOneSignal();
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
