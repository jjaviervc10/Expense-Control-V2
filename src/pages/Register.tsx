import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("No user ID returned from Supabase Auth");

      // 2. Insertar datos adicionales en la tabla sUsuario
      const { error: insertError } = await supabase
        .from("sUsuario")
        .insert([
          {
            idUsuario: userId,
            correo: form.email,
            nombre: form.nombre,
            activo: true,
            fechaAlta: new Date(),
          },
        ]);

      if (insertError) throw insertError;

      alert("Registro exitoso. Inicia sesión.");
      navigate("/login");

    } catch (error: any) {
      setErrorMsg(error.message);
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
            name="nombre"
            placeholder="Nombre completo"
            onChange={handleChange}
            value={form.nombre}
            className="border p-2 rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            onChange={handleChange}
            value={form.email}
            className="border p-2 rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            value={form.password}
            className="border p-2 rounded"
            minLength={6}
            required
          />

          <button
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 transition"
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
