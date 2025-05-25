import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NovaBankLogo from '../assets/novabank-logo.png'; // <<--- asegúrate de tener esta imagen en la carpeta correcta

const TransferForm = () => {
  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState(''); // Cambiado a Number por AccountNumber
  const [receiverName, setReceiverName] = useState(''); // Nuevo campo para el nombre del destinatario
  const [receiverBank, setReceiverBank] = useState('NovaBank'); // Nuevo campo para el banco del destinatario, por defecto NovaBank
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
        // const clientId = decodedToken.sub; // Puedes usar esto si necesitas el ID del cliente para el endpoint

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

    if (!senderAccount || !receiverAccountNumber || !receiverName || !receiverBank || !amount) {
      setError('Por favor, completa todos los campos obligatorios: Cuenta de Origen, Número de Cuenta Destino, Nombre del Destinatario, Banco y Monto.');
      setLoading(false);
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser un número positivo.');
      setLoading(false);
      return;
    }

    // Aquí, senderAccount y receiverAccountNumber no pueden ser el mismo ID,
    // pero si receiverBank es 'NovaBank', también debemos evitar que el número de cuenta
    // de destino sea el mismo que el número de cuenta de origen.
    // Esto requeriría obtener el account_number de senderAccount desde userAccounts.
    // Por ahora, mantenemos la validación de ID si es para IDs internos.
    // Si receiverAccountNumber es el número de cuenta, la validación se hace más compleja aquí.

    // Si estás usando `receiverAccountNumber` como el número de cuenta (string),
    // y no como el ID de la cuenta, la siguiente validación NO tiene sentido si el receptor es del mismo usuario.
    // Por simplicidad para una transferencia interna de un mismo usuario,
    // es mejor dejarlo como `receiver_account_id` en el backend.
    // Sin embargo, si quieres que 'receiverAccountNumber' sea el número de cuenta literal,
    // y no el ID, entonces necesitamos adaptar el backend para buscar por número de cuenta.
    // Para esta versión, lo dejo como si receiverAccountNumber fuera el string del número de cuenta,
    // y el backend tendrá que manejar la búsqueda por número de cuenta.

    try {
      const response = await fetch('http://localhost:5000/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_account_id: parseInt(senderAccount), // ID de la cuenta de origen
          receiver_account_number: receiverAccountNumber, // Número de cuenta del destinatario
          receiver_name: receiverName, // Nombre del destinatario
          receiver_bank: receiverBank, // Banco del destinatario
          amount: parsedAmount,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la transferencia.');
      }

      setMessage(data.message || 'Transferencia realizada con éxito.');
      setReceiverAccountNumber('');
      setReceiverName('');
      setAmount('');
      setDescription('');
      // Opcional: recargar las cuentas para actualizar el balance visible
      // fetchUserAccounts();
    } catch (err) {
      console.error('Error al realizar la transferencia:', err);
      setError(err.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100 p-4">
      {NovaBankLogo && (
        <img
          src={NovaBankLogo}
          alt="NovaBank Logo"
          className="mb-4 w-32 h-32 object-contain rounded-lg shadow-md"
        />
      )}
      {!NovaBankLogo && (
          <div className="w-32 h-16 mx-auto mb-6 bg-blue-200 flex items-center justify-center rounded-lg text-blue-800 font-bold">
              NovaBank
          </div>
      )}

      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Realizar <span className="text-blue-600">Transferencia</span>
        </h2>

        {message && <p className="text-green-600 mb-4 font-semibold">{message}</p>}
        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
        {loading && <p className="text-blue-500 mb-4">Cargando...</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cuenta de Origen */}
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

          {/* Nombre del Destinatario (Nuevo) */}
          <div>
            <label htmlFor="receiverName" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Nombre del Destinatario:
            </label>
            <input
              type="text"
              id="receiverName"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Nombre completo del beneficiario"
              required
              disabled={loading}
            />
          </div>

          {/* Banco del Destinatario (Nuevo) */}
          <div>
            <label htmlFor="receiverBank" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Banco del Destinatario:
            </label>
            <select
              id="receiverBank"
              value={receiverBank}
              onChange={(e) => setReceiverBank(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={loading}
            >
              <option value="NovaBank">NovaBank</option>
              {/* Más adelante puedes agregar: <option value="Otro Banco">Otro Banco</option> */}
            </select>
          </div>

          {/* Número de Cuenta Destino */}
          <div>
            <label htmlFor="receiverAccountNumber" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Número de Cuenta Destino:
            </label>
            <input
              // Cambiado a type="text" para permitir números de cuenta con formato no solo numérico
              type="text"
              id="receiverAccountNumber"
              value={receiverAccountNumber}
              onChange={(e) => setReceiverAccountNumber(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Ej: 001-123456789-01" // Ejemplo de formato más real
              required
              disabled={loading}
            />
          </div>

          {/* Monto */}
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

          {/* Descripción */}
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

          {/* Botón de Enviar */}
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
