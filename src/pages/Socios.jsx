import React, { useState, useEffect } from 'react';
import { socioService } from '../services/socioService';
import SocioForm from '../components/SocioForm';

const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [sociosFiltrados, setSociosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [socioEditando, setSocioEditando] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [socioAEliminar, setSocioAEliminar] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    cargarSocios();
  }, []);

  useEffect(() => {
    filtrarSocios();
  }, [busqueda, socios]);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const response = await socioService.obtenerTodos();
      setSocios(response.data);
    } catch (error) {
      setError('Error al cargar los socios');
    } finally {
      setLoading(false);
    }
  };

  const filtrarSocios = () => {
    let resultados = socios;
    
    if (busqueda) {
      resultados = resultados.filter(socio =>
        socio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        socio.dni.includes(busqueda) ||
        socio.nroSocio.toString().includes(busqueda)
      );
    }
    
    setSociosFiltrados(resultados);
  };

  const handleCrearSocio = () => {
    setSocioEditando(null);
    setShowForm(true);
  };

  const handleEditarSocio = (socio) => {
    setSocioEditando(socio);
    setShowForm(true);
  };

  const handleEliminarSocio = (socio) => {
    setSocioAEliminar(socio);
    setShowDeleteConfirm(true);
  };

  const guardarSocio = async (socioData) => {
    try {
      setActionLoading(true);
      setError('');
      
      if (socioEditando) {
        await socioService.actualizar(socioEditando.idSocio, {
          ...socioData,
          nroSocio: socioEditando.nroSocio
        });
      } else {
        const ultimoNumero = await socioService.obtenerUltimoNumero();
        const nuevoNroSocio = ultimoNumero + 1;
        
        await socioService.crear({
          ...socioData,
          nroSocio: nuevoNroSocio
        });
      }
      
      await cargarSocios();
      setShowForm(false);
      setSocioEditando(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el socio');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      const tienePrestamos = await socioService.tienePrestamosActivos(socioAEliminar.idSocio);
      if (tienePrestamos.data) {
        setError('No se puede eliminar un socio con préstamos activos');
        setShowDeleteConfirm(false);
        return;
      }

      await socioService.eliminar(socioAEliminar.idSocio);
      await cargarSocios();
      setShowDeleteConfirm(false);
      setSocioAEliminar(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar el socio');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
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
          <div className="text-lg text-gray-600">Cargando socios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showForm && (
        <Modal 
          title={socioEditando ? 'Editar Socio' : 'Crear Nuevo Socio'}
          onClose={() => setShowForm(false)}
        >
          <SocioForm
            socio={socioEditando}
            onSave={guardarSocio}
            onCancel={() => setShowForm(false)}
            loading={actionLoading}
          />
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal 
          title="Confirmar Eliminación"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar al socio 
              <strong> "{socioAEliminar?.nombre}"</strong>?
            </p>
            <p className="text-sm text-gray-600">
              N° Socio: {socioAEliminar?.nroSocio} | DNI: {socioAEliminar?.dni}
            </p>
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Socios</h1>
        <button 
          className="btn-primary"
          onClick={handleCrearSocio}
        >
          Nuevo Socio
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
              Buscar por nombre, DNI o número
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez, 12345678, 1001..."
              className="input-field"
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{sociosFiltrados.length}</strong> de <strong>{socios.length}</strong> socios
            </p>
            {busqueda && (
              <button
                onClick={limpiarFiltros}
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Socios</h3>
          <p className="text-3xl font-bold text-indigo-600">{socios.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Con Préstamos Activos</h3>
          <p className="text-3xl font-bold text-orange-600">
            {socios.filter(socio => socio.prestamosActivos > 0).length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Filtrados</h3>
          <p className="text-3xl font-bold text-blue-600">{sociosFiltrados.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Lista de Socios {sociosFiltrados.length !== socios.length && `(Filtrados)`}
        </h2>
        
        {sociosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {socios.length === 0 
              ? 'No hay socios registrados en el sistema' 
              : 'No se encontraron socios con la búsqueda aplicada'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Socio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Préstamos Activos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sociosFiltrados.map((socio) => (
                  <tr key={socio.idSocio} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{socio.nroSocio}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{socio.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{socio.dni}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        socio.prestamosActivos > 0 
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {socio.prestamosActivos} activos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditarSocio(socio)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminarSocio(socio)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        disabled={socio.prestamosActivos > 0}
                        title={socio.prestamosActivos > 0 ? 'No se puede eliminar con préstamos activos' : ''}
                      >
                        Eliminar
                      </button>
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

export default Socios;