import { Link, useLocation } from 'react-router-dom';
import senaLogo from './img/Captura de pantalla 2025-11-06 144718.png';
import { useAuth } from '../contexts/AuthContext';
import {
  FaLaptop,
  FaChartBar,
  FaAddressBook,
  FaChevronRight,
  FaSignInAlt,
  FaGrinBeam
} from 'react-icons/fa';

export default function Sidebar() {
  const { tienePermiso, loading, permisos } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <div className="p-3 muted-text">Cargando...</div>
    );
  }

  return (
    <nav className="d-flex flex-column h-100">
      {/* Header marca */}
      <div className="sidebar-header">
        <img
          src={senaLogo}
          alt="Logo Regisena"
          style={{ width: '48px', height: '34px', borderRadius: 8 }}
          className="hover-lift"
        />
        <div className="brand">REGISENA</div>
      </div>

      {/* Mi Perfil */}
      {tienePermiso('Modulo Configuracion') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/my-profile') ? 'active' : ''}`}
            to={'/my-profile'}
          >
            <FaGrinBeam />
            <span>Mi Perfil</span>
          </Link>
        </div>
      )}

      {/* Dashboard */}
      {tienePermiso('Modulo Dashboard') && (
        <div className="section-title">DASHBOARD</div>
      )}
      {tienePermiso('Modulo Dashboard') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/dashboard-page') ? 'active' : ''}`}
            to={'/dashboard-page'}
          >
            <FaChartBar />
            <span>Gráficos</span>
          </Link>
        </div>
      )}

      {/* Personas */}
      {tienePermiso('Modulo Personas') && (
        <div className="section-title">PERSONAS</div>
      )}
      {tienePermiso('Modulo Personas') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/crud-page-personas') ? 'active' : ''}`}
            to={'/crud-page-personas'}
          >
            <FaAddressBook />
            <span>Información</span>
          </Link>
          <Link
            className={`nav-link-modern ${isActive('/crud-page-tipo-persona') ? 'active' : ''}`}
            to={'/crud-page-tipo-persona'}
          >
            <FaAddressBook />
            <span>Tipo Persona</span>
          </Link>
          <Link
            className={`nav-link-modern ${isActive('/crud-page-tipo-equipo') ? 'active' : ''}`}
            to={'/crud-page-tipo-equipo'}
          >
            <FaLaptop />
            <span>Tipo Equipo</span>
          </Link>
        </div>
      )}

      {/* Usuarios */}
      {tienePermiso('Modulo Usuarios') && (
        <div className="section-title">USUARIOS</div>
      )}
      {tienePermiso('Modulo Usuarios') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/crud-page-user') ? 'active' : ''}`}
            to={'/crud-page-user'}
          >
            <FaAddressBook />
            <span>Información</span>
          </Link>
        </div>
      )}

      {/* Configuración */}
      {tienePermiso('Modulo Configuracion') && (
        <div className="section-title">CONFIGURACIÓN</div>
      )}
      {tienePermiso('Modulo Configuracion') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/crud-page-roles') ? 'active' : ''}`}
            to={'/crud-page-roles'}
          >
            <FaAddressBook />
            <span>Roles</span>
          </Link>
        </div>
      )}

      {/* Movimientos */}
      {tienePermiso('Modulo Movimiento') && (
        <div className="section-title">MOVIMIENTOS</div>
      )}
      {tienePermiso('Modulo Movimiento') && (
        <div className="px-3">
          <Link
            className={`nav-link-modern ${isActive('/crud-page-ingresos') ? 'active' : ''}`}
            to={'/crud-page-ingresos'}
          >
            <FaChevronRight />
            <span>Ingreso / Salida</span>
          </Link>
        </div>
      )}

      {/* Footer cerrar sesión */}
      <div className="mt-auto px-3 pb-3">
        <Link className={`nav-link-modern ${isActive('/') ? 'active' : ''}`} to={'/'}>
          <FaSignInAlt />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </nav>
  );
}
