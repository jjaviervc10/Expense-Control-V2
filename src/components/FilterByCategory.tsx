import type { ChangeEvent } from "react";
import { categories } from "../data/categories";

type Props = {
  onChange: (value: string) => void;
};

export default function FilterByCategory({ onChange }: Props) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value); // 👈 comunica al padre el ID seleccionado
  };

  return (
    <div className="bg-white bg-opacity-80 shadow-lg rounded-lg p-10">
      <form>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <label htmlFor="category">Filtrar Gastos </label>
          <select
            className="bg-slate-100 p-3 flex-1 rounded"
            id="category"
            onChange={handleChange}
          >
            <option value="">---Todas las Categorias---</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
}
