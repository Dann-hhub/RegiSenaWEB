// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { puedeAccederRuta, loading, usuario } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-5">Cargando permisos...</div>;
  }

  // Si no hay usuario, redirigir al login
  if (!usuario) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Verificar si puede acceder a la ruta actual
  if (!puedeAccederRuta(location.pathname)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección.</p>
          <a href="/my-profile" className="btn btn-primary">
            Volver al Perfil
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;