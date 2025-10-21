import api from './api';
import { EstadoDevolucion } from '../utils/enums';

export const prestamoService = {
  obtenerTodos: () => api.get('/prestamos'),
  obtenerPorId: (id) => api.get(`/prestamos/${id}`),
  obtenerActivos: () => api.get('/prestamos/activos'),
  obtenerPorSocio: (idSocio) => api.get(`/prestamos/socio/${idSocio}/activos`),
  crear: (prestamoData) => api.post('/prestamos', prestamoData),
  devolver: (idPrestamo, devolucionData) => {
    const requestBody = {
      estadoDevolucion: devolucionData.estadoDevolucion,
      observaciones: devolucionData.observaciones || ''
    };
    return api.put(`/prestamos/${idPrestamo}/devolucion`, requestBody);
  },
  renovar: (idPrestamo, nuevaFechaFin) => api.put(`/prestamos/${idPrestamo}/renovar`, { nuevaFechaFin }),
  obtenerConRetraso: () => api.get('/prestamos/retraso')
};

export { EstadoDevolucion };