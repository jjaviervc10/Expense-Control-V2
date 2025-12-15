// src/pages/gastos/GastoLayout.tsx
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useBudget } from "../../hooks/useBudget"

import BudgetForm from "../../components/BudgetForm"
import BudgetTracker from "../../components/BudgetTracker"
import ExpenseList from "../../components/ExpenseList"
import ExpenseModal from "../../components/ExpenseModal"
import FilterByCategory from "../../components/FilterByCategory"

export default function GastoLayout() {
  const { tipo } = useParams() // diario | semanal | mensual
  const { state, dispatch } = useBudget()

  // 🔥 Fuente ÚNICA de verdad: la URL
  useEffect(() => {
    if (tipo === "diario" || tipo === "semanal" || tipo === "mensual") {
      dispatch({ type: "set-range", payload: { range: tipo } })
    }
  }, [tipo, dispatch])

  const presupuestoActual = state.budgets[state.currentRange]

  return (
    <>
      <header className="bg-blue-600 py-8 max-h-72">
        <h1 className="uppercase text-center font-black text-4xl text-white">
          PLANIFICADOR DE GASTOS - {tipo?.toUpperCase()}
        </h1>
      </header>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg mt-10 p-10">
        {/* ✅ MISMO FLUJO DEL PROYECTO BASE */}
        {presupuestoActual === 0 ? (
          <BudgetForm />
        ) : (
          <>
            <BudgetTracker />

            <main className="max-w-3xl mx-auto py-10">
              <FilterByCategory />
              <ExpenseList />
              <ExpenseModal />
            </main>
          </>
        )}
      </div>
    </>
  )
}
