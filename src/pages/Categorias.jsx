import React, { useState, useEffect } from 'react';
import { categoriaService } from '../services/categoriaService';
import CategoriaForm from '../components/CategoriaForm';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    filtrarCategorias();
  }, [busqueda, categorias]);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriaService.obtenerTodas();
      setCategorias(response.data);
    } catch (error) {
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const filtrarCategorias = () => {
    let resultados = categorias;
    
    if (busqueda) {
      resultados = resultados.filter(categoria =>
        categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        categoria.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    setCategoriasFiltradas(resultados);
  };

  const handleCrearCategoria = () => {
    setCategoriaEditando(null);
    setShowForm(true);
  };

  const handleEditarCategoria = (categoria) => {
    setCategoriaEditando(categoria);
    setShowForm(true);
  };

  const handleEliminarCategoria = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowDeleteConfirm(true);
  };

  const guardarCategoria = async (categoriaData) => {
    try {
      setActionLoading(true);
      setError('');
      
      if (categoriaEditando) {
        await categoriaService.actualizar(categoriaEditando.idCategoria, categoriaData);
      } else {
        await categoriaService.crear(categoriaData);
      }
      
      await cargarCategorias();
      setShowForm(false);
      setCategoriaEditando(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      await categoriaService.eliminar(categoriaAEliminar.idCategoria);
      await cargarCategorias();
      setShowDeleteConfirm(false);
      setCategoriaAEliminar(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar la categoría');
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
          <div className="text-lg text-gray-600">Cargando categorías...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showForm && (
        <Modal 
          title={categoriaEditando ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          onClose={() => setShowForm(false)}
        >
          <CategoriaForm
            categoria={categoriaEditando}
            onSave={guardarCategoria}
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
              ¿Estás seguro de que deseas eliminar la categoría 
              <strong> "{categoriaAEliminar?.nombre}"</strong>?
            </p>
            <p className="text-sm text-gray-600">
              {categoriaAEliminar?.descripcion}
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button 
          className="btn-primary"
          onClick={handleCrearCategoria}
        >
          Nueva Categoría
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
              Buscar por nombre o descripción
            </label>
            <input
              type="text"
              placeholder="Ej: Ciencia Ficción, Literatura..."
              className="input-field"
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{categoriasFiltradas.length}</strong> de <strong>{categorias.length}</strong> categorías
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
          <h3 className="text-lg font-semibold text-gray-700">Total Categorías</h3>
          <p className="text-3xl font-bold text-indigo-600">{categorias.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Con Descripción</h3>
          <p className="text-3xl font-bold text-green-600">
            {categorias.filter(c => c.descripcion).length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Filtradas</h3>
          <p className="text-3xl font-bold text-blue-600">{categoriasFiltradas.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Lista de Categorías {categoriasFiltradas.length !== categorias.length && `(Filtradas)`}
        </h2>
        
        {categoriasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {categorias.length === 0 
              ? 'No hay categorías registradas en el sistema' 
              : 'No se encontraron categorías con la búsqueda aplicada'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoriasFiltradas.map((categoria) => (
                  <tr key={categoria.idCategoria} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{categoria.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md">
                        {categoria.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditarCategoria(categoria)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminarCategoria(categoria)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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

export default Categorias;