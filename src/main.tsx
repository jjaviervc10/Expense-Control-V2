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
// ...existing code...
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <>
            <AppRouter />
            <ToastContainer position="top-center" />
          </>
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
