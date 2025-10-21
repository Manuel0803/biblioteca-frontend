import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials.email, credentials.password);
      if (!result.success) throw new Error(result.error);

      const userData = result.usuario;
      setUser(userData);

      return { success: true, data: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Error en el inicio de sesión'
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (!result.success) throw new Error(result.error);
      return { success: true, data: result.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Error en el registro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;