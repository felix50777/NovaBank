import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [client, setClient] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        jwtDecode(token);
      } catch (err) {
        console.error("Token inválido:", err);
        setError("Sesión inválida. Por favor inicia sesión de nuevo.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      fetch("http://localhost:5000/api/auth/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.client) {
            setClient(data.client);
          } else {
            console.warn("No se recibió la información del cliente o el formato es incorrecto:", data);
            setClient(null);
          }

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
        })
        .catch((err) => {
          console.error("Error en fetch:", err);
          setError("No se pudo cargar la información. Intenta más tarde.");
          if (err.message.includes("401")) {
            localStorage.removeItem("token");
            navigate("/login");
          }
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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-tr from-blue-100 to-purple-100 py-8">
      {/* Contenedor principal - Ajustado para ser más amplio y tener margen */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl text-center">
        {/* Encabezado del Dashboard - Inspirado en la referencia */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-800">
              Bienvenido a <span className="text-blue-600">Nova</span>
              <span className="text-purple-600">Bank</span>
            </h1>
            {client && (
              <p className="text-xl text-gray-700 mt-2">
                Hola, <strong className="text-blue-700">{client.full_name}</strong> ¿Qué quieres hacer hoy?
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Aquí podrían ir iconos de notificaciones o perfil */}
            <span className="text-gray-600">📧 {client?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {client ? (
          <>
            {/* Sección de Acciones Rápidas - Inspirado en la referencia */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <button
    onClick={() => navigate("/transfer")}
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2"
  >
    <span role="img" aria-label="transferir">💸</span>
    <span>Transferir</span>
  </button>
  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2">
    <span role="img" aria-label="pagar">💳</span>
    <span>Pagar</span>
  </button>
  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2">
    <span role="img" aria-label="recargar">⚡</span>
    <span>Recargar</span>
  </button>
</div>

            {/* Sección de Cuentas - Diseño de Tarjetas */}
            <h2 className="text-2xl font-bold mb-4 text-blue-600">💰 Tus Cuentas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {accounts && accounts.length > 0 ? (
                accounts.map((account) => (
                  <div key={account.id} className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-48">
                    <div className="text-left">
                      <p className="text-sm font-semibold">{account.account_type}</p>
                      <p className="text-lg font-mono tracking-wider mt-1">No. cuenta: {account.account_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Balance Disponible</p>
                      <p className="text-3xl font-bold">${account.balance.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 text-gray-500">
                  <p>No tienes cuentas registradas.</p>
                  <p className="text-sm mt-2">Puedes abrir una nueva cuenta pronto.</p>
                </div>
              )}
            </div>

            {/* Sección de Tarjetas - Diseño de Tarjetas (con placeholders) */}
            <h2 className="text-2xl font-bold mb-4 text-purple-600">💳 Tus Tarjetas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {cards && cards.length > 0 ? (
                cards.map((card) => (
                  <div key={card.id} className="bg-gradient-to-br from-purple-500 to-red-500 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-48">
                    <div className="text-left">
                      <p className="text-sm font-semibold">{card.card_type} {card.provider}</p>
                      <p className="text-lg font-mono tracking-wider mt-1">{card.card_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Vencimiento</p>
                      <p className="text-xl font-bold">XX/XX</p> {/* Si no tienes la fecha de vencimiento en el modelo Card, esto es un placeholder */}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Tarjeta de ejemplo (Placeholder) */}
                  <div className="bg-gradient-to-br from-purple-500 to-red-500 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-48 opacity-75">
                    <div className="text-left">
                      <p className="text-sm font-semibold">Tarjeta de Débito NovaBank</p>
                      <p className="text-lg font-mono tracking-wider mt-1">XXXX XXXX XXXX 1234</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Vencimiento</p>
                      <p className="text-xl font-bold">12/28</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-gray-500">
                    <p>No tienes tarjetas asignadas. ¡Pronto podrás solicitar la tuya!</p>
                  </div>
                </>
              )}
            </div>

            {/* Sección de Últimos Movimientos - Placeholder */}
            <h2 className="text-2xl font-bold mb-4 text-gray-700">📊 Últimos Movimientos</h2>
            <div className="bg-gray-100 p-6 rounded-xl shadow-inner text-gray-600 h-48 flex items-center justify-center">
              <p>Historial de movimientos aquí (funcionalidad en desarrollo).</p>
            </div>
          </>
        ) : (
          <p className="text-gray-700">Cargando información del usuario...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

