import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegister } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    usuario: "",
    nombreCompleto: "",
    telefono: "",
    correo: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await apiRegister({
        usuario: form.usuario,
        nombreCompleto: form.nombreCompleto,
        correo: form.correo,
        pass: form.password,
        telefono: form.telefono || undefined,
      });

      alert("Registro exitoso. Ahora inicia sesión.");
      navigate("/login");
    } catch (error: any) {
      setErrorMsg(error.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Crear cuenta
        </h1>

        {errorMsg && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            name="usuario"
            placeholder="Nombre de usuario"
            value={form.usuario}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="text"
            name="nombreCompleto"
            placeholder="Nombre completo"
            value={form.nombreCompleto}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="tel"
            name="telefono"
            placeholder="Número de celular"
            value={form.telefono}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={form.correo}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded"
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
