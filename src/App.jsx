import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Register from './pages/Register';
import Libros from './pages/Libros';
import Categorias from './pages/Categorias';
import Socios from './pages/Socios';
import Prestamos from './pages/Prestamos';
import Multas from './pages/Multas';
import HistorialPrestamos from './pages/HistorialPrestamos';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/registro" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Navigate to="/dashboard" />} />
            
            <Route path="libros" element={<Libros />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="socios" element={<Socios />} />
            <Route path="prestamos" element={<Prestamos />} />
            <Route path="historial-prestamos" element={<HistorialPrestamos />} />
            <Route path="multas" element={<Multas />} />
            
            <Route path="usuarios" element={<div className="p-6">Gestión de Usuarios - Próximamente</div>} />
            <Route path="reportes" element={<div className="p-6">Reportes - Próximamente</div>} />
          </Route>

          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
                <p className="text-gray-600">Error 404 - La página que buscas no existe</p>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;