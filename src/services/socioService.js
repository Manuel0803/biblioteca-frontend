import api from './api';

export const socioService = {
  obtenerTodos: () => api.get('/socios'),
  obtenerPorId: (id) => api.get(`/socios/${id}`),
  obtenerPorDni: (dni) => api.get(`/socios/dni/${dni}`),
  obtenerPorNumero: (nroSocio) => api.get(`/socios/numero/${nroSocio}`),
  buscarPorNombre: (nombre) => api.get(`/socios/buscar/nombre?nombre=${nombre}`),
  crear: (socioData) => api.post('/socios', socioData),
  actualizar: (id, socioData) => api.put(`/socios/${id}`, socioData),
  eliminar: (id) => api.delete(`/socios/${id}`),
  tienePrestamosActivos: (id) => api.get(`/socios/${id}/prestamos-activos`),
  
  obtenerUltimoNumero: async () => {
    try {
      const response = await api.get('/socios');
      const socios = response.data;
      
      if (socios.length === 0) {
        return 1000;
      }
      
      const maxNroSocio = Math.max(...socios.map(socio => socio.nroSocio));
      return maxNroSocio;
    } catch (error) {
      console.error('Error al obtener último número de socio:', error);
      throw error;
    }
  }
};