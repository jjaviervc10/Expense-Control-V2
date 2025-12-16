import { createContext, useReducer, useMemo } from "react"
import { budgetReducer, initialState } from "../reducers/budget-reducer"
import type { BudgetActions, BudgetState } from "../reducers/budget-reducer"
import type { Expense } from "../types"

type BudgetContextProps = {
  state: BudgetState
  dispatch: React.Dispatch<BudgetActions>
  filteredExpenses: Expense[]
  totalExpenses: number
  remainingReference: number // referencia local
}

export const BudgetContext = createContext({} as BudgetContextProps)

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState)

  /* ===========================
     FILTRAR GASTOS POR RANGO
     (mismo que antes)
  ============================ */

  const filteredExpenses = useMemo(
    () =>
      state.expenses.filter(
        (expense) => expense.range === state.currentRange
      ),
    [state.expenses, state.currentRange]
  )

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + e.amount, 0),
    [filteredExpenses]
  )

  /* ===========================
     REFERENCIA LOCAL DE PRESUPUESTO
     
     Ya no es la fuente real — 
     solo sirve como referencia visual temporal 
     o en caso de que no usemos backend
  ============================ */

  const remainingReference =
    state.budgets[state.currentRange] - totalExpenses

  return (
    <BudgetContext.Provider
      value={{
        state,
        dispatch,
        filteredExpenses,
        totalExpenses,
        remainingReference
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}
