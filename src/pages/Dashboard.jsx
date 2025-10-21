import React, { useState, useEffect } from 'react';
import { libroService } from '../services/libroService';
import { socioService } from '../services/socioService';
import { prestamoService } from '../services/prestamoService';
import { multaService } from '../services/multaService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalLibros: 0,
    librosDisponibles: 0,
    totalSocios: 0,
    sociosConPrestamos: 0,
    prestamosActivos: 0,
    prestamosConRetraso: 0,
    multasActivas: 0,
    totalMultasPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [prestamosRecientes, setPrestamosRecientes] = useState([]);
  const [multasRecientes, setMultasRecientes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [
        librosRes, 
        sociosRes, 
        prestamosRes, 
        multasRes,
        prestamosActivosRes,
        multasActivasRes
      ] = await Promise.all([
        libroService.obtenerTodos(),
        socioService.obtenerTodos(),
        prestamoService.obtenerTodos(),
        multaService.obtenerTodas(),
        prestamoService.obtenerActivos(),
        multaService.obtenerActivas()
      ]);

      const libros = librosRes.data;
      const socios = sociosRes.data;
      const prestamos = prestamosRes.data;
      const multas = multasRes.data;
      const prestamosActivos = prestamosActivosRes.data;
      const multasActivas = multasActivasRes.data;

      setEstadisticas({
        totalLibros: libros.length,
        librosDisponibles: libros.filter(l => l.estado === 'DISPONIBLE').length,
        totalSocios: socios.length,
        sociosConPrestamos: socios.filter(s => s.prestamosActivos > 0).length,
        prestamosActivos: prestamosActivos.length,
        prestamosConRetraso: prestamos.filter(p => p.diasRetraso > 0).length,
        multasActivas: multasActivas.length,
        totalMultasPendientes: multasActivas.reduce((sum, m) => sum + parseFloat(m.monto), 0)
      });

      setPrestamosRecientes(prestamosActivos.slice(0, 5));
      setMultasRecientes(multasActivas.slice(0, 5));

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/libros" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700">Total Libros</h3>
          <p className="text-3xl font-bold text-indigo-600">{estadisticas.totalLibros}</p>
          <p className="text-sm text-gray-500 mt-1">
            {estadisticas.librosDisponibles} disponibles
          </p>
        </Link>
        
        <Link to="/socios" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700">Socios Registrados</h3>
          <p className="text-3xl font-bold text-green-600">{estadisticas.totalSocios}</p>
          <p className="text-sm text-gray-500 mt-1">
            {estadisticas.sociosConPrestamos} con préstamos
          </p>
        </Link>
        
        <Link to="/prestamos" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700">Préstamos Activos</h3>
          <p className="text-3xl font-bold text-orange-600">{estadisticas.prestamosActivos}</p>
          <p className="text-sm text-gray-500 mt-1">
            {estadisticas.prestamosConRetraso} con retraso
          </p>
        </Link>
        
        <Link to="/multas" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-700">Multas Activas</h3>
          <p className="text-3xl font-bold text-red-600">{estadisticas.multasActivas}</p>
          <p className="text-sm text-gray-500 mt-1">
            Total: ${estadisticas.totalMultasPendientes.toFixed(2)}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Préstamos Recientes</h3>
            <Link to="/prestamos" className="text-indigo-600 hover:text-indigo-500 text-sm transition-colors">
              Ver todos →
            </Link>
          </div>
          
          {prestamosRecientes.length === 0 ? (
            <p className="text-gray-500">No hay préstamos activos</p>
          ) : (
            <div className="space-y-3">
              {prestamosRecientes.map((prestamo) => (
                <div key={prestamo.idPrestamo} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{prestamo.libro?.titulo}</p>
                    <p className="text-xs text-gray-500">{prestamo.socio?.nombre}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prestamo.diasRetraso > 0 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {prestamo.diasRetraso > 0 ? `${prestamo.diasRetraso}d retraso` : 'Al día'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Multas Recientes</h3>
            <Link to="/multas" className="text-indigo-600 hover:text-indigo-500 text-sm transition-colors">
              Ver todas →
            </Link>
          </div>
          
          {multasRecientes.length === 0 ? (
            <p className="text-gray-500">No hay multas activas</p>
          ) : (
            <div className="space-y-3">
              {multasRecientes.map((multa) => (
                <div key={multa.idMulta} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{multa.prestamo?.socioInfo?.nombre}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{multa.motivo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-900">${multa.monto}</p>
                    <span className="text-xs text-red-600">Pendiente</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/libros" 
            className="btn-primary text-center"
          >
            Gestionar Libros
          </Link>
          <Link 
            to="/prestamos" 
            className="btn-primary text-center"
          >
            Gestionar Préstamos
          </Link>
          <Link 
            to="/multas" 
            className="btn-primary text-center"
          >
            Gestionar Multas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;