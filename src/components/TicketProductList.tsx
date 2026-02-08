import { categories } from '../data/categories';

export interface TicketProduct {
  name: string;
  amount: number;
  category: string;
}

interface TicketProductListProps {
  products: TicketProduct[];
  onChange: (products: TicketProduct[]) => void;
}

export default function TicketProductList({ products, onChange }: TicketProductListProps) {
  const handleCategoryChange = (idx: number, category: string) => {
    const updated = products.map((p, i) => i === idx ? { ...p, category } : p);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {products.map((product, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="font-semibold text-gray-700">{product.name}</span>
          <span className="text-blue-600">${product.amount.toFixed(2)}</span>
          <select
            value={product.category}
            onChange={e => handleCategoryChange(idx, e.target.value)}
            className="border rounded px-2 py-1"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
