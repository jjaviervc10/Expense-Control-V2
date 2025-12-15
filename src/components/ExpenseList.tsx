import { useBudget } from "../hooks/useBudget";
import ExpenseDetail from "./ExpenseDetail";

export default function ExpenseList() {
  const { filteredExpenses } = useBudget();

  if (filteredExpenses.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        No hay gastos para esta categoría
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-5">
      <h2 className="text-2xl font-bold">Listado de gastos</h2>

      {filteredExpenses.map(expense => (
        <ExpenseDetail
          key={expense.id}
          expense={expense}
        />
      ))}
    </div>
  );
}
