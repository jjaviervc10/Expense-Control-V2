import { useState, useEffect } from "react";
import type { ChangeEvent} from "react"
import DatePicker from "react-date-picker";
import type { DraftExpense, Value, ReportRange } from "../types";
import { categories } from "../data/categories";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";
import { apiCrearGasto } from "../api/expensesApi";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

export default function ExpenseForm() {
  const { dispatch, state, remainingBudget } = useBudget();

  const [expense, setExpense] = useState<DraftExpense>({
    expenseName: "",
    amount: 0,
    category: "", // 👈 AQUÍ guardamos el NOMBRE, no ID
    date: new Date(),
    range: state.currentRange,
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [error, setError] = useState("");
  const [previousAmount, setPreviousAmount] = useState(0);

  /* ======================= MONTAJE ======================= */
  useEffect(() => {
    if (state.editingId) {
      const editingExpense = state.expenses.find(
        (e) => e.id === state.editingId
      );

      if (editingExpense) {
        const cat = categories.find(
          (c) => c.name === editingExpense.category
        );

        setExpense(editingExpense);
        setSelectedCategoryId(cat?.id || "");
        setPreviousAmount(editingExpense.amount);
      }
    }
  }, [state.editingId, state.expenses]);

  /* ======================= HANDLERS ======================= */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setExpense({
      ...expense,
      [name]: name === "amount" ? +value : value,
    });
  };

  const handleCategoryChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value;
    const categoryInfo = categories.find((c) => c.id === id);

    if (!categoryInfo) return;

    setSelectedCategoryId(id);
    setExpense({
      ...expense,
      category: categoryInfo.name, // 👈 GUARDAMOS NOMBRE
    });
  };

  const handleChangeDate = (value: Value) => {
    if (!value) return;
    const date = Array.isArray(value) ? value[0] : value;
    if (date) setExpense({ ...expense, date });
  };

  /* ======================= SUBMIT ======================= */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const tipo = state.currentRange;

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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No autenticado");
      return;
    }

    try {
      const response = await apiCrearGasto(token, {
        tipo,
        categoria: selectedCategoryId, // 👈 backend recibe ID
        monto: expense.amount,
        fecha: expense.date.toISOString(),
      });

      // 🔥 Guardamos en estado con NOMBRE
      dispatch({
        type: "add-expense",
        payload: {
          expense: {
            id: String(response.idGasto),
            expenseName: expense.expenseName,
            amount: expense.amount,
            category: response.categoria, // 👈 nombre desde backend
            date: new Date(response.fecha),
            range: tipo as ReportRange,
          },
        },
      });

      // Reset
      setExpense({
        expenseName: "",
        amount: 0,
        category: "",
        date: new Date(),
        range: tipo as ReportRange,
      });

      setSelectedCategoryId("");
      setPreviousAmount(0);
      dispatch({ type: "close-modal" });
    } catch (err) {
      console.error(err);
      setError("Error al guardar el gasto");
    }
  };

  /* ======================= UI ======================= */

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
        {state.editingId ? "Editar Gasto" : "Nuevo Gasto"}
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
        value={selectedCategoryId}
        onChange={handleCategoryChange}
        className="w-full bg-slate-100 p-2"
      >
        <option value="">-- Selecciona una categoría --</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <DatePicker value={expense.date} onChange={handleChangeDate} />

      <input
        type="submit"
        value={state.editingId ? "Guardar Cambios" : "Registrar Gasto"}
        className="bg-blue-600 w-full p-2 text-white uppercase font-bold rounded-lg"
      />
    </form>
  );
}
