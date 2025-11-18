// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [permisosRutas, setPermisosRutas] = useState({});
  const [loading, setLoading] = useState(true);

  // Mapeo de permisos a rutas - DEFINIDO LOCALMENTE
  const permisosRutasDefault = {
    'Modulo Personas': ['/crud-page-personas', '/crud-page-tipo-persona', '/crud-page-tipo-equipo'],
    'Modulo Usuarios': ['/crud-page-user'],
    'Modulo Configuracion': ['/crud-page-roles', '/my-profile'],
    'Modulo Dashboard': ['/dashboard-page'],
    'Modulo Movimiento': ['/crud-page-ingresos']
  };

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const cargarUsuarioDesdeStorage = async () => {
      try {
        const usuarioStorage = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (usuarioStorage && token === 'authenticated') {
          const usuarioData = JSON.parse(usuarioStorage);
          setUsuario(usuarioData);
          await cargarPermisos(usuarioData.documento);
          
          // Usar el mapeo local por defecto inmediatamente
          setPermisosRutas(permisosRutasDefault);
          console.log('✅ Usuario y permisos cargados:', usuarioData);
        } else {
          console.log('⚠️ No hay usuario en sesión');
        }
      } catch (error) {
        console.error('❌ Error cargando usuario desde storage:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarioDesdeStorage();
  }, []);

  // Función para obtener información completa del usuario desde la API
  const obtenerUsuarioCompleto = async (documento) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/usuario/${documento}`);
      if (response.ok) {
        const result = await response.json();
        return result.usuario || null;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario completo:', error);
      return null;
    }
  };

  const cargarPermisos = async (documento) => {
    try {
      console.log('🔍 Cargando permisos para documento:', documento);
      
      const response = await fetch(`http://127.0.0.1:5000/usuario-permisos/${documento}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Permisos obtenidos desde API:', result.permisos);
        setPermisos(result.permisos || []);
      } else {
        console.warn('⚠️ No se pudo obtener permisos desde API, usando por defecto');
        await cargarPermisosPorDefecto(documento);
      }
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      await cargarPermisosPorDefecto(documento);
    }
  };

  // Función alternativa para cargar permisos si el endpoint principal falla
  const cargarPermisosPorDefecto = async (documento) => {
    try {
      const usuarioCompleto = await obtenerUsuarioCompleto(documento);
      
      if (usuarioCompleto && usuarioCompleto.rol) {
        const permisosPorRol = {
          1: ['Modulo Dashboard', 'Modulo Personas', 'Modulo Usuarios', 'Modulo Configuracion', 'Modulo Movimiento'], // Admin
          2: ['Modulo Dashboard', 'Modulo Personas', 'Modulo Movimiento'], // Empresario
          3: ['Modulo Dashboard'], // Usuario básico
        };
        
        const permisosDefault = permisosPorRol[usuarioCompleto.rol] || ['Modulo Dashboard'];
        setPermisos(permisosDefault);
        console.log('✅ Permisos por defecto cargados:', permisosDefault);
      } else {
        setPermisos(['Modulo Dashboard']);
      }
    } catch (error) {
      console.error('Error cargando permisos por defecto:', error);
      setPermisos(['Modulo Dashboard']);
    }
  };

  const tienePermiso = (nombrePermiso) => {
    if (!permisos || !permisos.length) {
      console.log('📋 No hay permisos disponibles');
      return false;
    }
    
    const tieneElPermiso = permisos.includes(nombrePermiso);
    console.log(`🔐 Verificando permiso "${nombrePermiso}":`, tieneElPermiso);
    console.log('📋 Permisos actuales:', permisos);
    
    return tieneElPermiso;
  };

  const puedeAccederRuta = (ruta) => {
    console.log(`🛣️ Verificando acceso a ruta: ${ruta}`);
    
    // Permitir acceso a rutas públicas
    const rutasPublicas = ['/', '/forgot-password'];
    if (rutasPublicas.includes(ruta)) {
      console.log('✅ Ruta pública, acceso permitido');
      return true;
    }
    
    // Si no hay usuario, no puede acceder a rutas protegidas
    if (!usuario) {
      console.log('❌ No hay usuario, acceso denegado');
      return false;
    }
    
    // Si no hay permisos cargados aún, permitir acceso temporalmente
    if (!permisos.length || !Object.keys(permisosRutas).length) {
      console.log('⚠️ Permisos no cargados, acceso temporal permitido');
      return true;
    }
    
    // Buscar qué permiso da acceso a esta ruta
    for (const [permiso, rutas] of Object.entries(permisosRutas)) {
      if (rutas.includes(ruta)) {
        const tieneAcceso = tienePermiso(permiso);
        console.log(`🔍 Ruta ${ruta} requiere permiso "${permiso}": ${tieneAcceso}`);
        if (tieneAcceso) {
          console.log('✅ Acceso permitido a ruta:', ruta);
          return true;
        }
      }
    }
    
    console.log('❌ No se encontró permiso para la ruta:', ruta);
    console.log('📋 Mapeo de permisos-rutas:', permisosRutas);
    return false;
  };

  // Función de login
  const login = async (usuarioData) => {
    try {
      setLoading(true);
      
      const usuarioCompleto = await obtenerUsuarioCompleto(usuarioData.documento);
      
      const usuarioParaGuardar = {
        ...usuarioData,
        ...usuarioCompleto
      };
      
      setUsuario(usuarioParaGuardar);
      localStorage.setItem('user', JSON.stringify(usuarioParaGuardar));
      localStorage.setItem('token', 'authenticated');
      
      await cargarPermisos(usuarioData.documento);
      setPermisosRutas(permisosRutasDefault);
      
      console.log('✅ Login exitoso:', usuarioParaGuardar);
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    setPermisos([]);
    setPermisosRutas({});
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ Logout exitoso');
  };

  const estaAutenticado = () => {
    return usuario !== null && localStorage.getItem('token') === 'authenticated';
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      permisos,
      permisosRutas,
      loading,
      tienePermiso,
      puedeAccederRuta,
      login,
      logout,
      estaAutenticado
    }}>
      {children}
    </AuthContext.Provider>
  );
};