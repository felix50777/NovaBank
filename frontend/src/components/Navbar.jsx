import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/Logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const linkStyles =
    "hover:text-blue-600 hover:border-b-2 hover:border-purple-600 transition duration-300";

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo + Nombre */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="NovaBank Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-bold text-blue-600">
            Nova<span className="text-purple-600">Bank</span>
          </span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-6 text-sm font-medium items-center">
          <Link to="/login" className={linkStyles}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className={linkStyles}>
            Registrarse
          </Link>
          <Link to="/about" className={linkStyles}>
            Sobre Nosotros
          </Link>
          <Link to="/contact" className={linkStyles}>
            Contáctenos
          </Link>
          <Link to="/services" className={linkStyles}>
            Servicios
          </Link>
          <Link to="/help" className={linkStyles}>
            Ayuda
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
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/login" className={linkStyles} onClick={() => setOpen(false)}>
            Iniciar Sesión
          </Link>
          <Link to="/register" className={linkStyles} onClick={() => setOpen(false)}>
            Registrarse
          </Link>
          <Link to="/about" className={linkStyles} onClick={() => setOpen(false)}>
            Sobre Nosotros
          </Link>
          <Link to="/contact" className={linkStyles} onClick={() => setOpen(false)}>
            Contáctenos
          </Link>
          <Link to="/services" className={linkStyles} onClick={() => setOpen(false)}>
            Servicios
          </Link>
          <Link to="/help" className={linkStyles} onClick={() => setOpen(false)}>
            Ayuda
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
