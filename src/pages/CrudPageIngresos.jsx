import { useState, useEffect } from 'react';
import CrudTable from '../components/movimientos/Table';
import CrudModal from '../components/movimientos/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/AuthContext';

export default function CrudPage() {
  const API_URL = 'http://127.0.0.1:5000';
  
  // Obtener el usuario del contexto de autenticación - CORREGIDO
  const { usuario } = useAuth();
  
  // Estados principales
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalState, setModalState] = useState({
    show: false,
    mode: 'create',
    currentItem: null,
    fromQR: false
  });

  // Cargar movimientos desde la API
  const cargarMovimientos = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando movimientos desde:', `${API_URL}/movimiento`);
      const response = await fetch(`${API_URL}/movimiento`);
      console.log('📊 Respuesta status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 Datos recibidos:', result);
        
        // Manejar diferentes formatos de respuesta
        let movimientos = [];
        
        if (Array.isArray(result)) {
          movimientos = result;
        } else if (result && Array.isArray(result.movimientos)) {
          movimientos = result.movimientos;
        } else if (result && typeof result === 'object') {
          movimientos = [result];
        }
        
        console.log('✅ Movimientos procesados:', movimientos.length);
        console.log('📋 Estructura del primer movimiento:', movimientos[0]);
        setData(movimientos);
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error cargando movimientos:', response.status, errorText);
        setError(`Error ${response.status}: No se pudieron cargar los movimientos`);
        setData([]);
      }
    } catch (error) {
      console.error('💥 Error cargando movimientos:', error);
      setError('Error de conexión al cargar movimientos');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar movimientos al iniciar
  useEffect(() => {
    cargarMovimientos();
  }, []);

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setModalState({
      show: false,
      mode: 'create',
      currentItem: null,
      fromQR: false
    });
    // No limpiar mensajes globales al cerrar modal; se limpian manualmente
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    setError(null);
    
    console.log('📝 Datos del formulario:', formData);
    console.log('🎯 Modo:', modalState.mode);
    console.log('🔍 Origen QR:', modalState.fromQR);
    console.log('👤 Usuario logueado:', usuario);

    try {
      let response;
      let url;
      let method;
      let requestBody;
      
      if (modalState.mode === 'create') {
        // Crear nuevo movimiento - CORREGIDO
        url = `${API_URL}/movimiento`;
        method = 'POST';
        requestBody = {
          documentoPersona: formData.documento,
          serialEquipo: formData.serial,
          centroFormacion: formData.centroformacion,
          documentoVigilante: usuario?.documento || formData.vigilante, // CORREGIDO
          observaciones: formData.observaciones,
          tipoIngreso: formData.ingreso,
          fechaIngreso: `${formData.dia_ingreso} ${formData.hora_ingreso}`,
          tipoSalida: formData.salida || '',
          fechaSalida: formData.dia_salida && formData.hora_salida ? 
            `${formData.dia_salida} ${formData.hora_salida}` : null
        };
        console.log('🚀 Creando movimiento:', requestBody);
        
      } else if (modalState.mode === 'registerExit') {
        // Registrar solo los datos de salida
        url = `${API_URL}/movimiento/${modalState.currentItem.id}`;
        method = 'PUT';
        requestBody = {
          // Enviar ambos formatos para máxima compatibilidad
          tipoSalida: formData.salida,
          tipo_salida: formData.salida,
          fechaSalida: `${formData.dia_salida} ${formData.hora_salida}`,
          fecha_salida: `${formData.dia_salida} ${formData.hora_salida}`
        };
        console.log('🚪 Registrando salida:', requestBody);
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Respuesta del servidor:', response?.status);

      if (response && response.ok) {
        console.log('✅ Operación exitosa');
        await cargarMovimientos();
        handleCloseModal();
        if (modalState.mode === 'create') {
          setSuccess('Ingreso registrado exitosamente');
        } else if (modalState.mode === 'registerExit') {
          setSuccess('Salida registrada exitosamente');
        }
      } else {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        console.error('❌ Error en la respuesta:', errorData);
        setError(`Error: ${errorData.mensaje || 'Error al guardar movimiento'}`);
        setSuccess(null);
      }
    } catch (error) {
      console.error('💥 Error guardando movimiento:', error);
      setError('Error de conexión al guardar el movimiento');
      setSuccess(null);
    }
  };

  // Manejar eliminación
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro que deseas anular este movimiento?')) {
      setError(null);
      try {
        console.log('🗑️ Eliminando movimiento:', id);
        const response = await fetch(`${API_URL}/movimiento/${id}`, {
          method: 'DELETE'
        });

        console.log('📊 Respuesta eliminación:', response.status);

        if (response.ok) {
          console.log('✅ Movimiento eliminado');
          await cargarMovimientos();
        } else {
          const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
          console.error('❌ Error eliminando:', errorData);
          setError(`Error: ${errorData.mensaje || 'Error al eliminar movimiento'}`);
        }
      } catch (error) {
        console.error('💥 Error eliminando movimiento:', error);
        setError('Error de conexión al eliminar el movimiento');
      }
    }
  };

  // Manejar creación de nuevo registro - CORREGIDO
  const handleCreate = (qrData = null) => {
    // Si viene de QR, usar esos datos, sino crear datos iniciales con el usuario logueado
    const initialData = qrData || {
      vigilante: usuario?.documento || ''
    };

    setModalState({
      show: true,
      mode: 'create',
      currentItem: initialData,
      fromQR: !!qrData
    });
  };

  // Manejar registro de salida
  const handleRegisterExit = (item) => {
    setModalState({
      show: true,
      mode: 'registerExit',
      currentItem: item,
      fromQR: false
    });
  };

  // Manejar registro de salida por QR (delegado desde la tabla)
  const handleRegisterExitByQR = async ({ documento, serial, nombre }) => {
    // Buscar movimiento objetivo: priorizar Documento+Serial, luego solo Serial; tomar el ingreso pendiente más reciente
    const normalize = (v) => (v || '').toString().trim().toLowerCase();
    const safeData = Array.isArray(data) ? data : [];
    const hasExitData = (item) => {
      const fecha = item?.fechaSalida || item?.fecha_salida;
      const tipo = item?.tipoSalida || item?.tipo_salida;
      return !!(fecha && tipo);
    };
    const candidatosDocSerial = safeData.filter(item => {
      const itemSerial = normalize(item.serialEquipo || item.serial || item.serial_equipo);
      const itemDoc = normalize(item.documentoPersona || item.documento || item.documento_persona);
      return itemSerial === normalize(serial) && itemDoc === normalize(documento) && !hasExitData(item);
    });
    const candidatosSerial = safeData.filter(item => {
      const itemSerial = normalize(item.serialEquipo || item.serial || item.serial_equipo);
      return itemSerial === normalize(serial) && !hasExitData(item);
    });
    const pool = candidatosDocSerial.length > 0 ? candidatosDocSerial : candidatosSerial;
    if (pool.length === 0) {
      throw new Error('No se encontró un ingreso pendiente para ese serial/documento. Cree el ingreso primero o verifique que no tenga salida registrada.');
    }
    const toDate = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };
    const ordenados = pool.slice().sort((a, b) => {
      const da = toDate(a.fechaIngreso || a.fecha_ingreso);
      const db = toDate(b.fechaIngreso || b.fecha_ingreso);
      if (da && db) return db - da;
      if (da && !db) return -1;
      if (!da && db) return 1;
      const ida = a.id || a.id_movimiento || a.movimiento_id || a.idMovimiento || a.idmovimiento || a.movimientoId || 0;
      const idb = b.id || b.id_movimiento || b.movimiento_id || b.idMovimiento || b.idmovimiento || b.movimientoId || 0;
      return idb - ida;
    });
    const movimientoObjetivo = ordenados[0];
    const movementId = movimientoObjetivo.id || movimientoObjetivo.id_movimiento || movimientoObjetivo.movimiento_id || movimientoObjetivo.idMovimiento || movimientoObjetivo.idmovimiento || movimientoObjetivo.movimientoId;
    if (!movementId) {
      throw new Error('ID de movimiento no encontrado para la salida');
    }

    // Formatear fecha actual a YYYY-MM-DD HH:mm:ss (con segundos para trazabilidad)
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const fechaStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const url = `${API_URL}/movimiento/${movementId}`;
    const headers = { 'Content-Type': 'application/json' };

    // Enviar ambos formatos en un solo payload para máxima compatibilidad con el backend
    let response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        // Unificar valor de tipo de salida con el usado en el flujo QR
        tipoSalida: 'Permanente',
        fechaSalida: fechaStr,
        tipo_salida: 'Permanente',
        fecha_salida: fechaStr,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
      throw new Error(errorData.mensaje || 'No se pudo registrar la salida');
    }

    await cargarMovimientos();
    return true;
  };

  return (
    <Layout>
      <AnimatedPage>
      <div className="crud-container">
        {/* Mostrar errores */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error:</strong> {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}
        {/* Mostrar éxito */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Éxito:</strong> {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess(null)}
            ></button>
          </div>
        )}
        
        {loading && (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando movimientos...</p>
          </div>
        )}
        
        <CrudTable
          data={data}
          onRegisterExit={handleRegisterExit}
          onRegisterExitByQR={handleRegisterExitByQR}
          onDelete={handleDelete}
          onCreate={handleCreate}
          loading={loading}
          onRefresh={cargarMovimientos} 
        />
        
        <CrudModal
          show={modalState.show}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={modalState.currentItem}
          isEdit={modalState.mode === 'edit'}
          isEditingExit={modalState.mode === 'registerExit'}
          fromQR={modalState.fromQR}
        />
      </div>
      </AnimatedPage>
    </Layout>
  );
}
