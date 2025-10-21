import React, { useState, useEffect } from 'react';
import { libroService } from '../services/libroService';
import { categoriaService } from '../services/categoriaService';
import LibroForm from '../components/LibroForm';

const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [librosFiltrados, setLibrosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  
  const [showForm, setShowForm] = useState(false);
  const [libroEditando, setLibroEditando] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarLibros();
  }, [busqueda, filtroEstado, libros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [librosResponse, categoriasResponse] = await Promise.all([
        libroService.obtenerTodos(),
        categoriaService.obtenerTodas()
      ]);
      setLibros(librosResponse.data);
      setCategorias(categoriasResponse.data);
    } catch (error) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarLibros = () => {
    let resultados = libros;

    if (busqueda) {
      resultados = resultados.filter(libro =>
        libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        libro.autor.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroEstado !== 'TODOS') {
      resultados = resultados.filter(libro => libro.estado === filtroEstado);
    }

    setLibrosFiltrados(resultados);
  };

  const handleCrearLibro = () => {
    setLibroEditando(null);
    setShowForm(true);
  };

  const handleEditarLibro = (libro) => {
    setLibroEditando(libro);
    setShowForm(true);
  };

  const handleEliminarLibro = (libro) => {
    setLibroAEliminar(libro);
    setShowDeleteConfirm(true);
  };

  const guardarLibro = async (libroData) => {
    try {
      setActionLoading(true);
      
      if (libroEditando) {
        await libroService.actualizar(libroEditando.idLibro, libroData);
      } else {
        await libroService.crear(libroData);
      }
      
      await cargarDatos();
      setShowForm(false);
      setLibroEditando(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar el libro');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarEliminar = async () => {
    try {
      setActionLoading(true);
      await libroService.eliminar(libroAEliminar.idLibro);
      await cargarDatos();
      setShowDeleteConfirm(false);
      setLibroAEliminar(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar el libro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  const handleFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('TODOS');
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
          <div className="text-lg text-gray-600">Cargando libros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {showForm && (
        <Modal 
          title={libroEditando ? 'Editar Libro' : 'Crear Nuevo Libro'}
          onClose={() => setShowForm(false)}
        >
          <LibroForm
            libro={libroEditando}
            onSave={guardarLibro}
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
              ¿Estás seguro de que deseas eliminar el libro 
              <strong> "{libroAEliminar?.titulo}"</strong>?
            </p>
            <p className="text-sm text-gray-600">
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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Libros</h1>
        <button 
          className="btn-primary"
          onClick={handleCrearLibro}
        >
          Nuevo Libro
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por título o autor
            </label>
            <input
              type="text"
              placeholder="Ej: Cien años, García Márquez..."
              className="input-field"
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              className="input-field"
              value={filtroEstado}
              onChange={handleFiltroEstado}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="PRESTADO">Prestado</option>
              <option value="MANTENIMIENTO">En mantenimiento</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Mostrando <strong>{librosFiltrados.length}</strong> de <strong>{libros.length}</strong> libros
              </p>
              {(busqueda || filtroEstado !== 'TODOS') && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-indigo-600 hover:text-indigo-500 mt-1 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Libros</h3>
          <p className="text-3xl font-bold text-indigo-600">{libros.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Disponibles</h3>
          <p className="text-3xl font-bold text-green-600">
            {libros.filter(libro => libro.estado === 'DISPONIBLE').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Prestados</h3>
          <p className="text-3xl font-bold text-orange-600">
            {libros.filter(libro => libro.estado === 'PRESTADO').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Filtrados</h3>
          <p className="text-3xl font-bold text-blue-600">{librosFiltrados.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Lista de Libros {librosFiltrados.length !== libros.length && `(Filtrados)`}
        </h2>
        
        {librosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {libros.length === 0 
              ? 'No hay libros registrados en el sistema' 
              : 'No se encontraron libros con los filtros aplicados'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
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
                {librosFiltrados.map((libro) => (
                  <tr key={libro.idLibro} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{libro.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{libro.autor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{libro.isbn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {libro.categoria?.nombre || 'Sin categoría'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        libro.estado === 'DISPONIBLE' 
                          ? 'bg-green-100 text-green-800'
                          : libro.estado === 'PRESTADO'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {libro.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditarLibro(libro)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminarLibro(libro)}
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

export default Libros;