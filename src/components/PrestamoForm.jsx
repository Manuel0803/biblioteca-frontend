import React, { useState, useEffect } from 'react';
import { libroService } from '../services/libroService';
import { socioService } from '../services/socioService';

const PrestamoForm = ({ onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    idLibro: '',
    idSocio: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: ''
  });
  const [libros, setLibros] = useState([]);
  const [socios, setSocios] = useState([]);
  const [librosDisponibles, setLibrosDisponibles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [librosRes, sociosRes] = await Promise.all([
        libroService.obtenerDisponibles(),
        socioService.obtenerTodos()
      ]);
      
      setLibros(librosRes.data);
      setLibrosDisponibles(librosRes.data);
      setSocios(sociosRes.data);
    } catch (error) {
      setError('Error al cargar los datos');
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
    
    if (!formData.idLibro || !formData.idSocio || !formData.fechaFin) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const dataToSend = {
      ...formData,
      fechaInicio: formData.fechaInicio || new Date().toISOString().split('T')[0]
    };

    onSave(dataToSend);
  };

  const calcularFechaFin = (dias) => {
    if (dias) {
      const fecha = new Date(formData.fechaInicio);
      fecha.setDate(fecha.getDate() + parseInt(dias));
      setFormData({
        ...formData,
        fechaFin: fecha.toISOString().split('T')[0]
      });
    }
  };

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

      <div>
        <label htmlFor="idLibro" className="block text-sm font-medium text-gray-700 mb-2">
          Libro
        </label>
        <select
          id="idLibro"
          name="idLibro"
          required
          className="input-field"
          value={formData.idLibro}
          onChange={handleChange}
        >
          <option value="">Seleccionar libro</option>
          {librosDisponibles.map((libro) => (
            <option key={libro.idLibro} value={libro.idLibro}>
              {libro.titulo} - {libro.autor} ({libro.isbn})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {librosDisponibles.length} libros disponibles
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="fechaInicio"
            name="fechaInicio"
            className="input-field"
            value={formData.fechaInicio}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Devolución
          </label>
          <input
            type="date"
            id="fechaFin"
            name="fechaFin"
            required
            className="input-field"
            value={formData.fechaFin}
            onChange={handleChange}
            min={formData.fechaInicio}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asignar días de préstamo
        </label>
        <div className="flex space-x-2">
          {[7, 15, 30].map((dias) => (
            <button
              key={dias}
              type="button"
              onClick={() => calcularFechaFin(dias)}
              className="btn-secondary text-sm"
            >
              {dias} días
            </button>
          ))}
        </div>
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
          {loading ? 'Creando...' : 'Crear Préstamo'}
        </button>
      </div>
    </form>
  );
};

export default PrestamoForm;