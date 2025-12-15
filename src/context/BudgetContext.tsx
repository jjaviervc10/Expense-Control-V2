import { createContext, useReducer, useMemo } from "react"
import { budgetReducer, initialState } from "../reducers/budget-reducer"
import type { BudgetActions, BudgetState } from "../reducers/budget-reducer"
import type { Expense } from "../types"

type BudgetContextProps = {
  state: BudgetState
  dispatch: React.Dispatch<BudgetActions>
  filteredExpenses: Expense[]
  totalExpenses: number
  remainingBudget: number
}

export const BudgetContext = createContext({} as BudgetContextProps)

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState)

  /* SOLO GASTOS DEL RANGO ACTUAL */
 

const filteredExpenses = useMemo(
  () => state.expenses.filter(
    expense => expense.range === state.currentRange
  ),
  [state.expenses, state.currentRange]
);

const totalExpenses = useMemo(
  () => filteredExpenses.reduce((acc, e) => acc + e.amount, 0),
  [filteredExpenses]
);

const remainingBudget =
  state.budgets[state.currentRange] - totalExpenses;

    
  return (
    <BudgetContext.Provider
      value={{ state, dispatch, filteredExpenses, totalExpenses, remainingBudget }}
    >
      {children}
    </BudgetContext.Provider>
  )
}
