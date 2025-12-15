import { useContext, useMemo } from "react";
import { BudgetContext } from "../context/BudgetContext";
import type { Expense } from "../types";

export const useBudget = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }

  const { state, dispatch } = context;

  /* ==========================
     FILTRAR POR RANGO + CATEGORÍA
  ========================== */

  const filteredExpenses = useMemo(() => {
    return state.expenses.filter((expense: Expense) => {
      const matchRange = expense.range === state.currentRange;
      const matchCategory =
        state.currentCategory === "" ||
        expense.category === state.currentCategory;

      return matchRange && matchCategory;
    });
  }, [state.expenses, state.currentRange, state.currentCategory]);

  /* ==========================
     TOTALES
  ========================== */

  const currentBudget = state.budgets[state.currentRange];

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [filteredExpenses]);

  const remainingBudget = useMemo(() => {
    return currentBudget - totalExpenses;
  }, [currentBudget, totalExpenses]);

  return {
    state,
    dispatch,
    filteredExpenses,
    currentBudget,
    totalExpenses,
    remainingBudget
  };
};
