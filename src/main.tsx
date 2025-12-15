import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
import AppRouter from "./routes/AppRouter"
import { AuthProvider } from "./context/AuthContext";
import { BudgetProvider } from './context/BudgetContext.tsx'
import { BrowserRouter } from "react-router-dom";

createRoot
(document.getElementById('root')!).render(
  <StrictMode>
   <BrowserRouter>
     <AuthProvider>
      <BudgetProvider>
      <AppRouter />
     </BudgetProvider>
    </AuthProvider>
   </BrowserRouter>
    
  </StrictMode>,
)
