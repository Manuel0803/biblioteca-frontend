import React, { useState, useEffect } from 'react';
import { multaService } from '../services/multaService';
import MultaForm from '../components/MultaForm';

const Multas = () => {
  const [multas, setMultas] = useState([]);
  const [multasFiltradas, setMultasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroActivas, setFiltroActivas] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [showPagarConfirm, setShowPagarConfirm] = useState(false);
  const [multaAPagar, setMultaAPagar] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    cargarMultas();
  }, []);

  useEffect(() => {
    filtrarMultas();
  }, [filtroActivas, multas]);

  const cargarMultas = async () => {
    try {
      setLoading(true);
      const response = await multaService.obtenerTodas();
      setMultas(response.data);
    } catch (error) {
      setError('Error al cargar las multas');
    } finally {
      setLoading(false);
    }
  };

  const filtrarMultas = () => {
    let resultados = multas;
    
    if (filtroActivas) {
      resultados = resultados.filter(multa => multa.activa);
    }
    
    setMultasFiltradas(resultados);
  };

  const handleNuevaMulta = () => {
    setShowForm(true);
  };

  const handlePagarMulta = (multa) => {
    setMultaAPagar(multa);
    setShowPagarConfirm(true);
  };

  const crearMulta = async (multaData) => {
    try {
      setActionLoading(true);
      setError('');
      
      await multaService.crearManual(multaData);
      await cargarMultas();
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear la multa');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarPago = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      await multaService.pagar(multaAPagar.idMulta);
      await cargarMultas();
      setShowPagarConfirm(false);
      setMultaAPagar(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltroActivas(e.target.value === 'activas');
  };

  const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
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
          <div className="text-lg text-gray-600">Cargando multas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showForm && (
        <Modal 
          title="Crear Multa Manual"
          onClose={() => setShowForm(false)}
        >
          <MultaForm
            onSave={crearMulta}
            onCancel={() => setShowForm(false)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {showPagarConfirm && (
        <Modal 
          title="Confirmar Pago de Multa"
          onClose={() => setShowPagarConfirm(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas marcar esta multa como pagada?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">Socio: {multaAPagar?.prestamo?.socioInfo?.nombre}</p>
              <p className="text-sm text-gray-600">
                Monto: <strong>${multaAPagar?.monto}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Motivo: {multaAPagar?.motivo}
              </p>
              {multaAPagar?.descripcion && (
                <p className="text-sm text-gray-600">
                  Descripción: {multaAPagar.descripcion}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPagarConfirm(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPago}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Multas</h1>
        <button 
          className="btn-primary"
          onClick={handleNuevaMulta}
        >
          Crear Multa Manual
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900"
            >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              className="input-field"
              value={filtroActivas ? 'activas' : 'todas'}
              onChange={handleFiltroChange}
            >
              <option value="activas">Solo multas activas</option>
              <option value="todas">Todas las multas</option>
            </select>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{multasFiltradas.length}</strong> de <strong>{multas.length}</strong> multas
            </p>
            {!filtroActivas && (
              <button
                onClick={() => setFiltroActivas(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Ver solo activas
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Multas</h3>
          <p className="text-3xl font-bold text-indigo-600">{multas.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Activas</h3>
          <p className="text-3xl font-bold text-orange-600">
            {multas.filter(m => m.activa).length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Pagadas</h3>
          <p className="text-3xl font-bold text-green-600">
            {multas.filter(m => !m.activa).length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Pendiente</h3>
          <p className="text-3xl font-bold text-red-600">
            ${multas.filter(m => m.activa).reduce((sum, m) => sum + parseFloat(m.monto), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Lista de Multas {filtroActivas && '(Activas)'}
        </h2>
        
        {multasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {multas.length === 0 
              ? 'No hay multas registradas en el sistema' 
              : 'No se encontraron multas con los filtros aplicados'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {multasFiltradas.map((multa) => (
                  <tr key={multa.idMulta} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {multa.prestamo?.socioInfo?.nombre || multa.socioInfo?.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        N° {multa.prestamo?.socioInfo?.nroSocio || multa.socioInfo?.nroSocio}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(multa.monto).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {multa.motivo}
                      </div>
                      {multa.descripcion && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {multa.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(multa.fechaCreacion).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        multa.activa 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {multa.activa ? 'Pendiente' : 'Pagada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {multa.activa && (
                        <button 
                          onClick={() => handlePagarMulta(multa)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Marcar como Pagada
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

export default Multas;