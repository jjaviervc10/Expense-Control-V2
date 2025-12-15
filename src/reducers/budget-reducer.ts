import { v4 as uuidv4 } from "uuid"
import type { Category, DraftExpense, Expense, ReportRange } from "../types"

/* =======================
   STATE
======================= */

export type BudgetState = {
  budgets: {
    diario: number
    semanal: number
    mensual: number
  }
  expenses: Expense[]
  modal: boolean
  editingId: Expense["id"]
  currentCategory: Category["id"]
  currentRange: ReportRange
}

/* =======================
   ACTIONS
======================= */

export type BudgetActions =
  | { type: "set-range"; payload: { range: ReportRange } }
  | { type: "add-budget"; payload: { budget: number } }
  | { type: "add-expense"; payload: { expense: DraftExpense } }
  | { type: "remove-expense"; payload: { id: Expense["id"] } }
  | { type: "get-expense-by-id"; payload: { id: Expense["id"] } }
  | { type: "update-expense"; payload: { expense: Expense } }
  | { type: "reset-app" }
  | { type: "show-modal" }
  | { type: "close-modal" }
  | { type: "add-filter-category"; payload: { id: Category["id"] } }

/* =======================
   STORAGE
======================= */

const loadBudgets = () =>
  JSON.parse(localStorage.getItem("budgets") || '{"diario":0,"semanal":0,"mensual":0}')

const loadExpenses = (): Expense[] =>
  JSON.parse(localStorage.getItem("expenses") || "[]")

/* =======================
   INITIAL STATE
======================= */

export const initialState: BudgetState = {
  budgets: loadBudgets(),
  expenses: loadExpenses(),
  modal: false,
  editingId: "",
  currentCategory: "",
  currentRange: "diario"
}

/* =======================
   REDUCER
======================= */

export const budgetReducer = (
  state: BudgetState,
  action: BudgetActions
): BudgetState => {

  /* CAMBIAR CONTEXTO */
  if (action.type === "set-range") {
    return { ...state, currentRange: action.payload.range }
  }

  /* DEFINIR PRESUPUESTO */
  if (action.type === "add-budget") {
    const updated = {
      ...state.budgets,
      [state.currentRange]: action.payload.budget
    }

    localStorage.setItem("budgets", JSON.stringify(updated))
    return { ...state, budgets: updated }
  }

  /* AGREGAR GASTO */
  if (action.type === "add-expense") {
    const expense: Expense = {
      ...action.payload.expense,
      id: uuidv4(),
      range: state.currentRange       // ✅ SE FIJA AQUÍ
    }

    const updated = [...state.expenses, expense]
    localStorage.setItem("expenses", JSON.stringify(updated))

    return { ...state, expenses: updated, modal: false }
  }

  /* RESET SOLO DEL RANGO ACTUAL */
  if (action.type === "reset-app") {
    const range = state.currentRange

    const updatedBudgets = {
      ...state.budgets,
      [range]: 0
    }

    const updatedExpenses = state.expenses.filter(
      e => e.range !== range
    )

    localStorage.setItem("budgets", JSON.stringify(updatedBudgets))
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

    return {
      ...state,
      budgets: updatedBudgets,
      expenses: updatedExpenses,
      modal: false,
      editingId: ""
    }
  }

  /* MODAL */
  if (action.type === "show-modal") return { ...state, modal: true }
  if (action.type === "close-modal") return { ...state, modal: false, editingId: "" }

  /* FILTRO */
  if (action.type === "add-filter-category")
    return { ...state, currentCategory: action.payload.id }

  return state
}
