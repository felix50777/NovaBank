import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  const [cip, setCip] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // ✅ Llama al register pasando todos los campos
      const data = await register({ full_name, email, phone_number, cip, password });

      console.log("Registro exitoso:", data);

      // ✅ Redirige al login
      navigate("/login");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al registrarse";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="text-blue-600">Nova</span>
          <span className="text-purple-600">Bank</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="text-red-500 text-sm text-center">{errorMsg}</div>
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">
              Nombre completo
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="mr-2 text-gray-400">👤</span>
              <input
                type="text"
                id="full_name"
                className="w-full focus:outline-none"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="mr-2 text-gray-400">📧</span>
              <input
                type="email"
                id="email"
                className="w-full focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

      {/* Teléfono */}
<div>
  <label htmlFor="phone_number" className="block text-sm font-medium mb-1">
    Número de teléfono
  </label>
  <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
    <span className="mr-2 text-gray-400">📱</span>
    <input
      type="tel"
      id="phone_number"
      className="w-full focus:outline-none"
      value={phone_number}
      onChange={(e) => setPhoneNumber(e.target.value)}
      required
    />
  </div>
</div>


          {/* CIP */}
          <div>
            <label htmlFor="cip" className="block text-sm font-medium mb-1">
              CIP (Código de Identificación Personal)
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
              <span className="mr-2 text-gray-400">🆔</span>
              <input
                type="text"
                id="cip"
                className="w-full focus:outline-none"
                value={cip}
                onChange={(e) => setCip(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400">
              <span className="mr-2 text-gray-400">🔒</span>
              <input
                type="password"
                id="password"
                className="w-full focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-purple-600 hover:bg-blue-600"
            } text-white py-2 rounded-md transition`}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
