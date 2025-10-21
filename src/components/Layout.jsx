import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation, Outlet } from 'react-router-dom';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Libros', href: '/libros' },
    { name: 'Categorías', href: '/categorias' },
    { name: 'Socios', href: '/socios' },
    { name: 'Préstamos', href: '/prestamos' },
    { name: 'Historial', href: '/historial-prestamos' },
    { name: 'Multas', href: '/multas' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Sistema Biblioteca</h1>
          <p className="text-sm text-gray-600 mt-1">Bienvenido, {user?.nombre}</p>
        </div>
        
        <nav className="mt-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.href 
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full btn-secondary"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;