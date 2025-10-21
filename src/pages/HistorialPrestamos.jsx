import React, { useState, useEffect } from 'react';
import { prestamoService } from '../services/prestamoService';

const HistorialPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroSocio, setFiltroSocio] = useState('');

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const response = await prestamoService.obtenerTodos();
      const prestamosDevueltos = response.data.filter(p => !p.activo);
      setPrestamos(prestamosDevueltos);
    } catch (error) {
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando historial...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Préstamos</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por socio
            </label>
            <input
              type="text"
              placeholder="Nombre del socio..."
              className="input-field"
              value={filtroSocio}
              onChange={(e) => setFiltroSocio(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm text-gray-600">
              <strong>{prestamos.length}</strong> préstamos devueltos en el historial
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Préstamos Devueltos</h2>
        
        {prestamos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay préstamos devueltos en el historial
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días de Préstamo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prestamos.map((prestamo) => (
                  <tr key={prestamo.idPrestamo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{prestamo.libro?.titulo}</div>
                      <div className="text-sm text-gray-500">{prestamo.libro?.autor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{prestamo.socio?.nombre}</div>
                      <div className="text-sm text-gray-500">N° {prestamo.socio?.nroSocio}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div>Inicio: {new Date(prestamo.fechaInicio).toLocaleDateString()}</div>
                        <div>Fin: {new Date(prestamo.fechaFin).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(prestamo.fechaFin) - new Date(prestamo.fechaInicio)) / (1000 * 60 * 60 * 24))} días
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Devuelto
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialPrestamos;