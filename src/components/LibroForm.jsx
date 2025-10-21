import React, { useState, useEffect } from 'react';
import { categoriaService } from '../services/categoriaService';

const LibroForm = ({ libro, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    idCategoria: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (libro) {
      setFormData({
        titulo: libro.titulo || '',
        autor: libro.autor || '',
        isbn: libro.isbn || '',
        idCategoria: libro.categoria?.idCategoria || ''
      });
    }
  }, [libro]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await categoriaService.obtenerTodas();
      setCategorias(response.data);
    } catch (error) {
      setError('Error al cargar las categorías');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.autor || !formData.isbn || !formData.idCategoria) {
      setError('Todos los campos son obligatorios');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
          Título
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          required
          className="input-field"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Título del libro"
        />
      </div>

      <div>
        <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-2">
          Autor
        </label>
        <input
          type="text"
          id="autor"
          name="autor"
          required
          className="input-field"
          value={formData.autor}
          onChange={handleChange}
          placeholder="Autor del libro"
        />
      </div>

      <div>
        <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
          ISBN
        </label>
        <input
          type="text"
          id="isbn"
          name="isbn"
          required
          className="input-field"
          value={formData.isbn}
          onChange={handleChange}
          placeholder="ISBN del libro"
        />
      </div>

      <div>
        <label htmlFor="idCategoria" className="block text-sm font-medium text-gray-700 mb-2">
          Categoría
        </label>
        <select
          id="idCategoria"
          name="idCategoria"
          required
          className="input-field"
          value={formData.idCategoria}
          onChange={handleChange}
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.idCategoria} value={categoria.idCategoria}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Guardando...' : libro ? 'Actualizar' : 'Crear'} Libro
        </button>
      </div>
    </form>
  );
};

export default LibroForm;