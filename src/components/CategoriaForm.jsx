import React, { useState, useEffect } from 'react';

const CategoriaForm = ({ categoria, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || ''
      });
    }
  }, [categoria]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre) {
      setError('El nombre es obligatorio');
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
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Categoría
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          className="input-field"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Ciencia Ficción, Literatura Clásica"
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          className="input-field"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción de la categoría"
        />
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
          {loading ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear'} Categoría
        </button>
      </div>
    </form>
  );
};

export default CategoriaForm;