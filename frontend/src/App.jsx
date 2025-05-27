import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from "./pages/Services";
import Help from "./pages/Help";
import Dashboard from "./pages/Dashboard";
import TransferForm from "./pages/TransferForm";
import PaymentForm from "./pages/PaymentForm";
import AdminDashboard from './pages/AdminDashboard'; // Asegúrate de que esta ruta sea correcta

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute"; // 👈 importamos

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20 px-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/help" element={<Help />} />

          {/* 🔒 Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          {/* <<< CORRECCIÓN AQUÍ: CAMBIADO /admin-dashboard A /admin >>> */}
          <Route
            path="/admin" // <--- ¡RUTA CORREGIDA! Ahora coincide con la redirección de Login.jsx
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          {/* <<< FIN DE CORRECCIÓN >>> */}
          <Route
            path="/transfer"
            element={
              <PrivateRoute>
                <TransferForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <PaymentForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
