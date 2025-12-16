import ExpenseDetail from "./ExpenseDetail";
import { useGastosPorTipo } from "../hooks/useGastosPorTipo";
import { categories } from "../data/categories";

type Props = {
  tipo: "diario" | "semanal" | "mensual";
  refresh: number;
  filterCategory: string;
};

export default function ExpenseList({ tipo, refresh, filterCategory }: Props) {
  const { gastos, loading, error } = useGastosPorTipo(tipo, refresh);
  console.log("DEBUG GASTOS: ", gastos);
console.log("FILTRO ACTUAL: ", filterCategory);



    const gastosFiltrados = filterCategory
  ? gastos.filter(gasto => {
      const cat = categories.find(c => c.id === filterCategory);
      return cat ? gasto.category === cat.name : false;
    })
  : gastos;

  if (loading) {
    return <p className="text-center text-gray-600 mt-10">Cargando gastos...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">
        Hubo un error al cargar los gastos: {error}
      </p>
    );
  }

  if (gastosFiltrados.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        No hay gastos registrados
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-5">
      <h2 className="text-2xl font-bold">Listado de gastos</h2>

      {gastosFiltrados.map((expense) => (
        <ExpenseDetail key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
