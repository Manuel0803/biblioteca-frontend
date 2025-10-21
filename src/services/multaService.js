import api from './api';

export const multaService = {
  obtenerTodas: () => api.get('/multas'),
  obtenerPorId: (id) => api.get(`/multas/${id}`),
  obtenerActivas: () => api.get('/multas/activas'),
  obtenerActivasPorSocio: (idSocio) => api.get(`/multas/socio/${idSocio}/activas`),
  crearManual: (multaData) => api.post('/multas', multaData),
  generarAutomatica: (idPrestamo) => api.post(`/multas/prestamo/${idPrestamo}/generar`),
  pagar: (idMulta) => api.put(`/multas/${idMulta}/pagar`),
  calcularTotalPendientes: (idSocio) => api.get(`/multas/socio/${idSocio}/total-pendiente`),
  tienePendientes: (idSocio) => api.get(`/multas/socio/${idSocio}/tiene-pendientes`)
};