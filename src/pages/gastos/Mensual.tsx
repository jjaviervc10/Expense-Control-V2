import { useEffect } from "react"
import { useBudget } from "../../hooks/useBudget"
import BudgetForm from "../../components/BudgetForm"
import BudgetTracker from "../../components/BudgetTracker"
import ExpenseList from "../../components/ExpenseList"
import ExpenseModal from "../../components/ExpenseModal"
import FilterByCategory from "../../components/FilterByCategory"

export default function Diario() {
  const { state, dispatch } = useBudget()


  useEffect(() => {
  dispatch({ type: "set-range", payload: { range: "mensual" } })
}, [dispatch])

const presupuestoActual = state.budgets.mensual


  return (
    <>
      <header className="bg-blue-600 py-8 max-h-72">
        <h1 className="uppercase text-center font-black text-4xl text-white">
          PLANIFICADOR DE GASTOS - MENSUAL
        </h1>
      </header>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg mt-10 p-10">
        {/* ✅ SI NO HAY PRESUPUESTO → FORM */}
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
