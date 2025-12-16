import type { Category, Expense, ReportRange } from "../types";

/* =======================
   STATE
======================= */

export type BudgetState = {
  budgets: {
    diario: number;
    semanal: number;
    mensual: number;
  };
  expenses: Expense[];
  modal: boolean;
  editingId: Expense["id"];
  currentCategory: Category["id"];
  currentRange: ReportRange;
};

/* =======================
   ACTIONS
======================= */

export type BudgetActions =
  | { type: "set-range"; payload: { range: ReportRange } }
  | { type: "add-budget"; payload: { budget: number } }
  | { type: "add-expense"; payload: { expense: Expense } }
  | { type: "remove-expense"; payload: { id: Expense["id"] } }
  | { type: "get-expense-by-id"; payload: { id: Expense["id"] } }
  | { type: "update-expense"; payload: { expense: Expense } }
  | { type: "reset-app" }
  | { type: "show-modal" }
  | { type: "close-modal" }
  | { type: "add-filter-category"; payload: { id: Category["id"] } };

/* =======================
   INITIAL STATE
======================= */

export const initialState: BudgetState = {
  budgets: JSON.parse(localStorage.getItem("budgets") || '{"diario":0,"semanal":0,"mensual":0}'),
  expenses: [], // ✅ NO cargamos desde localStorage
  modal: false,
  editingId: "",
  currentCategory: "",
  currentRange: "diario",
};

/* =======================
   REDUCER
======================= */

export const budgetReducer = (
  state: BudgetState,
  action: BudgetActions
): BudgetState => {
  switch (action.type) {
    case "set-range":
      return { ...state, currentRange: action.payload.range };

    case "add-budget": {
      const updated = {
        ...state.budgets,
        [state.currentRange]: action.payload.budget,
      };
      localStorage.setItem("budgets", JSON.stringify(updated));
      return { ...state, budgets: updated };
    }

    case "add-expense":
      return {
        ...state,
        expenses: [...state.expenses, action.payload.expense],
        modal: false,
      };

    case "remove-expense":
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload.id),
      };

    case "get-expense-by-id":
      return {
        ...state,
        editingId: action.payload.id,
        modal: true,
      };

    case "update-expense":
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.expense.id ? action.payload.expense : e
        ),
        modal: false,
        editingId: "",
      };

    case "reset-app": {
      const range = state.currentRange;
      const updatedBudgets = {
        ...state.budgets,
        [range]: 0,
      };
      localStorage.setItem("budgets", JSON.stringify(updatedBudgets));
      return {
        ...state,
        budgets: updatedBudgets,
        expenses: state.expenses.filter(e => e.range !== range),
        modal: false,
        editingId: "",
      };
    }

    case "show-modal":
      return { ...state, modal: true };

    case "close-modal":
      return { ...state, modal: false, editingId: "" };

    case "add-filter-category":
      return { ...state, currentCategory: action.payload.id };

    default:
      return state;
  }
};
