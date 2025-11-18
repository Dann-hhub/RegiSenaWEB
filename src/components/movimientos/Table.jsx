import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import HeaderBar from '../ui/HeaderBar.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import { FaFilePdf, FaTrash, FaPlus, FaExclamationTriangle, FaSignOutAlt, FaInfoCircle, FaQrcode, FaSearch, FaSignInAlt, FaSignOutAlt as FaExit } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { parseQRText } from './qr';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function CrudTable({ data, onEdit, onDelete, onCreate, onRegisterExit, onRegisterExitByQR, loading, onRefresh }) {
  // Estados para modales y selección
  const [modalState, setModalState] = useState({
    showConfirm: false,
    showDetails: false,
    showQRScanner: false,
    selectedItem: null,
    itemToDelete: null,
    qrData: null,
    qrMode: 'ingreso' // 'ingreso' o 'salida'
  });

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Notificaciones globales
  const { showToast } = useToast();

  // Obtener el usuario del contexto de autenticación
  const { usuario } = useAuth();

  // Asegurarnos de que data siempre sea un array
  const safeData = Array.isArray(data) ? data : [];

  // Referencia para el scanner QR
  const [qrScanner, setQrScanner] = useState(null);

  // (showToast proviene del contexto global)

  // Función para obtener la fecha actual en formato YYYY-MM-DD (hora local)
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper global para extraer solo la parte de fecha en formato YYYY-MM-DD
  const getDatePart = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const match = value.match(/\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : null;
    }
    try {
      const d = new Date(value);
      if (!isNaN(d)) {
        return d.toISOString().split('T')[0];
      }
    } catch (_) {}
    return null;
  };

  // Helper global para convertir fecha/hora en objeto Date
  const toDate = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const iso = value.includes('T') ? value : value.replace(' ', 'T');
      const d = new Date(iso);
      return isNaN(d) ? null : d;
    }
    try {
      const d = new Date(value);
      return isNaN(d) ? null : d;
    } catch (_) {
      return null;
    }
  };

  // Normalizar valores para comparación (evita mismatch entre número y cadena)
  const normalize = (v) => (v === undefined || v === null ? null : String(v).trim());

  // Obtener campo con tolerancia a camelCase y snake_case
  const getField = (obj, ...keys) => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return null;
  };

  // Determinar si un movimiento está pendiente (sin salida o marcado como 'Pendiente')
  const isPendingMovement = (item) => {
    const salidaDate = getDatePart(getField(item, 'fechaSalida', 'fecha_salida'));
    const estado = (getField(item, 'estado', 'estado_movimiento') || '').toString().toLowerCase();
    // Pendiente si no hay fecha de salida o si el estado indica pendiente
    return !salidaDate || estado.includes('pendiente');
  };

  // Función para verificar si un equipo tiene ingreso registrado hoy
  const hasIngresoHoy = (serial) => {
    const today = getTodayDate();
    console.log('🔍 Buscando ingreso para serial:', serial, 'hoy:', today);

    const resultado = safeData.some(item => {
      const itemSerial = normalize(getField(item, 'serialEquipo', 'serial', 'serial_equipo'));
      const targetSerial = normalize(serial);
      const ingresoDate = getDatePart(getField(item, 'fechaIngreso', 'fecha_ingreso'));
      const salidaDate = getDatePart(getField(item, 'fechaSalida', 'fecha_salida'));
      const tieneIngreso = itemSerial === targetSerial && 
        ingresoDate === today &&
        !salidaDate;
      
      if (tieneIngreso) {
        console.log('✅ Encontrado ingreso pendiente:', item);
      }
      
      return tieneIngreso;
    });
    
    console.log('📋 Resultado de búsqueda:', resultado);
    return resultado;
  };

  // Buscar ingreso pendiente que coincida por documento y serial (independiente del día)
  const findPendingIngresoByQR = (documento, serial) => {

    // Filtrar por coincidencia exacta de documento y serial y salida pendiente
    const candidatos = safeData.filter(item => {
      const itemSerial = normalize(getField(item, 'serialEquipo', 'serial', 'serial_equipo'));
      const itemDoc = normalize(getField(item, 'documentoPersona', 'documento', 'documento_persona'));
      const targetSerial = normalize(serial);
      const targetDoc = normalize(documento);
      return itemSerial === targetSerial && itemDoc === targetDoc && isPendingMovement(item);
    });

    // Fallback: si no hay coincidencia por documento+serial, intentar por solo serial
    if (candidatos.length === 0) {
      const porSerial = findPendingIngresoBySerial(serial);
      if (!porSerial) return null;
      return porSerial;
    }

    // Elegir el más reciente por fechaIngreso, si no se puede, por id mayor
    const ordenados = candidatos.slice().sort((a, b) => {
      const da = toDate(a.fechaIngreso);
      const db = toDate(b.fechaIngreso);
      if (da && db) return db - da; // más reciente primero
      if (da && !db) return -1;
      if (!da && db) return 1;
      // Fallback por id
      return (b.id || 0) - (a.id || 0);
    });

    const seleccionado = ordenados[0];
    console.log('📌 Ingreso pendiente coincidente por QR:', seleccionado);
    return seleccionado;
  };

  // Buscar ingreso pendiente por serial de equipo (independiente del día)
  const findPendingIngresoBySerial = (serial) => {
    const candidatos = safeData.filter(item => {
      const itemSerial = normalize(getField(item, 'serialEquipo', 'serial', 'serial_equipo'));
      const targetSerial = normalize(serial);
      // Ingreso pendiente: coincide serial y no tiene salida registrada o está marcado 'Pendiente'
      return itemSerial === targetSerial && isPendingMovement(item);
    });

    if (candidatos.length === 0) return null;

    const ordenados = candidatos.slice().sort((a, b) => {
      const da = toDate(a.fechaIngreso);
      const db = toDate(b.fechaIngreso);
      if (da && db) return db - da;
      if (da && !db) return -1;
      if (!da && db) return 1;
      return (b.id || 0) - (a.id || 0);
    });

    const seleccionado = ordenados[0];
    console.log('📌 Ingreso pendiente por serial:', serial, seleccionado);
    return seleccionado;
  };

  // Función para verificar si un equipo tiene salida registrada hoy
  const hasSalidaHoy = (serial) => {
    const today = getTodayDate();
    return safeData.some(item => {
      const itemSerial = normalize(getField(item, 'serialEquipo', 'serial', 'serial_equipo'));
      const targetSerial = normalize(serial);
      const salidaDate = getDatePart(getField(item, 'fechaSalida', 'fecha_salida'));
      return itemSerial === targetSerial && salidaDate === today;
    });
  };

  // Función para obtener el último ingreso pendiente de un equipo
  const getUltimoIngresoPendiente = (serial) => {
    const today = getTodayDate();
    console.log('🔍 Buscando último ingreso pendiente para:', serial);
    
    const ingreso = safeData.find(item => {
      const itemSerial = normalize(getField(item, 'serialEquipo', 'serial', 'serial_equipo'));
      const targetSerial = normalize(serial);
      const ingresoDate = getDatePart(getField(item, 'fechaIngreso', 'fecha_ingreso'));
      const salidaDate = getDatePart(getField(item, 'fechaSalida', 'fecha_salida'));
      const esIngresoPendiente = itemSerial === targetSerial && 
        ingresoDate === today &&
        !salidaDate;
      
      return esIngresoPendiente;
    });
    
    console.log('📋 Ingreso pendiente encontrado:', ingreso);
    return ingreso;
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const s = String(dateString);
      // Intentar parseo sin crear Date (evita cambios por zona horaria)
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (m) {
        const [, y, mo, d, hh, mm, ss] = m;
        const datePart = `${d}/${mo}/${y}`;
        const timePart = hh ? `${hh}:${mm}${ss ? `:${ss}` : ''}` : '';
        return timePart ? `${datePart} ${timePart}` : datePart;
      }
      // Fallback: intentar como ISO tolerante
      const iso = s.includes('T') ? s : s.replace(' ', 'T');
      const date = new Date(iso);
      return isNaN(date) ? s : date.toLocaleString('es-ES');
    } catch (error) {
      return dateString;
    }
  };

  // Función para obtener solo la hora de una fecha
  const getTimeFromDate = (dateString) => {
    if (!dateString) return 'Pendiente';
    try {
      const s = String(dateString);
      // Extraer HH:mm(:ss) directamente para evitar desfase por timezone
      const m = s.match(/[ T](\d{2}:\d{2}(?::\d{2})?)/);
      if (m) {
        const [hh, mm] = m[1].split(':');
        return `${hh}:${mm}`; // UI utiliza HH:mm
      }
      // Fallback: intento tolerante con ISO
      const iso = s.includes('T') ? s : s.replace(' ', 'T');
      const date = new Date(iso);
      if (isNaN(date)) return dateString;
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return dateString;
    }
  };

  // Mapear los datos de la API a la estructura que espera la tabla
  const mappedData = safeData.map(item => {
    const rawFechaIngreso = getField(item, 'fechaIngreso', 'fecha_ingreso');
    const rawFechaSalida = getField(item, 'fechaSalida', 'fecha_salida');
    return ({
      id: getField(item, 'id', 'id_movimiento', 'movimiento_id'),
      documento: getField(item, 'documentoPersona', 'documento', 'documento_persona') || 'N/A',
      serial: getField(item, 'serialEquipo', 'serial', 'serial_equipo') || 'N/A',
      tipoIngreso: getField(item, 'tipoIngreso', 'tipo_ingreso') || 'Ocasional',
      fechaIngreso: rawFechaIngreso || null,
      fechaSalida: rawFechaSalida || null,
      centroFormacion: getField(item, 'centroFormacion', 'centro_formacion') || 'N/A',
      vigilante: getField(item, 'documentoVigilante', 'documento_vigilante') || 'N/A',
      observaciones: getField(item, 'observaciones') || 'N/A',
      tipoSalida: getField(item, 'tipoSalida', 'tipo_salida') || '',
      // Campos para compatibilidad con la tabla existente
      ingreso: getField(item, 'tipoIngreso', 'tipo_ingreso') || 'Ocasional',
      hora_ingreso: getTimeFromDate(rawFechaIngreso),
      hora_salida: getTimeFromDate(rawFechaSalida),
      dia_ingreso: formatDate(rawFechaIngreso),
      dia_salida: formatDate(rawFechaSalida),
      salida: getField(item, 'tipoSalida', 'tipo_salida') || '',
      centroformacion: getField(item, 'centroFormacion', 'centro_formacion') || 'N/A'
    });
  });

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return mappedData;
    
    const term = searchTerm.toLowerCase().trim();
    return mappedData.filter(item => 
      item.documento?.toString().toLowerCase().includes(term) ||
      item.serial?.toLowerCase().includes(term) ||
      item.tipoIngreso?.toLowerCase().includes(term) ||
      item.centroFormacion?.toLowerCase().includes(term) ||
      item.vigilante?.toString().toLowerCase().includes(term) ||
      item.observaciones?.toLowerCase().includes(term) ||
      item.tipoSalida?.toLowerCase().includes(term) ||
      (item.fechaSalida ? 'completado' : 'pendiente').includes(term) ||
      item.hora_ingreso?.toLowerCase().includes(term) ||
      item.hora_salida?.toLowerCase().includes(term)
    );
  }, [mappedData, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para generar PDF
  const generatePDF = (item) => {
    // Crear nuevo documento PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Colores
    const primaryColor = [40, 167, 69]; // Verde
    const secondaryColor = [108, 117, 125]; // Gris

    // Encabezado
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REPORTE DE MOVIMIENTO', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text('Sistema de Gestión de Equipos - CESGE', pageWidth / 2, 22, { align: 'center' });

    yPosition = 40;

    // Información principal
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`MOVIMIENTO #${item.id}`, 20, yPosition);
    yPosition += 10;

    // Fecha de generación
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...secondaryColor);
    pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition);
    yPosition += 15;

    // Línea separadora
    pdf.setDrawColor(...primaryColor);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Información de ingreso
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DE INGRESO', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const ingresoData = [
      { label: 'Documento Persona:', value: item.documento || 'N/A' },
      { label: 'Serial Equipo:', value: item.serial || 'N/A' },
      { label: 'Centro de Formación:', value: item.centroFormacion || 'N/A' },
      { label: 'Documento Vigilante:', value: item.vigilante || 'N/A' },
      { label: 'Tipo de Ingreso:', value: item.tipoIngreso || 'Ocasional' },
      { label: 'Fecha y Hora de Ingreso:', value: formatDate(item.fechaIngreso) },
      { label: 'Observaciones:', value: item.observaciones || 'Ninguna' }
    ];

    ingresoData.forEach(field => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(field.label, 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(field.value, 80, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Información de salida
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DE SALIDA', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    const salidaData = [
      { label: 'Tipo de Salida:', value: item.tipoSalida || 'Pendiente' },
      { label: 'Fecha y Hora de Salida:', value: formatDate(item.fechaSalida) || 'Pendiente' }
    ];

    salidaData.forEach(field => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(field.label, 25, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(field.value, 80, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Estado del movimiento
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESTADO DEL MOVIMIENTO', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    const estado = item.fechaSalida && item.tipoSalida ? 'COMPLETADO' : 'PENDIENTE';
    const estadoColor = item.fechaSalida && item.tipoSalida ? [40, 167, 69] : [255, 193, 7];
    
    pdf.setFillColor(...estadoColor);
    pdf.rect(25, yPosition, 30, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text(estado, 40, yPosition + 5.5, { align: 'center' });

    yPosition += 15;

    // Pie de página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setDrawColor(...secondaryColor);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(8);
    pdf.text('Este documento fue generado automáticamente por el Sistema de Gestión de Equipos.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Para más información contacte al administrador del sistema.', pageWidth / 2, yPosition, { align: 'center' });

    // Guardar PDF
    const fileName = `movimiento_${item.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  // Función para iniciar el escáner QR para ingreso
  const startQRIngreso = () => {
    setModalState(prev => ({ 
      ...prev, 
      showQRScanner: true,
      qrData: null,
      qrMode: 'ingreso'
    }));

    // Inicializar el scanner después de que el modal se muestre
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: []
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // QR escaneado exitosamente
          console.log("Código QR escaneado:", decodedText);
          handleQRScanned(decodedText, 'ingreso');
          scanner.clear();
          setQrScanner(null);
        },
        (error) => {
          // Error manejado silenciosamente durante el escaneo
          console.log("Escaneando...");
        }
      );

      setQrScanner(scanner);
    }, 500);
  };

  // Función para iniciar el escáner QR para salida
  const startQRSalida = () => {
    setModalState(prev => ({ 
      ...prev, 
      showQRScanner: true,
      qrData: null,
      qrMode: 'salida'
    }));

    // Inicializar el scanner después de que el modal se muestre
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: []
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // QR escaneado exitosamente
          console.log("Código QR escaneado:", decodedText);
          handleQRScanned(decodedText, 'salida');
          scanner.clear();
          setQrScanner(null);
        },
        (error) => {
          // Error manejado silenciosamente durante el escaneo
          console.log("Escaneando...");
        }
      );

      setQrScanner(scanner);
    }, 500);
  };

  // Función para detener el escáner QR
  const stopQRScanner = () => {
    if (qrScanner) {
      qrScanner.clear();
      setQrScanner(null);
    }
    setModalState(prev => ({ 
      ...prev, 
      showQRScanner: false,
      qrData: null 
    }));
  };

  // Función para crear movimiento automáticamente desde QR
  const createMovementFromQR = async (qrData) => {
    try {
      const API_URL = 'http://127.0.0.1:5000';
      const now = new Date();
      const today = getTodayDate();
      const time = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      const requestBody = {
        documentoPersona: qrData.documento,
        serialEquipo: qrData.serial,
        centroFormacion: 'CESGE',
        documentoVigilante: usuario?.documento || '',
        observaciones: 'Ingreso automático por QR - ' + (qrData.nombre || 'Usuario QR'),
        tipoIngreso: 'Permanente',
        fechaIngreso: `${today} ${time}`,
        tipoSalida: '',
        fechaSalida: null
      };

      console.log('🚀 Creando movimiento desde QR:', requestBody);

      const response = await fetch(`${API_URL}/movimiento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        console.log('✅ Movimiento creado exitosamente desde QR');
        // Llamar a la función de refresh si existe
        if (onRefresh) {
          onRefresh();
        }
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        console.error('❌ Error creando movimiento desde QR:', errorData);
        throw new Error(errorData.mensaje || 'Error al crear movimiento');
      }
    } catch (error) {
      console.error('💥 Error en createMovementFromQR:', error);
      throw error;
    }
  };

  // Función para registrar salida automáticamente desde QR
  const registerExitFromQR = async (ingresoPendiente) => {
    try {
      const API_URL = 'http://127.0.0.1:5000';
      const now = new Date();
      const today = getTodayDate();
      const time = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });

      // Crear el objeto para el UPDATE - igual que en handleSubmit del CrudPage
      const requestBody = {
        // Enviar en camelCase y snake_case por compatibilidad con backends mixtos
        tipoSalida: 'Permanente',
        tipo_salida: 'Permanente',
        fechaSalida: `${today} ${time}`,
        fecha_salida: `${today} ${time}`
      };

      const movementId = getField(
        ingresoPendiente,
        'id',
        'id_movimiento',
        'movimiento_id',
        'idMovimiento',
        'idmovimiento',
        'movimientoId'
      );
      console.log('🚪 Registrando salida desde QR:', requestBody);
      console.log('📋 Movimiento a actualizar (ID detectado):', movementId, ingresoPendiente);

      if (!movementId) {
        throw new Error('No se pudo determinar el ID del movimiento para actualizar');
      }

      const response = await fetch(`${API_URL}/movimiento/${movementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        console.log('✅ PUT aceptado. Refrescando movimientos...');
        if (onRefresh) {
          onRefresh();
        }
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ mensaje: 'Error desconocido' }));
        console.error('❌ Error registrando salida desde QR:', errorData);
        throw new Error(errorData.mensaje || 'Error al registrar salida');
      }
    } catch (error) {
      console.error('💥 Error en registerExitFromQR:', error);
      throw error;
    }
  };

  // Función para manejar los datos escaneados del QR
  const handleQRScanned = async (qrData, mode) => {
    try {
      console.log("📱 Datos QR crudos:", qrData);

      const parsedData = parseQRText(qrData);

      console.log("📋 Datos QR parseados:", parsedData);

      // Validar datos mínimos requeridos según el modo
      if (mode === 'salida') {
        if (!parsedData.documento || !parsedData.serial) {
          throw new Error('El código QR debe contener Documento y Serial para registrar la salida');
        }
      } else {
        if (!parsedData.documento || !parsedData.serial) {
          throw new Error('El código QR no contiene la información necesaria (Documento y Equipo)');
        }
      }

      const tieneIngresoHoy = hasIngresoHoy(parsedData.serial);
      const tieneSalidaHoy = hasSalidaHoy(parsedData.serial);

      console.log(`🔍 Validaciones para ${parsedData.serial}:`, {
        tieneIngresoHoy,
        tieneSalidaHoy,
        mode
      });

      if (mode === 'ingreso') {
        // Modo INGRESO por QR
        if (tieneIngresoHoy && !tieneSalidaHoy) {
          // Ya tiene ingreso pendiente
          showToast(
            'Ingreso ya registrado', 
            `El equipo ${parsedData.serial} ya tiene un ingreso registrado el día de hoy y está a la espera de registrar la salida.`,
            'warning'
          );
        } else if (tieneSalidaHoy) {
          // Ya tiene salida registrada hoy
          showToast(
            'Movimiento ya completado', 
            `El equipo ${parsedData.serial} ya tiene un ingreso y salida registrados el día de hoy.`,
            'info'
          );
        } else {
          // No tiene ingreso hoy - CREAR MOVIMIENTO AUTOMÁTICAMENTE
          try {
            await createMovementFromQR(parsedData);
            showToast(
              'Ingreso registrado', 
              `Se registró el ingreso de la persona ${parsedData.nombre || parsedData.documento}, con el serial ${parsedData.serial}. Ingreso registrado correctamente.`,
              'success'
            );
          } catch (error) {
            showToast(
              'Error al registrar ingreso', 
              `No se pudo registrar el ingreso: ${error.message}`,
              'danger'
            );
          }
        }
      } else if (mode === 'salida') {
        // Validación previa: verificar ingreso pendiente antes de intentar salida
        const ingresoPendiente = findPendingIngresoByQR(parsedData.documento, parsedData.serial);
        if (!ingresoPendiente) {
          showToast(
            'Sin ingreso pendiente',
            `No se encontró un ingreso pendiente para el serial ${parsedData.serial} y documento ${parsedData.documento}. Registre el ingreso o verifique si ya se registró la salida.`,
            'warning'
          );
        } else if (typeof onRegisterExitByQR === 'function') {
          try {
            const ok = await onRegisterExitByQR({
              documento: parsedData.documento,
              serial: parsedData.serial,
              nombre: parsedData.nombre,
            });
            if (ok) {
              showToast(
                'Salida registrada', 
                `Se registró la salida del equipo ${parsedData.serial} para ${parsedData.nombre || parsedData.documento}.`,
                'success'
              );
            } else {
              showToast(
                'Registro no confirmado', 
                'El backend no confirmó el registro de la salida.',
                'warning'
              );
            }
          } catch (error) {
            showToast(
              'Error al registrar salida', 
              `No se pudo registrar la salida: ${error.message}`,
              'danger'
            );
          }
        } else {
          showToast(
            'Acción no disponible', 
            'No se configuró la acción de Salida por QR.',
            'danger'
          );
        }
      }

      // Cerrar el scanner
      stopQRScanner();

    } catch (error) {
      console.error("❌ Error procesando QR:", error);
      showToast(
        'Error al procesar QR', 
        `Error: ${error.message}\n\nAsegúrate de que el QR tenga el formato correcto:\nDocumento: 123456789\nEquipo: ABC123`,
        'danger'
      );
    }
  };

  // Manejadores de acciones
  const actions = {
    showDeleteConfirmation: (item) => {
      setModalState(prev => ({
        ...prev,
        showConfirm: true,
        itemToDelete: item.id
      }));
    },
    
    confirmDelete: () => {
      onDelete(modalState.itemToDelete);
      setModalState(prev => ({ ...prev, showConfirm: false }));
    },
    
    cancelDelete: () => {
      setModalState(prev => ({ ...prev, showConfirm: false }));
    },
    
    showDetails: (item) => {
      setModalState(prev => ({
        ...prev,
        showDetails: true,
        selectedItem: item
      }));
    },
    
    closeDetails: () => {
      setModalState(prev => ({ ...prev, showDetails: false }));
    },
    
    registerExit: (item) => {
      // Simplificar: abrir modal de registro de salida sin bloquear por validaciones
      const serial = item.serialEquipo || item.serial;
      onRegisterExit(item);
      setModalState(prev => ({ ...prev, showDetails: false }));
      // La notificación de éxito se mostrará al completar el registro en el modal
    },
    
    generatePDF: (item) => {
      generatePDF(item);
    }
  };

  // Helper para verificar datos de salida
  const hasExitData = (item) => {
    // Tolerar camelCase y snake_case
    const fecha = item?.fechaSalida || item?.fecha_salida;
    const tipo = item?.tipoSalida || item?.tipo_salida;
    return !!(fecha && tipo);
  };

  // Helper para obtener estado del movimiento
  const getEstadoMovimiento = (item) => {
    if (hasExitData(item)) {
      return { texto: 'Completado', variante: 'success' };
    }
    return { texto: 'Pendiente', variante: 'warning' };
  };

  // Estilos reutilizables
  const styles = {
    actionButton: {
      marginRight: '0.5rem',
      minWidth: '100px'
    },
    pendingText: {
      color: '#dc3545',
      fontWeight: 'bold'
    }
  };

  if (loading) {
    return (
      <Container className="crud-container mt-4">
        <Card className="module-card">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando movimientos...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="crud-container mt-4">
      {/* Toasts ahora se manejan de forma global por ToastProvider */}

      {/* Tarjeta principal con tabla */}
      <Card className="module-card">
        <HeaderBar
          title="Gestión de Movimientos"
          count={filteredData.length}
          right={
            <div className="d-flex gap-2">
              <Button 
                className="modern-btn"
                onClick={startQRIngreso}
                disabled={!usuario}
              >
                <FaSignInAlt className="me-1" /> Ingreso QR
              </Button>
              <Button 
                className="modern-btn"
                onClick={startQRSalida}
                disabled={!usuario}
              >
                <FaExit className="me-1" /> Salida QR
              </Button>
              <Button className="modern-btn" onClick={onCreate}>
                <FaPlus className="me-1" /> Nuevo Ingreso
              </Button>
            </div>
          }
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Buscar por documento, serial, tipo ingreso, centro, hora o vigilante..."
          />
        </HeaderBar>
        
        <Card.Body>
          {searchTerm && (
            <div className="mt-2">
              <small className="text-muted">
                Mostrando {filteredData.length} de {mappedData.length} movimientos
                {filteredData.length === 0 && ' - No se encontraron coincidencias'}
              </small>
            </div>
          )}

          {mappedData.length === 0 ? (
            <div className="text-center py-4">
              <Alert variant="info">
                <h5>No hay movimientos registrados</h5>
                <p className="mb-0">Comienza registrando el primer movimiento de ingreso.</p>
              </Alert>
              <Button variant="primary" onClick={onCreate}>
                <FaPlus className="me-1" /> Crear primer movimiento
              </Button>
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron resultados</h5>
              <p className="text-muted">
                No hay movimientos que coincidan con "{searchTerm}"
              </p>
              <Button variant="outline-success" onClick={clearSearch}>
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div>
              <div className="table-scroll table-sticky">
                <Table striped hover size="sm" className="table-modern table-compact">
                  <thead className="table-light">
                  <tr>
                    <th>Documento</th>
                    <th>Serial</th>
                    <th>Tipo Ingreso</th>
                    <th>Hora Ingreso</th>
                    <th>Hora Salida</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                  </thead>
                
                <tbody>
                  {filteredData.map((item) => {
                    const estado = getEstadoMovimiento(item);
                    const ingresoDate = getDatePart(item.fechaIngreso);
                    const salidaDate = getDatePart(item.fechaSalida);
                    const isPendingPreviousDay = ingresoDate && ingresoDate !== getTodayDate() && !salidaDate;
                    return (
                      <tr key={item.id} className={isPendingPreviousDay ? 'table-danger' : ''}>
                        <td>{item.documento}</td>
                        <td>{item.serial}</td>
                        <td>{item.tipoIngreso}</td>
                        <td>{item.hora_ingreso}</td>
                        <td>{item.hora_salida}</td>
                        
                        <td>
                          <Button 
                            variant={estado.variante}
                            size="sm"
                            style={styles.actionButton}
                            disabled
                          >
                            {estado.texto}
                          </Button>
                        </td>
                        
                        <td className="text-nowrap">
                          <Button 
                            variant="info"
                            size="sm"
                            style={styles.actionButton}
                            onClick={() => actions.showDetails(item)}
                          >
                            <FaInfoCircle className="me-1" /> Detalles
                          </Button>
                          
                          <Button 
                            variant="warning" 
                            size="sm"
                            style={styles.actionButton}
                            onClick={() => actions.generatePDF(item)}
                          >
                            <FaFilePdf className="me-1" /> PDF
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => actions.showDeleteConfirmation(item)}
                            disabled={hasExitData(item)}
                          >
                            <FaTrash className="me-1" /> Anular
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              </div>
              
              {/* Información de resultados */}
              {searchTerm && filteredData.length > 0 && (
                <div className="mt-3 text-center">
                  <Button variant="outline-success" size="sm" onClick={clearSearch}>
                    Mostrando {filteredData.length} de {mappedData.length} movimientos - Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal show={modalState.showConfirm} onHide={actions.cancelDelete} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Anulación
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <p>¿Estás seguro que deseas anular este movimiento?</p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={actions.cancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={actions.confirmDelete}>
            <FaTrash className="me-1" /> Confirmar Anulación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de detalles */}
      <Modal show={modalState.showDetails} onHide={actions.closeDetails} size="lg" contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalState.selectedItem && hasExitData(modalState.selectedItem)
              ? "Detalles Completos del Movimiento"
              : "Detalles del Ingreso"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {modalState.selectedItem && (
            <div className="movement-details">
              {/* Sección de Ingreso */}
              <section className="mb-4">
                <h5 className="border-bottom pb-2">Información de Ingreso</h5>
                <Table borderless className="table-modern table-compact">
                  <tbody>
                    {[
                      { label: 'Documento Persona', value: modalState.selectedItem.documento },
                      { label: 'Serial Equipo', value: modalState.selectedItem.serial },
                      { label: 'Centro de Formación', value: modalState.selectedItem.centroFormacion },
                      { label: 'Documento Vigilante', value: modalState.selectedItem.vigilante },
                      { label: 'Observaciones', value: modalState.selectedItem.observaciones },
                      { label: 'Tipo de Ingreso', value: modalState.selectedItem.tipoIngreso },
                      { label: 'Fecha de Ingreso', value: modalState.selectedItem.dia_ingreso }
                    ].map((field, index) => (
                      <tr key={index}>
                        <td width="40%" className="font-weight-bold">{field.label}:</td>
                        <td>{field.value || 'No especificado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>

              {/* Sección de Salida */}
              <section>
                <h5 className="border-bottom pb-2">Información de Salida</h5>
                <Table borderless className="table-modern table-compact">
                  <tbody>
                    {[
                      { label: 'Tipo de Salida', value: modalState.selectedItem.tipoSalida, required: true },
                      { label: 'Fecha de Salida', value: modalState.selectedItem.dia_salida, required: true }
                    ].map((field, index) => (
                      <tr key={index}>
                        <td width="40%" className="font-weight-bold">{field.label}:</td>
                        <td style={!field.value && field.required ? styles.pendingText : {}}>
                          {field.value || (field.required ? 'Pendiente de registro' : 'No especificado')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          {modalState.selectedItem && !hasExitData(modalState.selectedItem) && (
            <Button 
              variant="primary" 
              onClick={() => actions.registerExit(modalState.selectedItem)}
              className="me-auto"
            >
              <FaSignOutAlt className="me-1" /> Registrar Salida
            </Button>
          )}
          
          <Button variant="secondary" onClick={actions.closeDetails}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal del escáner QR */}
      <Modal show={modalState.showQRScanner} onHide={stopQRScanner} centered size="lg" contentClassName="modal-modern qr-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaQrcode className="me-2" />
            Escanear Código QR - {modalState.qrMode === 'ingreso' ? 'Ingreso' : 'Salida'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div id="qr-reader" className="mb-3"></div>
          <p className="text-muted">
            Enfoca la cámara hacia el código QR del equipo o persona
            {modalState.qrMode === 'ingreso' 
              ? ' para registrar el ingreso' 
              : ' para registrar la salida'
            }
          </p>
          {!usuario && (
            <Alert variant="warning" className="mt-3">
              Debes iniciar sesión para usar el escáner QR
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stopQRScanner}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
