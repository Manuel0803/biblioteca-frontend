import React, { useState, useEffect } from 'react';
import { socioService } from '../services/socioService';
import { prestamoService } from '../services/prestamoService';

const MultaForm = ({ onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    idSocio: '',
    idPrestamo: '',
    monto: '',
    motivo: '',
    descripcion: ''
  });
  const [socios, setSocios] = useState([]);
  const [prestamosConRetraso, setPrestamosConRetraso] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (formData.idSocio) {
      cargarPrestamosSocio(formData.idSocio);
    } else {
      setPrestamosConRetraso([]);
      setFormData(prev => ({ ...prev, idPrestamo: '', monto: '' }));
    }
  }, [formData.idSocio]);

  const cargarDatos = async () => {
    try {
      const [sociosRes] = await Promise.all([
        socioService.obtenerTodos()
      ]);
      setSocios(sociosRes.data);
    } catch (error) {
      setError('Error al cargar los datos');
    }
  };

  const cargarPrestamosSocio = async (idSocio) => {
    try {
      const response = await prestamoService.obtenerPorSocio(idSocio);
      const prestamosActivos = response.data;

      setPrestamosConRetraso(prestamosActivos);

      if (prestamosActivos.length === 0) {
        setFormData(prev => ({
          ...prev,
          idPrestamo: '',
          monto: ''
        }));
      } else if (prestamosActivos.length > 0 && !formData.idPrestamo) {
        const primerPrestamo = prestamosActivos[0];
        setFormData(prev => ({
          ...prev,
          idPrestamo: primerPrestamo.idPrestamo.toString(),
          monto: '50.00'
        }));
      }
    } catch (error) {
      setPrestamosConRetraso([]);
    }
  };

  const calcularMultaRetraso = (diasRetraso) => {
    return diasRetraso * 10;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'idPrestamo' && value) {
      const prestamoSeleccionado = prestamosConRetraso.find(p => p.idPrestamo === parseInt(value));
      if (prestamoSeleccionado) {
        setFormData(prev => ({
          ...prev,
          monto: calcularMultaRetraso(prestamoSeleccionado.diasRetraso).toString()
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.idSocio || !formData.monto || !formData.motivo) {
      setError('Los campos Socio, Monto y Motivo son obligatorios');
      return;
    }

    if (!formData.idPrestamo) {
      setError('Debe seleccionar un préstamo para asociar la multa');
      return;
    }

    if (parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    const dataToSend = {
      prestamoId: parseInt(formData.idPrestamo),
      monto: parseFloat(formData.monto),
      motivo: formData.motivo,
      descripcion: formData.descripcion || ''
    };

    onSave(dataToSend);
  };

  const motivosPredefinidos = [
    'Retraso en devolución',
    'Daño en el libro',
    'Pérdida del libro',
    'Páginas faltantes',
    'Otro'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="idSocio" className="block text-sm font-medium text-gray-700 mb-2">
          Socio
        </label>
        <select
          id="idSocio"
          name="idSocio"
          required
          className="input-field"
          value={formData.idSocio}
          onChange={handleChange}
        >
          <option value="">Seleccionar socio</option>
          {socios.map((socio) => (
            <option key={socio.idSocio} value={socio.idSocio}>
              {socio.nroSocio} - {socio.nombre} ({socio.dni})
            </option>
          ))}
        </select>
      </div>

      {prestamosConRetraso.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-3">
            Préstamos con retraso encontrados
          </h4>
          <div className="space-y-3">
            {prestamosConRetraso.map((prestamo) => (
              <div key={prestamo.idPrestamo} className="flex items-start">
                <input
                  type="radio"
                  id={`prestamo-${prestamo.idPrestamo}`}
                  name="idPrestamo"
                  value={prestamo.idPrestamo}
                  checked={formData.idPrestamo === prestamo.idPrestamo.toString()}
                  onChange={handleChange}
                  className="mt-1 mr-3"
                />
                <label htmlFor={`prestamo-${prestamo.idPrestamo}`} className="text-sm flex-1">
                  <span className="font-medium text-gray-900">{prestamo.libro?.titulo}</span>
                  <div className="text-red-600 mt-1">
                    {prestamo.diasRetraso} días de retraso - Multa: ${calcularMultaRetraso(prestamo.diasRetraso)}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.idSocio && prestamosConRetraso.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            Este socio no tiene préstamos con retraso. Puede crear una multa manual por otros motivos.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
          Monto ($)
        </label>
        <input
          type="number"
          id="monto"
          name="monto"
          required
          min="0"
          step="0.01"
          className="input-field"
          value={formData.monto}
          onChange={handleChange}
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
          Motivo
        </label>
        <select
          id="motivo"
          name="motivo"
          required
          className="input-field"
          value={formData.motivo}
          onChange={handleChange}
        >
          <option value="">Seleccionar motivo</option>
          {motivosPredefinidos.map((motivo) => (
            <option key={motivo} value={motivo}>
              {motivo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción {formData.motivo === 'Otro' && '(obligatorio)'}
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          className="input-field"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Describa el motivo de la multa"
          required={formData.motivo === 'Otro'}
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
          {loading ? 'Creando...' : 'Crear Multa'}
        </button>
      </div>
    </form>
  );
};

export default MultaForm;