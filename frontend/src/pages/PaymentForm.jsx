import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Asegúrate de que la ruta a tu logo sea correcta.
// Si 'novabank-logo.png' no existe o no se carga, considera usar un SVG o un placeholder.
import bankLogo from '../assets/novabank-logo.png'; // Verifica esta ruta

const PaymentForm = () => {
  const [senderAccount, setSenderAccount] = useState(''); // ID de la cuenta de origen seleccionada
  const [paymentEntityName, setPaymentEntityName] = useState(''); // Nuevo campo para el nombre de la entidad
  const [amount, setAmount] = useState(''); // Monto del pago
  const [referenceNumber, setReferenceNumber] = useState(''); // Número de referencia del servicio
  const [description, setDescription] = useState(''); // Descripción del pago
  const [userAccounts, setUserAccounts] = useState([]); // Cuentas del usuario logeado
  const [message, setMessage] = useState(''); // Mensajes de éxito
  const [error, setError] = useState(''); // Mensajes de error
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAccounts = async () => {
      setLoading(true);
      setError('');
      setMessage(''); // Limpiar mensajes al cargar cuentas
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
            setSenderAccount(data.accounts[0].id); // Selecciona la primera cuenta por defecto
          }
        } else {
          setError('No se encontraron cuentas para este usuario.');
          setUserAccounts([]); // Asegura que el array esté vacío si no hay cuentas
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

    // Validaciones básicas del formulario
    if (!senderAccount || !amount || !paymentEntityName || !referenceNumber) {
      setError('Por favor, completa todos los campos obligatorios: Cuenta, Entidad, Monto y Número de Referencia.');
      setLoading(false);
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser un número positivo.');
      setLoading(false);
      return;
    }

    try {
      // NOTA: El endpoint '/api/payments' aún no está implementado en el backend.
      // Este formulario está listo para enviar los datos a ese endpoint.
      // Necesitarás crear la ruta y la lógica en Flask para manejar pagos de servicios.
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_account_id: parseInt(senderAccount), // Asegúrate de enviar como entero
          payment_entity_name: paymentEntityName, // Nuevo campo
          amount: parsedAmount,
          reference_number: referenceNumber,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al realizar el pago.');
      }

      setMessage(data.message || 'Pago realizado exitosamente.');
      // Opcional: Limpiar el formulario después de un pago exitoso
      setPaymentEntityName('');
      setAmount('');
      setReferenceNumber('');
      setDescription('');
      // Opcional: Recargar cuentas para actualizar el balance en el selector
      // fetchUserAccounts(); // Descomentar si quieres actualizar el balance de la cuenta de origen inmediatamente
    } catch (err) {
      console.error('Error al enviar el pago:', err);
      setError(err.message || 'Hubo un problema al realizar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100 p-4">
      <div className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
        {/* Logo del banco */}
        {bankLogo && (
            <img src={bankLogo} alt="Banco Logo" className="w-32 mx-auto mb-6 rounded-lg" />
        )}
        {!bankLogo && (
            <div className="w-32 h-16 mx-auto mb-6 bg-blue-200 flex items-center justify-center rounded-lg text-blue-800 font-bold">
                NovaBank
            </div>
        )}

        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Realizar <span className="text-blue-600">Pago de Servicio</span>
        </h2>

        {message && <p className="text-green-600 mb-4 font-semibold">{message}</p>}
        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

        {loading && <p className="text-blue-500 mb-4">Cargando...</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo de selección de cuenta de origen */}
          <div>
            <label htmlFor="senderAccount" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Seleccionar Cuenta de Origen:
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
                <p className="text-red-500 text-xs italic mt-1">No tienes cuentas disponibles para realizar pagos.</p>
            )}
          </div>

          {/* Nuevo campo: Nombre de la Entidad del Pago */}
          <div>
            <label htmlFor="paymentEntityName" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Nombre de la Entidad del Pago:
            </label>
            <input
              type="text"
              id="paymentEntityName"
              value={paymentEntityName}
              onChange={(e) => setPaymentEntityName(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Ej: Luz del Sur, Agua Potable, Claro"
              required
              disabled={loading}
            />
          </div>

          {/* Campo de número de referencia */}
          <div>
            <label htmlFor="referenceNumber" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Número de Referencia del Servicio:
            </label>
            <input
              type="text"
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: 1234567890"
              required
              disabled={loading}
            />
          </div>

          {/* Campo de monto */}
          <div>
            <label htmlFor="amount" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Monto a Pagar:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
              placeholder="Ej: 50.00"
              step="0.01" // Permite decimales
              required
              disabled={loading}
            />
          </div>

          {/* Campo de descripción */}
          <div>
            <label htmlFor="description" className="block text-left text-gray-700 text-sm font-bold mb-2">
              Descripción (Opcional):
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y"
              placeholder="Ej: Pago mensual de electricidad"
              rows="3"
              disabled={loading}
            ></textarea>
          </div>

          {/* Botón de enviar con estilos mejorados */}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Procesando Pago...' : 'Realizar Pago'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
