import React, { useState, useEffect } from 'react';

const SocioForm = ({ socio, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (socio) {
      setFormData({
        nombre: socio.nombre || '',
        dni: socio.dni || ''
      });
    }
  }, [socio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dni') {
      const soloNumeros = value.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: soloNumeros
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.dni) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.dni.length < 7 || formData.dni.length > 15) {
      setError('El DNI debe tener entre 7 y 15 dígitos');
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
          Nombre Completo
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          className="input-field"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre completo del socio"
        />
      </div>

      <div>
        <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
          DNI
        </label>
        <input
          type="text"
          id="dni"
          name="dni"
          required
          className="input-field"
          value={formData.dni}
          onChange={handleChange}
          placeholder="12345678 (solo números)"
          maxLength="15"
          pattern="[0-9]*"
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500 mt-2">
          Solo números, sin puntos ni espacios (7-15 dígitos)
        </p>
      </div>

      {socio && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Socio Actual
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 font-medium">{socio.nroSocio}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            El número de socio no se puede modificar
          </p>
        </div>
      )}

      {!socio && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Al crear un nuevo socio, el sistema asignará automáticamente el próximo número disponible.
              </p>
            </div>
          </div>
        </div>
      )}

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
          {loading ? 'Guardando...' : socio ? 'Actualizar' : 'Crear'} Socio
        </button>
      </div>
    </form>
  );
};

export default SocioForm;