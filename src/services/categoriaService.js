import api from './api';

export const categoriaService = {
  obtenerTodas: () => api.get('/categorias'),
  obtenerPorId: (id) => api.get(`/categorias/${id}`),
  buscarPorNombre: (nombre) => api.get(`/categorias/buscar?nombre=${nombre}`),
  crear: (categoriaData) => api.post('/categorias', categoriaData),
  actualizar: (id, categoriaData) => api.put(`/categorias/${id}`, categoriaData),
  eliminar: (id) => api.delete(`/categorias/${id}`)
};