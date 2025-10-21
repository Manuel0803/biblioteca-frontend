import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return { 
      success: true, 
      usuario: data
    };
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data || 'Error al iniciar sesión';
    return { success: false, error: msg };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/registro', userData);
    return { success: true, data: response.data };
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data || 'Error al registrarse';
    return { success: false, error: msg };
  }
};