import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [client, setClient] = useState(null); // Cambiado a client
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // No estamos usando decoded directamente, pero podríamos necesitarlo para otros fines
        // setUser(decoded);
      } catch (err) {
        console.error("Token inválido:", err);
        setError("Sesión inválida. Por favor inicia sesión de nuevo.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      console.log("Token a enviar:", token);
      console.log("Enviando solicitud a:", "http://localhost:5000/api/auth/dashboard");

      // Fetch de cuentas y tarjetas desde backend
      fetch("http://localhost:5000/api/auth/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("Respuesta recibida:", res);
          if (!res.ok) {
            throw new Error(`Error ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Validación defensiva y asignación directa desde la respuesta
          if (data && data.accounts && Array.isArray(data.accounts)) {
            setAccounts(data.accounts);
          } else {
            setAccounts([]);
            console.warn("No se recibieron cuentas o el formato es incorrecto:", data);
          }

          if (data && data.cards && Array.isArray(data.cards)) {
            setCards(data.cards);
          } else {
            setCards([]);
            console.warn("No se recibieron tarjetas o el formato es incorrecto:", data);
          }
          if (data && data.client) {
            setClient(data.client); // Asignamos data.client a client
          }


          // Log de los datos recibidos del backend para depuración
          console.log("Datos recibidos del backend:", data);
        })
        .catch((err) => {
          console.log("Error en fetch:", err);
          console.error("Error en fetch:", err);
          setError("No se pudo cargar la información. Intenta más tarde.");
        });
    } else {
      setError("No hay token encontrado. Por favor inicia sesión.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenido a tu <span className="text-blue-600">Nova</span>
          <span className="text-purple-600">Bank</span>
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {client ? ( // Usamos client en lugar de user
          <>
            <p className="text-lg mb-2">
              👤 <strong>{client.full_name}</strong>
            </p>
            <p className="text-gray-600 mb-4">📧 {client.email}</p>
            <p className="text-green-600 font-semibold mb-6">Tu sesión está activa ✅</p>

            {/* Mostrar cuentas */}
            <h2 className="text-xl font-semibold mb-2 text-blue-600">💰 Cuentas</h2>
            {accounts && accounts.length > 0 ? (
              <ul className="mb-6">
                {accounts.map((account) => (
                  <li key={account.id} className="text-gray-700 mb-1">
                    {account.account_type} - Balance: ${account.balance.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-6">No tienes cuentas registradas.</p>
            )}

            {/* Mostrar tarjetas */}
            <h2 className="text-xl font-semibold mb-2 text-purple-600">💳 Tarjetas</h2>
            {cards && cards.length > 0 ? (
              <ul className="mb-6">
                {cards.map((card) => (
                  <li key={card.id} className="text-gray-700 mb-1">
                    {card.card_type} - {card.provider} : {card.card_number}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mb-6">No tienes tarjetas registradas.</p>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <p>Cargando información del usuario...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
