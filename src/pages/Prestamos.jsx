import React, { useState, useEffect } from 'react';
import { prestamoService } from '../services/prestamoService';
import PrestamoForm from '../components/PrestamoForm';
import DevolucionForm from '../components/DevolucionForm';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroActivos, setFiltroActivos] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [showDevolverConfirm, setShowDevolverConfirm] = useState(false);
  const [prestamoADevolver, setPrestamoADevolver] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDevolucionForm, setShowDevolucionForm] = useState(false);

  useEffect(() => {
    cargarPrestamos();
  }, []);

  useEffect(() => {
    filtrarPrestamos();
  }, [filtroActivos, prestamos]);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const response = await prestamoService.obtenerTodos();
      setPrestamos(response.data);
    } catch (error) {
      setError('Error al cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPrestamos = () => {
    let resultados = prestamos;
    if (filtroActivos) {
      resultados = resultados.filter(prestamo => prestamo.activo);
    }
    setPrestamosFiltrados(resultados);
  };

  const handleNuevoPrestamo = () => {
    setShowForm(true);
  };

  const handleDevolverPrestamo = (prestamo) => {
    setPrestamoADevolver(prestamo);
    setShowDevolucionForm(true);
  };

  const crearPrestamo = async (prestamoData) => {
    try {
      setActionLoading(true);
      setError('');
      await prestamoService.crear(prestamoData);
      await cargarPrestamos();
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear el préstamo');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarDevolucion = async (devolucionData) => {
    try {
      setActionLoading(true);
      setError('');
      
      await prestamoService.devolver(prestamoADevolver.idPrestamo, devolucionData);
      await cargarPrestamos();
      setShowDevolucionForm(false);
      setPrestamoADevolver(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar la devolución');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltroActivos(e.target.value === 'activos');
  };

  const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={actionLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando préstamos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showForm && (
        <Modal 
          title="Crear Nuevo Préstamo"
          onClose={() => setShowForm(false)}
        >
          <PrestamoForm
            onSave={crearPrestamo}
            onCancel={() => setShowForm(false)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {showDevolucionForm && (
        <Modal 
          title="Registrar Devolución"
          onClose={() => setShowDevolucionForm(false)}
        >
          <DevolucionForm
            prestamo={prestamoADevolver}
            onSave={confirmarDevolucion}
            onCancel={() => setShowDevolucionForm(false)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {showDevolverConfirm && (
        <Modal 
          title="Confirmar Devolución"
          onClose={() => setShowDevolverConfirm(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">¿Estás seguro de que deseas registrar la devolución del libro?</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">{prestamoADevolver?.libro?.titulo}</p>
              <p className="text-sm text-gray-600">Socio: {prestamoADevolver?.socio?.nombre}</p>
              {prestamoADevolver?.diasRetraso > 0 && (
                <p className="text-sm text-red-600 font-medium">
                  Este préstamo tiene {prestamoADevolver.diasRetraso} días de retraso
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDevolverConfirm(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDevolucion}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Devolución'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Préstamos</h1>
        <button className="btn-primary" onClick={handleNuevoPrestamo}>
          Nuevo Préstamo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
            <select
              className="input-field"
              value={filtroActivos ? 'activos' : 'todos'}
              onChange={handleFiltroChange}
            >
              <option value="activos">Solo préstamos activos</option>
              <option value="todos">Todos los préstamos</option>
            </select>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{prestamosFiltrados.length}</strong> de <strong>{prestamos.length}</strong> préstamos
            </p>
            {!filtroActivos && (
              <button onClick={() => setFiltroActivos(true)} className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors">
                Ver solo activos
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Préstamos</h3>
          <p className="text-3xl font-bold text-indigo-600">{prestamos.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Activos</h3>
          <p className="text-3xl font-bold text-orange-600">{prestamos.filter(p => p.activo).length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Con Retraso</h3>
          <p className="text-3xl font-bold text-red-600">{prestamos.filter(p => p.diasRetraso > 0).length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Filtrados</h3>
          <p className="text-3xl font-bold text-blue-600">{prestamosFiltrados.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Lista de Préstamos {filtroActivos && '(Activos)'}</h2>
        
        {prestamosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {prestamos.length === 0 ? 'No hay préstamos registrados' : 'No se encontraron préstamos con los filtros aplicados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prestamosFiltrados.map((prestamo) => (
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
                        <div>Fin: {prestamo.fechaFin ? new Date(prestamo.fechaFin).toLocaleDateString() : 'Pendiente'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        prestamo.activo 
                          ? prestamo.diasRetraso > 0 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {prestamo.activo 
                          ? (prestamo.diasRetraso > 0 ? `Retraso: ${prestamo.diasRetraso}d` : 'Activo')
                          : 'Devuelto'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {prestamo.activo && (
                        <button 
                          onClick={() => handleDevolverPrestamo(prestamo)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Devolver
                        </button>
                      )}
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

export default Prestamos;