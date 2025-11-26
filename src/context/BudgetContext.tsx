import { useReducer, createContext } from "react"
import type { Dispatch, ReactNode } from "react"
import { budgetReducer, initialState, type BudgetActions, type BudgetState } from "../reducers/budget-reducer"
import { useMemo } from "react"

type BudgetContextProps = {
    state: BudgetState
    dispatch: Dispatch<BudgetActions>,
    totalExpenses:number,
    remainingBudget: number
}

type BudgetProviderProps = {
    children: ReactNode
}
export const BudgetContext = createContext<BudgetContextProps>({} as BudgetContextProps)

export const BudgetProvider = ({children}: BudgetProviderProps) =>{
    const [state, dispatch] = useReducer(budgetReducer, initialState)

    const totalExpenses = useMemo(() => state.expenses.reduce((total, expense)=> expense.amount + total,0 ), [state.expenses])
          
     const remainingBudget = state.budget - totalExpenses
      
    
  
    return(
      <BudgetContext.Provider
         value={{
            state,
            dispatch,
            totalExpenses,
            remainingBudget
         }}
      >
        {children}
      </BudgetContext.Provider>
    )
}