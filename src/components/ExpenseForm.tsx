import { useState, useEffect } from "react";
import type {ChangeEvent} from "react";
import DatePicker from "react-date-picker";
import type { DraftExpense, Value } from "../types";
import { categories } from "../data/categories";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

export default function ExpenseForm() {
  const { dispatch, state, remainingBudget } = useBudget();

  const [expense, setExpense] = useState<DraftExpense>({
    expenseName: "",
    amount: 0,
    category: "",
    date: new Date(),
    range: state.currentRange
  });

  const [error, setError] = useState("");
  const [previousAmount, setPreviousAmount] = useState(0);

  /* ==========================
     EDICIÓN
  ========================== */

  useEffect(() => {
    if (state.editingId) {
      const editingExpense = state.expenses.find(
        e => e.id === state.editingId
      );

      if (editingExpense) {
        setExpense(editingExpense);
        setPreviousAmount(editingExpense.amount);
      }
    }
  }, [state.editingId, state.expenses]);

  /* ==========================
     HANDLERS
  ========================== */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setExpense({
      ...expense,
      [name]: name === "amount" ? +value : value
    });
  };

 
  
  const handleChangeDate = (value: Value) => {
  if (!value) return;

  // Si viene un rango, tomamos la primera fecha
  if (Array.isArray(value)) {
    if (value[0]) {
      setExpense({
        ...expense,
        date: value[0]
      });
    }
    return;
  }

  // Si viene una sola fecha
  setExpense({
    ...expense,
    date: value
  });
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !expense.expenseName ||
      !expense.category ||
      expense.amount <= 0
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (expense.amount - previousAmount > remainingBudget) {
      setError("Se ha superado el presupuesto disponible");
      return;
    }

    if (state.editingId) {
      dispatch({
        type: "update-expense",
        payload: { expense: { ...expense, id: state.editingId } }
      });
    } else {
      dispatch({ type: "add-expense", payload: { expense } });
    }

    setExpense({
      expenseName: "",
      amount: 0,
      category: "",
      date: new Date(),
      range: state.currentRange
    });

    setPreviousAmount(0);
  };

  /* ==========================
     UI
  ========================== */

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
        {state.editingId ? "Guardar Cambio" : "Nuevo Gasto"}
      </legend>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <input
        type="text"
        name="expenseName"
        placeholder="Nombre del gasto"
        className="w-full bg-slate-100 p-2"
        value={expense.expenseName}
        onChange={handleChange}
      />

      <input
        type="number"
        name="amount"
        placeholder="Cantidad"
        className="w-full bg-slate-100 p-2"
        value={expense.amount}
        onChange={handleChange}
      />

      <select
        name="category"
        className="w-full bg-slate-100 p-2"
        value={expense.category}
        onChange={handleChange}
      >
        <option value="">-- Selecciona una categoría --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <DatePicker
        value={expense.date}
        onChange={handleChangeDate}
       
      />

      <input
        type="submit"
        value={state.editingId ? "Guardar Cambios" : "Registrar Gasto"}
        className="bg-blue-600 w-full p-2 text-white uppercase font-bold rounded-lg"
      />
    </form>
  );
}
