import React, { useState } from 'react';
import { EstadoDevolucion } from '../utils/enums';

const DevolucionForm = ({ prestamo, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    estadoDevolucion: EstadoDevolucion.BUEN_ESTADO,
    observaciones: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.estadoDevolucion) {
      setError('El estado de devolución es obligatorio');
      return;
    }

    onSave(formData);
  };

  const getEstadoDescription = (estado) => {
    const descriptions = {
      [EstadoDevolucion.BUEN_ESTADO]: {
        text: 'En buen estado',
        multa: 'No aplica multa'
      },
      [EstadoDevolucion.DANIO_LEVE]: {
        text: 'Daño leve (subrayado, rayones)',
        multa: 'Aplica multa por daño leve'
      },
      [EstadoDevolucion.DANIO_GRAVE]: {
        text: 'Daño grave (páginas rotas, portada dañada)',
        multa: 'Aplica multa por daño grave'
      },
      [EstadoDevolucion.PERDIDA]: {
        text: 'Pérdida total',
        multa: 'Aplica multa por pérdida'
      }
    };
    return descriptions[estado];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-2">Información del Préstamo</h4>
        <p className="text-sm text-gray-600"><strong>Libro:</strong> {prestamo.libro?.titulo}</p>
        <p className="text-sm text-gray-600"><strong>Socio:</strong> {prestamo.socio?.nombre}</p>
        <p className="text-sm text-gray-600"><strong>Fecha fin:</strong> {new Date(prestamo.fechaFin).toLocaleDateString()}</p>
        {prestamo.diasRetraso > 0 && (
          <p className="text-sm text-red-600 font-medium mt-2">
            Este préstamo tiene {prestamo.diasRetraso} días de retraso
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Estado del libro al devolver
        </label>
        <div className="space-y-3">
          {Object.values(EstadoDevolucion).map((estado) => {
            const estadoInfo = getEstadoDescription(estado);
            return (
              <div key={estado} className="flex items-start">
                <input
                  type="radio"
                  id={`estado-${estado}`}
                  name="estadoDevolucion"
                  value={estado}
                  checked={formData.estadoDevolucion === estado}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                />
                <label 
                  htmlFor={`estado-${estado}`} 
                  className="ml-3 block text-sm flex-1"
                >
                  <span className={`font-medium ${
                    estado === EstadoDevolucion.BUEN_ESTADO ? 'text-green-700' :
                    estado === EstadoDevolucion.DANIO_LEVE ? 'text-yellow-700' :
                    estado === EstadoDevolucion.DANIO_GRAVE ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {estadoInfo.text}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    {estadoInfo.multa}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={3}
          className="input-field"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Describa el estado del libro, daños encontrados, etc."
        />
        <p className="text-xs text-gray-500 mt-1">
          Campo opcional para registrar observaciones específicas
        </p>
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
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Confirmar Devolución'}
        </button>
      </div>
    </form>
  );
};

export default DevolucionForm;