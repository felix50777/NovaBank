// frontend/src/pages/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { jwtDecode } from "jwt-decode"; // Importa jwtDecode

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Limpia sesiones antiguas
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Login API
      const data = await login({ email, password }); // Envía email y password como objeto

      // Guarda sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.client)); // Guarda el objeto cliente

      console.log("Login exitoso:", data);

      // Decodificar el token para obtener los claims (incluido is_admin)
      // Aunque data.client ya tiene is_admin, decodificar el token es la fuente más autoritativa
      const decodedToken = jwtDecode(data.token);
      console.log("Token decodificado en Login:", decodedToken);

      // ✅ Redirige condicionalmente usando el claim is_admin del token
      if (decodedToken.is_admin) { // Usa el claim del token para la verificación
        navigate("/admin"); // <--- ¡CORRECCIÓN AQUÍ! Redirige a /admin
      } else {
        navigate("/dashboard"); // Redirige al dashboard normal del cliente
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      // El error ya viene de authService.js con un mensaje, lo usamos directamente
      const msg = error.message || "Credenciales incorrectas";
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
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-purple-600"
            } text-white py-2 rounded-md transition`}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
