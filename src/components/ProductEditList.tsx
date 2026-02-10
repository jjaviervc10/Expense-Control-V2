import { categories } from '../data/categories';

import type { TicketProduct } from "./TicketProductList";

// type Product = TicketProduct; // Eliminado porque no se usa
interface ProductEditListProps {
  productos: TicketProduct[];
  onChange: (idx: number, categoria: string) => void;
}

export default function ProductEditList({ productos, onChange }: ProductEditListProps) {
  return (
    <div>
      {productos.map((producto, idx) => (
        <div key={idx} className="flex items-center justify-between bg-white shadow p-2 rounded mb-2">
          <span>{producto.name}</span>
          <span>${producto.amount}</span>
          <select value={producto.category} onChange={e => onChange(idx, e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
