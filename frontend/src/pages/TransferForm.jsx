import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NovaBankLogo from '../assets/novabank-logo.png'; // <<--- asegúrate de tener esta imagen en la carpeta correcta

const TransferForm = () => {
  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAccounts = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión.');
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const clientId = decodedToken.sub;

        const response = await fetch('http://localhost:5000/api/auth/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar las cuentas.');
        }

        const data = await response.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          setUserAccounts(data.accounts);
          if (data.accounts.length > 0) {
            setSenderAccount(data.accounts[0].id);
          }
        } else {
          setError('No se encontraron cuentas para este usuario.');
          setUserAccounts([]);
        }
      } catch (err) {
        console.error('Error al cargar las cuentas:', err);
        setError(err.message || 'No se pudieron cargar las cuentas. Intenta de nuevo.');
        if (err.message.includes('token') || err.message.includes('sesión')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccounts();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay token de autenticación. Por favor, inicia sesión.');
      navigate('/login');
      setLoading(false);
      return;
    }

    if (!senderAccount || !receiverAccount || !amount) {
      setError('Por favor, completa todos los campos obligatorios.');
      setLoading(false);
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser un número positivo.');
      setLoading(false);
      return;
    }

    if (parseInt(senderAccount) === parseInt(receiverAccount)) {
      setError('No puedes transferir fondos a la misma cuenta de origen.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_account_id: parseInt(senderAccount),
          receiver_account_id: parseInt(receiverAccount),
          amount: parsedAmount,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la transferencia.');
      }

      setMessage(data.message || 'Transferencia realizada con éxito.');
      setReceiverAccount('');
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error('Error al realizar la transferencia:', err);
      setError(err.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100 p-4">
      <img
        src={NovaBankLogo}
        alt="NovaBank Logo"
        className="mb-4 w-32 h-32 object-contain"
      />

      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Realizar <span className="text-blue-600">Transferencia</span>
        </h2>

        {message && <p className="text-green-600 mb-4 font-semibold">{message}</p>}
        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
        {loading && <p className="text-blue-500 mb-4">Cargando...</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="senderAccount" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Cuenta de Origen:
            </label>
            <select
              id="senderAccount"
              value={senderAccount}
              onChange={(e) => setSenderAccount(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={loading || userAccounts.length === 0}
            >
              {userAccounts.length > 0 ? (
                userAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} ({account.account_number}) - Balance: ${account.balance.toFixed(2)}
                  </option>
                ))
              ) : (
                <option value="">Cargando cuentas...</option>
              )}
            </select>
            {userAccounts.length === 0 && !loading && !error && (
              <p className="text-red-500 text-xs italic mt-1">No tienes cuentas disponibles para transferir.</p>
            )}
          </div>

          <div>
            <label htmlFor="receiverAccount" className="block text-left text-gray-700 text-sm font-bold mb-2">
              ID de Cuenta Destino:
            </label>
            <input
              type="number"
              id="receiverAccount"
              value={receiverAccount}
              onChange={(e) => setReceiverAccount(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Ej: 123"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Monto:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: 100.00"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Descripción (Opcional):
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 resize-y"
              placeholder="Ej: Pago de alquiler"
              rows="3"
              disabled={loading}
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Realizar Transferencia'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
