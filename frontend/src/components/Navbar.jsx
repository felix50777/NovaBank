import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/Logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Nova<span className="text-purple-600">Bank</span>
        </Link>
        <Link to="/" className="flex items-center space-x-2">
  <img src={logo} alt="NovaBank Logo" className="h-8 w-8 object-contain" />
  <span className="text-2xl font-bold text-blue-600">Nova<span className="text-purple-600">Bank</span></span>
</Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <Link to="/login" className="hover:text-blue-600 transition">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="hover:text-purple-600 transition">
            Registrarse
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden px-4 pb-4">
          <Link
            to="/login"
            className="block py-2 text-sm text-gray-700 hover:text-blue-600"
            onClick={() => setOpen(false)}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="block py-2 text-sm text-gray-700 hover:text-purple-600"
            onClick={() => setOpen(false)}
          >
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
