import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NovaBankLogo from '../assets/novabank-logo.png'; // Asegúrate de que esta ruta sea correcta

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllAccounts = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión.');
        navigate('/login'); // Redirige a la página de login general
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        // <<< INICIO DE CAMBIO: Usar decodedToken.is_admin directamente >>>
        // Verificar si el usuario es administrador usando el claim 'is_admin' del token
        if (!decodedToken.is_admin) {
          setError('Acceso denegado. Solo administradores pueden ver este panel.');
          navigate('/dashboard'); // Redirige a un dashboard normal si no es admin
          setLoading(false);
          return;
        }
        // <<< FIN DE CAMBIO >>>

        const response = await fetch('http://localhost:5000/api/admin/accounts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar las cuentas de administración.');
        }

        const data = await response.json();
        setAccounts(data); // Asume que el backend devuelve un array de objetos de cuenta
      } catch (err) {
        console.error('Error al cargar las cuentas del administrador:', err);
        setError(err.message || 'No se pudieron cargar las cuentas. Intenta de nuevo.');
        if (err.message.includes('token') || err.message.includes('sesión') || err.message.includes('Acceso denegado')) {
          localStorage.removeItem('token');
          navigate('/login'); // Redirige al login si hay problemas de autenticación
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllAccounts();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-tr from-blue-100 to-purple-100 py-8 px-4">
      {NovaBankLogo && (
        <img
          src={NovaBankLogo}
          alt="NovaBank Logo"
          className="mb-6 w-36 h-36 object-contain rounded-lg shadow-md"
        />
      )}
      {!NovaBankLogo && (
          <div className="w-36 h-18 mx-auto mb-6 bg-blue-200 flex items-center justify-center rounded-lg text-blue-800 font-bold text-lg">
              NovaBank Admin
          </div>
      )}

      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-6xl text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Panel de <span className="text-purple-600">Administración de Cuentas</span>
        </h2>

        {loading && <p className="text-blue-500 text-lg mb-4">Cargando cuentas...</p>}
        {error && <p className="text-red-500 text-lg mb-4 font-semibold">{error}</p>}

        {!loading && !error && accounts.length === 0 && (
          <p className="text-gray-600 text-lg">No hay cuentas registradas en el sistema.</p>
        )}

        {!loading && !error && accounts.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">ID Cuenta</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">ID Cliente</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Número de Cuenta</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Tipo de Cuenta</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Balance</th>
                  {/* <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Acciones</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-100 transition duration-150">
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{account.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{account.client_id}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{account.account_number}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 capitalize">{account.account_type}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 font-medium">${account.balance.toFixed(2)}</td>
                    {/* Puedes añadir botones de acción aquí (Editar, Eliminar) */}
                    {/* <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                      <button className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
