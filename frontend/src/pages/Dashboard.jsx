import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si hay token
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      // No hay sesión, redirige al login
      navigate("/login");
    } else {
      // Hay sesión activa, carga usuario
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    // Limpia localStorage y redirige al login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-purple-100 to-blue-100">
      <h1 className="text-4xl font-bold mb-6">
        Bienvenido,{" "}
        <span className="text-purple-600">
          {user?.name || "Usuario"}
        </span>{" "}
        👋
      </h1>
      <p className="mb-4 text-gray-600">{user?.email}</p>
      <button
        onClick={handleLogout}
        className="bg-purple-600 hover:bg-blue-600 text-white py-2 px-6 rounded-xl transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;
