import api from './api';

export const libroService = {
  obtenerTodos: () => api.get('/libros'),
  obtenerPorId: (id) => api.get(`/libros/${id}`),
  buscarPorTitulo: (titulo) => api.get(`/libros/buscar/titulo?titulo=${titulo}`),
  buscarPorAutor: (autor) => api.get(`/libros/buscar/autor?autor=${autor}`),
  obtenerDisponibles: () => api.get('/libros/disponibles'),
  obtenerPorEstado: (estado) => api.get(`/libros/estado/${estado}`),
  crear: (libroData) => api.post('/libros', libroData),
  actualizar: (id, libroData) => api.put(`/libros/${id}`, libroData),
  eliminar: (id) => api.delete(`/libros/${id}`),
  verificarDisponibilidad: (id) => api.get(`/libros/${id}/disponible`)
};