import { categories } from '../data/categories';

interface Product {
  nombre: string;
  precio: number;
  categoria: string;
}

interface ProductEditListProps {
  productos: Product[];
  onChange: (idx: number, categoria: string) => void;
}

export default function ProductEditList({ productos, onChange }: ProductEditListProps) {
  return (
    <div>
      {productos.map((producto, idx) => (
        <div key={idx} className="flex items-center justify-between bg-white shadow p-2 rounded mb-2">
          <span>{producto.nombre}</span>
          <span>${producto.precio}</span>
          <select value={producto.categoria} onChange={e => onChange(idx, e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
