import { useState } from "react";
import type { Expense } from "../types";
import { formatDate } from "../helpers";
import AmountDisplay from "./AmountDisplay";

// Importa tu listado de categorías
import { categories } from "../data/categories";

import {
  LeadingActions,
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import { useBudget } from "../hooks/useBudget";
import { useAuth } from "../context/AuthContext";
import { toggleFavorito } from "../api/favoritosApi";

type ExpenseDetailProps = {
  expense: Expense;
  onFavoritoChange?: () => void;
};

export default function ExpenseDetail({ expense, onFavoritoChange }: ExpenseDetailProps) {
  const { dispatch } = useBudget();
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(expense.favorito ?? false);
  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryInfo = categories.find((cat) => cat.name === expense.category);

  // Determinar mensaje contextual según el tipo de gasto
  const getMensajeFavorito = () => {
    const tipo = expense.range;
    if (tipo === 'diario') return 'Marcarás este gasto como un gasto que se repetirá cada día';
    if (tipo === 'semanal') return 'Marcarás este gasto como un gasto que se repetirá cada semana';
    if (tipo === 'mensual') return 'Marcarás este gasto como un gasto que se repetirá cada mes';
    return 'Marcar como gasto recurrente';
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que active el swipe
    
    if (!token) return;

    try {
      setIsAnimating(true);
      const nuevoEstado = !isFavorite;
      
      await toggleFavorito(token, expense.id, nuevoEstado);
      
      setIsFavorite(nuevoEstado);
      
      // Mostrar mensaje contextual
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      
      // Notificar al padre para refrescar lista
      if (onFavoritoChange) onFavoritoChange();
      
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  if (!categoryInfo) {
    console.warn("Categoría no encontrada:", expense.category);
    return (
      <div className="bg-white border p-5 text-red-500">
        Categoría desconocida: {expense.category}
      </div>
    );
  }

  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction
        onClick={() =>
          dispatch({
            type: "get-expense-by-id",
            payload: { id: expense.id },
          })
        }
      >
        Actualizar
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction
        onClick={() =>
          dispatch({ type: "remove-expense", payload: { id: expense.id } })
        }
        destructive={true}
      >
        Eliminar
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <>
      {/* Mensaje contextual flotante */}
      {showMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-down max-w-md text-center">
          {getMensajeFavorito()}
        </div>
      )}
      
      <SwipeableList>
        <SwipeableListItem
          maxSwipe={1}
          leadingActions={leadingActions()}
          trailingActions={trailingActions()}
        >
          <div className={`bg-white shadow-lg p-5 border-b border-gray-200 flex gap-5 items-center transition-all ${isFavorite ? 'border-l-4 border-l-yellow-400' : ''}`}>
            <div>
              <img
                src={`/icono_${categoryInfo.icon}.svg`}
                alt={`Icono de ${categoryInfo.name}`}
                className="w-20"
              />
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-sm font-bold uppercase text-slate-500">
                {categoryInfo.name}
              </p>
              <p>{expense.expenseName}</p>
              <p className="text-slate-600 text-sm">
                {formatDate(expense.date.toString())}
              </p>
            </div>

            <AmountDisplay amount={expense.amount} />
            
            {/* Botón de favorito */}
            <button
              onClick={handleToggleFavorite}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                isAnimating ? 'animate-bounce' : ''
              }`}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              title={isFavorite ? 'Quitar de favoritos' : getMensajeFavorito()}
            >
              {isFavorite ? (
                <span className="text-3xl text-yellow-400">⭐</span>
              ) : (
                <span className="text-3xl text-gray-300 hover:text-yellow-400">☆</span>
              )}
            </button>
          </div>
        </SwipeableListItem>
      </SwipeableList>
    </>
  );
}
