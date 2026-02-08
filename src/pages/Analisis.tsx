import { useState, useMemo } from 'react';
import { useBudget } from '../hooks/useBudget';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AnimatedFinanceBackground from '../components/AnimatedFinanceBackground';

export default function Analisis() {
  const [showDiario, setShowDiario] = useState(true);
  const [showSemanal, setShowSemanal] = useState(true);
  const [showMensual, setShowMensual] = useState(true);
  const { state } = useBudget();
  const navigate = useNavigate();

  // Procesar gastos en una sola pasada O(n)
  const chartData = useMemo(() => {
    const map = new Map();
    for (const exp of state.expenses) {
      // Normalizar fecha a yyyy-mm-dd
      const date = exp.date instanceof Date ? exp.date.toISOString().slice(0, 10) : new Date(exp.date).toISOString().slice(0, 10);
      if (!map.has(date)) map.set(date, { date, diario: 0, semanal: 0, mensual: 0 });
      map.get(date)[exp.range] += exp.amount;
    }
    // Ordenar por fecha ascendente
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [state.expenses]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative overflow-hidden">
      <AnimatedFinanceBackground />
      <div className="relative z-10 min-h-screen bg-transparent p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="fixed top-4 left-4 bg-white text-blue-600 p-2 rounded-full shadow-lg border border-blue-500 hover:bg-blue-50 transition z-50"
          title="Volver al Dashboard"
          aria-label="Volver al Dashboard"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Análisis Avanzado de Gastos</h1>
        <div className="flex justify-center gap-4 mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showDiario} onChange={() => setShowDiario(v => !v)} />
            <span className="text-blue-500 font-medium">Diario</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showSemanal} onChange={() => setShowSemanal(v => !v)} />
            <span className="text-green-500 font-medium">Semanal</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showMensual} onChange={() => setShowMensual(v => !v)} />
            <span className="text-yellow-500 font-medium">Mensual</span>
          </label>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-4xl mx-auto">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {showDiario && <Line type="monotone" dataKey="diario" stroke="#3b82f6" strokeWidth={3} dot={false} />}
              {showSemanal && <Line type="monotone" dataKey="semanal" stroke="#10b981" strokeWidth={3} dot={false} />}
              {showMensual && <Line type="monotone" dataKey="mensual" stroke="#f59e0b" strokeWidth={3} dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
