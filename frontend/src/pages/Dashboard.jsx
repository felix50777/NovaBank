import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Borrar token
    navigate("/login"); // Redirigir al login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenido a tu <span className="text-blue-600">Nova</span><span className="text-purple-600">Bank</span>
        </h1>

        {user ? (
          <>
            <p className="text-lg mb-2">👤 <strong>{user.name}</strong></p>
            <p className="text-gray-600 mb-4">📧 {user.email}</p>
            <p className="text-green-600 font-semibold mb-6">Tu sesión está activa ✅</p>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <p className="text-red-500">No hay usuario autenticado</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
