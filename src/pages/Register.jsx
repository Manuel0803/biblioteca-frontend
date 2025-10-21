import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataToSend = {
      ...userData,
      rol: 'SOCIO'
    };

    const result = await register(dataToSend);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.' }
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Registrar Usuario
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Todos los nuevos usuarios son registrados como <strong>Socios</strong>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Nombre"
                  value={userData.nombre}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Apellido"
                  value={userData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                className="input-field"
                placeholder="DNI"
                value={userData.dni}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Contraseña"
                value={userData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;