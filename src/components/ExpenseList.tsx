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

  // Mensaje contextual según el tipo
  const getMensajeTipo = () => {
    if (tipo === 'diario') return 'cada día';
    if (tipo === 'semanal') return 'cada semana';
    if (tipo === 'mensual') return 'cada mes';
    return 'recurrentes';
  };



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
      {/* Header con leyenda de favoritos */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold">Listado de gastos</h2>
        
        {/* Leyenda de favoritos */}
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm">
          <span className="text-2xl">⭐</span>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700">Gastos recurrentes</span>
            <span className="text-gray-600 text-xs">
              Marca tus gastos que se repiten {getMensajeTipo()}
            </span>
          </div>
        </div>
      </div>

      {gastosFiltrados.map((expense) => (
        <ExpenseDetail 
          key={expense.id} 
          expense={expense}
        />
      ))}
    </div>
  );
}
