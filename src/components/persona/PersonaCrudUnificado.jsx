import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  FaSearch, 
  FaEdit, 
  FaEye, 
  FaEyeSlash, 
  FaTrash, 
  FaPlus, 
  FaCheckCircle,
  FaUser,
  FaLaptop,
  FaTimes,
  FaQrcode,
  FaDownload
} from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import HeaderBar from '../ui/HeaderBar.jsx';
import SearchBar from '../ui/SearchBar.jsx';

const CrudPersonasEquipos = () => {
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [personaDetalle, setPersonaDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [tiposPersona, setTiposPersona] = useState([]);
  
  // Estado del formulario principal
  const [formData, setFormData] = useState({
    documento: '',
    tipoDocumento: '',
    nombre: '',
    apellido: '',
    celular: '',
    correo: '',
    tipoPersonaId: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    estado: 1,
    equipos: [{
      serial: '',
      tipoEquipoId: '',
      accesorios: 'Sin accesorios',
      marca: '',
      color: '#000000'
    }]
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  // Estados para el QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [equipoSeleccionadoQR, setEquipoSeleccionadoQR] = useState(null);
  const [qrText, setQrText] = useState('');

  // Ref para el QR Canvas
  const qrCodeRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Efecto para generar el texto del QR cuando los datos cambien
  useEffect(() => {
    if (qrData) {
      const texto = `Documento: ${qrData.documento}\nEquipo: ${qrData.equipo}`;
      setQrText(texto);
    }
  }, [qrData]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarPersonas(),
        cargarEquipos(),
        cargarTiposEquipo(),
        cargarTiposPersona()
      ]);
    } catch (error) {
      mostrarError('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  // API Calls
  const cargarPersonas = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/persona');
      const data = await response.json();
      if (data.personas) {
        setPersonas(data.personas);
      }
    } catch (error) {
      mostrarError('Error al cargar personas');
    }
  };

  const cargarEquipos = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/equipo');
      const data = await response.json();
      if (data.equipos) {
        setEquipos(data.equipos);
      }
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  const cargarTiposEquipo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/tipoequipo');
      const data = await response.json();
      if (data.tipoequipos) {
        setTiposEquipo(data.tipoequipos.filter(tipo => tipo.estado === 1));
      }
    } catch (error) {
      mostrarError('Error al cargar tipos de equipo');
    }
  };

  const cargarTiposPersona = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/tipopersona');
      const data = await response.json();
      if (data.tipopersonas) {
        setTiposPersona(data.tipopersonas.filter(tipo => tipo.estado === 1));
      }
    } catch (error) {
      mostrarError('Error al cargar tipos de persona');
    }
  };

  // Cargar equipos de una persona específica
  const cargarEquiposPersona = async (documento) => {
    try {
      const persona = personas.find(p => p.documento === documento);
      if (!persona || !persona.equipo) return [];
      
      const equipoAsignado = equipos.find(e => e.serial === persona.equipo);
      return equipoAsignado ? [equipoAsignado] : [];
    } catch (error) {
      console.error('Error al cargar equipos de la persona:', error);
      return [];
    }
  };

  // Handlers del formulario
  const handleChangePersona = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangeEquipo = (index, e) => {
    const { name, value } = e.target;
    const nuevosEquipos = [...formData.equipos];
    nuevosEquipos[index] = {
      ...nuevosEquipos[index],
      [name]: value
    };
    setFormData(prev => ({
      ...prev,
      equipos: nuevosEquipos
    }));
  };

  // Agregar nuevo equipo al formulario
  const agregarEquipo = () => {
    setFormData(prev => ({
      ...prev,
      equipos: [
        ...prev.equipos,
        {
          serial: '',
          tipoEquipoId: '',
          accesorios: 'Sin accesorios',
          marca: '',
          color: '#000000'
        }
      ]
    }));
  };

  // Remover equipo del formulario
  const removerEquipo = (index) => {
    if (formData.equipos.length === 1) {
      mostrarError('Debe haber al menos un equipo');
      return;
    }
    
    const nuevosEquipos = formData.equipos.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      equipos: nuevosEquipos
    }));
  };

  // Guardar persona y equipos
  const guardarPersona = async (e) => {
    e.preventDefault();
    
    if (!formData.documento || !formData.nombre || !formData.apellido || !formData.tipoPersonaId) {
      mostrarError('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    if (formData.equipos.length === 0) {
      mostrarError('Debe agregar al menos un equipo');
      return;
    }

    for (let i = 0; i < formData.equipos.length; i++) {
      const equipo = formData.equipos[i];
      if (!equipo.serial || !equipo.tipoEquipoId) {
        mostrarError(`Complete todos los campos obligatorios del Equipo ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      if (modoEdicion) {
        await actualizarPersonaYEquipos();
      } else {
        await crearPersonaYEquipos();
      }
      
    } catch (error) {
      mostrarError('Error al guardar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const crearPersonaYEquipos = async () => {
    try {
      const equiposCreados = [];
      for (const equipo of formData.equipos) {
        const equipoExistente = equipos.find(e => e.serial === equipo.serial);
        
        if (!equipoExistente) {
          const equipoData = {
            serial: equipo.serial,
            marca: equipo.marca,
            accesorios: equipo.accesorios,
            color: equipo.color,
            fechaRegistro: formData.fechaRegistro,
            tipoEquipoId: equipo.tipoEquipoId,
            estado: 1
          };

          const response = await fetch('http://127.0.0.1:5000/equipo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipoData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || `Error al crear equipo ${equipo.serial}`);
          }
        }

        equiposCreados.push(equipo.serial);
      }

      const personaData = {
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipoPersonaId: formData.tipoPersonaId,
        equipo: equiposCreados[0],
        fechaRegistro: formData.fechaRegistro,
        estado: 1
      };

      const responsePersona = await fetch('http://127.0.0.1:5000/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
      });

      if (!responsePersona.ok) {
        const errorData = await responsePersona.json();
        throw new Error(errorData.mensaje || 'Error al crear persona');
      }

      for (let i = 1; i < equiposCreados.length; i++) {
        const personaAdicionalData = {
          documento: `${formData.documento}_EQ${i}`,
          tipoDocumento: formData.tipoDocumento,
          nombre: formData.nombre,
          apellido: formData.apellido,
          tipoPersonaId: formData.tipoPersonaId,
          equipo: equiposCreados[i],
          fechaRegistro: formData.fechaRegistro,
          estado: 1
        };

        await fetch('http://127.0.0.1:5000/persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personaAdicionalData)
        });
      }

      mostrarSuccess('Persona y equipos creados exitosamente');
      resetForm();
      await cargarPersonas();
      await cargarEquipos();
      
    } catch (error) {
      throw error;
    }
  };

  const actualizarPersonaYEquipos = async () => {
    try {
      const personaData = {
        tipoDocumento: formData.tipoDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipoPersonaId: formData.tipoPersonaId,
        equipo: formData.equipos[0].serial,
        fechaRegistro: formData.fechaRegistro,
        estado: formData.estado
      };

      const responsePersona = await fetch(`http://127.0.0.1:5000/persona/${formData.documento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
      });

      if (!responsePersona.ok) {
        const errorData = await responsePersona.json();
        throw new Error(errorData.mensaje || 'Error al actualizar persona');
      }

      const personasAdicionales = personas.filter(p => 
        p.documento.startsWith(`${formData.documento}_EQ`)
      );
      
      for (const personaAdicional of personasAdicionales) {
        await fetch(`http://127.0.0.1:5000/persona/${personaAdicional.documento}`, {
          method: 'DELETE'
        });
      }

      for (let i = 1; i < formData.equipos.length; i++) {
        const equipo = formData.equipos[i];
        
        const equipoExistente = equipos.find(e => e.serial === equipo.serial);
        if (!equipoExistente) {
          const equipoData = {
            serial: equipo.serial,
            marca: equipo.marca,
            accesorios: equipo.accesorios,
            color: equipo.color,
            fechaRegistro: formData.fechaRegistro,
            tipoEquipoId: equipo.tipoEquipoId,
            estado: 1
          };

          const responseEquipo = await fetch('http://127.0.0.1:5000/equipo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipoData)
          });

          if (!responseEquipo.ok) {
            const errorData = await responseEquipo.json();
            throw new Error(errorData.mensaje || `Error al crear equipo ${equipo.serial}`);
          }
        }

        const personaAdicionalData = {
          documento: `${formData.documento}_EQ${i}`,
          tipoDocumento: formData.tipoDocumento,
          nombre: formData.nombre,
          apellido: formData.apellido,
          tipoPersonaId: formData.tipoPersonaId,
          equipo: equipo.serial,
          fechaRegistro: formData.fechaRegistro,
          estado: 1
        };

        await fetch('http://127.0.0.1:5000/persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personaAdicionalData)
        });
      }

      for (const equipo of formData.equipos) {
        const equipoExistente = equipos.find(e => e.serial === equipo.serial);
        if (equipoExistente) {
          const equipoData = {
            marca: equipo.marca,
            accesorios: equipo.accesorios,
            color: equipo.color,
            tipoEquipoId: equipo.tipoEquipoId,
            estado: 1
          };

          await fetch(`http://127.0.0.1:5000/equipo/${equipo.serial}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipoData)
          });
        }
      }

      mostrarSuccess('Persona y equipos actualizados exitosamente');
      resetForm();
      await cargarPersonas();
      await cargarEquipos();
      
    } catch (error) {
      throw error;
    }
  };

  // Eliminar persona
  const eliminarPersona = async (documento) => {
    if (!window.confirm('¿Está seguro de eliminar esta persona y todos sus equipos asociados?')) return;

    try {
      setLoading(true);
      
      const response = await fetch(`http://127.0.0.1:5000/persona/${documento}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const personasAdicionales = personas.filter(p => 
          p.documento.startsWith(`${documento}_EQ`)
        );
        
        for (const personaAdicional of personasAdicionales) {
          await fetch(`http://127.0.0.1:5000/persona/${personaAdicional.documento}`, {
            method: 'DELETE'
          });
        }

        mostrarSuccess('Persona y todos sus equipos eliminados exitosamente');
        await cargarPersonas();
        if (personaSeleccionada?.documento === documento) {
          setPersonaSeleccionada(null);
        }
      } else {
        const data = await response.json();
        mostrarError(data.mensaje || 'Error al eliminar persona');
      }
    } catch (error) {
      mostrarError('Error de conexión al eliminar persona');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de persona
  const cambiarEstadoPersona = async (persona) => {
    try {
      setLoading(true);
      const nuevoEstado = persona.estado === 1 ? 0 : 1;
      
      const response = await fetch(`http://127.0.0.1:5000/persona/${persona.documento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: persona.tipoDocumento,
          nombre: persona.nombre,
          apellido: persona.apellido,
          tipoPersonaId: persona.tipoPersonaId,
          equipo: persona.equipo,
          fechaRegistro: persona.fechaRegistro,
          estado: nuevoEstado
        })
      });

      if (response.ok) {
        mostrarSuccess(`Persona ${nuevoEstado === 1 ? 'activada' : 'desactivada'} exitosamente`);
        await cargarPersonas();
      } else {
        const data = await response.json();
        mostrarError(data.mensaje || 'Error al cambiar estado');
      }
    } catch (error) {
      mostrarError('Error de conexión al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar persona para editar
  const seleccionarPersona = async (persona) => {
    try {
      setLoading(true);
      
      const equiposPersona = await cargarEquiposPersona(persona.documento);
      
      const personasAdicionales = personas.filter(p => 
        p.documento.startsWith(`${persona.documento}_EQ`)
      );
      
      const equiposAdicionales = await Promise.all(
        personasAdicionales.map(async (pAdicional) => {
          const equipos = await cargarEquiposPersona(pAdicional.documento);
          return equipos[0];
        })
      );

      const todosLosEquipos = [...equiposPersona, ...equiposAdicionales.filter(e => e)];

      const equiposForm = todosLosEquipos.length > 0 
        ? todosLosEquipos.map(equipo => ({
            serial: equipo.serial,
            tipoEquipoId: equipo.tipoEquipoId.toString(),
            accesorios: equipo.accesorios || 'Sin accesorios',
            marca: equipo.marca || '',
            color: equipo.color || '#000000'
          }))
        : [{
            serial: '',
            tipoEquipoId: '',
            accesorios: 'Sin accesorios',
            marca: '',
            color: '#000000'
          }];

      setFormData({
        documento: persona.documento,
        tipoDocumento: persona.tipoDocumento,
        nombre: persona.nombre,
        apellido: persona.apellido,
        celular: persona.celular || '',
        correo: persona.correo || '',
        tipoPersonaId: persona.tipoPersonaId.toString(),
        fechaRegistro: persona.fechaRegistro.split('T')[0],
        estado: persona.estado,
        equipos: equiposForm
      });
      
      setPersonaSeleccionada(persona);
      setModoEdicion(true);
      
    } catch (error) {
      mostrarError('Error al cargar datos para edición');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar detalle de persona
  const mostrarDetallePersona = async (persona) => {
    try {
      const equiposPersona = await cargarEquiposPersona(persona.documento);
      
      const personasAdicionales = personas.filter(p => 
        p.documento.startsWith(`${persona.documento}_EQ`)
      );
      
      const equiposAdicionales = await Promise.all(
        personasAdicionales.map(async (pAdicional) => {
          const equipos = await cargarEquiposPersona(pAdicional.documento);
          return equipos[0];
        })
      );

      const todosLosEquipos = [...equiposPersona, ...equiposAdicionales.filter(e => e)];

      setPersonaDetalle({
        ...persona,
        equipos: todosLosEquipos,
        personasAdicionales: personasAdicionales.length
      });
      setShowDetalle(true);
    } catch (error) {
      mostrarError('Error al cargar detalles de la persona');
    }
  };

  // FUNCIÓN PARA GENERAR QR
  const generarQR = async (persona) => {
    try {
      const todosLosEquipos = obtenerTodosLosEquiposPersona(persona.documento);
      
      if (todosLosEquipos.length === 0) {
        mostrarError('Esta persona no tiene equipos asignados');
        return;
      }

      if (todosLosEquipos.length === 1) {
        const equipo = todosLosEquipos[0];
        const qrInfo = {
          documento: persona.documento,
          equipo: equipo.serial,
          nombre: `${persona.nombre} ${persona.apellido}`,
          tipoEquipo: obtenerNombreTipoEquipo(equipo.tipoEquipoId)
        };
        
        setQrData(qrInfo);
        setEquipoSeleccionadoQR(equipo);
        setShowQRModal(true);
      } else {
        setPersonaSeleccionada(persona);
        setEquipoSeleccionadoQR(null);
        setShowQRModal(true);
      }
      
    } catch (error) {
      mostrarError('Error al generar código QR');
    }
  };

  // Seleccionar equipo para QR
  const seleccionarEquipoParaQR = (equipo) => {
    const persona = personaSeleccionada;
    const qrInfo = {
      documento: persona.documento,
      equipo: equipo.serial,
      nombre: `${persona.nombre} ${persona.apellido}`,
      tipoEquipo: obtenerNombreTipoEquipo(equipo.tipoEquipoId)
    };
    
    setQrData(qrInfo);
    setEquipoSeleccionadoQR(equipo);
  };

  // Descargar QR como imagen - CORREGIDO
  const descargarQR = () => {
    if (qrCodeRef.current) {
      // Obtener el canvas del QRCode
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.download = `QR_${qrData.documento}_${qrData.equipo}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        mostrarError('No se pudo generar el código QR para descargar');
      }
    }
  };

  // Cerrar modal QR
  const cerrarQRModal = () => {
    setShowQRModal(false);
    setQrData(null);
    setEquipoSeleccionadoQR(null);
    setPersonaSeleccionada(null);
    setQrText('');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      documento: '',
      tipoDocumento: '',
      nombre: '',
      apellido: '',
      celular: '',
      correo: '',
      tipoPersonaId: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
      estado: 1,
      equipos: [{
        serial: '',
        tipoEquipoId: '',
        accesorios: 'Sin accesorios',
        marca: '',
        color: '#000000'
      }]
    });
    setModoEdicion(false);
    setPersonaSeleccionada(null);
    setShowDetalle(false);
  };

  // Utilidades de UI
  const mostrarError = (mensaje) => {
    setError(mensaje);
    setTimeout(() => setError(''), 5000);
  };

  const mostrarSuccess = (mensaje) => {
    setSuccess(mensaje);
    setTimeout(() => setSuccess(''), 5000);
  };

  // Filtrar personas (excluyendo las adicionales)
  const personasFiltradas = personas.filter(persona =>
    !persona.documento.includes('_EQ') && (
      persona.documento.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Obtener equipo asignado
  const obtenerEquipoAsignado = (serial) => {
    return equipos.find(equipo => equipo.serial === serial);
  };

  // Obtener nombre del tipo de equipo
  const obtenerNombreTipoEquipo = (tipoEquipoId) => {
    const tipo = tiposEquipo.find(t => t.id.toString() === tipoEquipoId?.toString());
    return tipo ? tipo.nombre : 'N/A';
  };

  // Obtener todos los equipos de una persona (principal + adicionales)
  const obtenerTodosLosEquiposPersona = (documento) => {
    const personaPrincipal = personas.find(p => p.documento === documento);
    const equipoPrincipal = personaPrincipal ? obtenerEquipoAsignado(personaPrincipal.equipo) : null;
    
    const personasAdicionales = personas.filter(p => 
      p.documento.startsWith(`${documento}_EQ`)
    );
    
    const equiposAdicionales = personasAdicionales
      .map(p => obtenerEquipoAsignado(p.equipo))
      .filter(e => e);
    
    const todosLosEquipos = [];
    if (equipoPrincipal) todosLosEquipos.push(equipoPrincipal);
    todosLosEquipos.push(...equiposAdicionales);
    
    return todosLosEquipos;
  };

  return (
    <div className="crud-container py-3">
      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          <FaEye className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
          <FaCheckCircle className="me-2" />
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="row">
        {/* Columna izquierda - Tabla de personas */}
        <div className="col-lg-8">
          <div className="card module-card">
            <HeaderBar
              title="Personas"
              count={personasFiltradas.length}
            >
              <SearchBar
                value={busqueda}
                onChange={setBusqueda}
                onClear={() => setBusqueda('')}
                placeholder="Buscar por documento, nombre o apellido..."
              />
            </HeaderBar>
            <div className="card-body p-3">

              {/* Tabla con botón QR */}
            <div className="table-scroll table-sticky">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : (
              <table className="table table-sm table-striped table-hover table-modern table-compact">
                <thead className="table-light">
                      <tr>
                        <th>Documento</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Tipo Persona</th>
                        <th>Equipos Asignados</th>
                        <th>Estado</th>
                        <th width="160">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personasFiltradas.map(persona => {
                        const tipoPersona = tiposPersona.find(tp => 
                          tp.id.toString() === persona.tipoPersonaId?.toString()
                        );
                        const todosLosEquipos = obtenerTodosLosEquiposPersona(persona.documento);
                        
                        return (
                          <tr 
                            key={persona.documento} 
                            className={personaSeleccionada?.documento === persona.documento ? 'table-active' : ''}
                          >
                            <td className="fw-bold">{persona.documento}</td>
                            <td>{persona.nombre}</td>
                            <td>{persona.apellido}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {tipoPersona?.nombre || 'N/A'}
                              </span>
                            </td>
                            <td>
                              {todosLosEquipos.length > 0 ? (
                                <div>
                                  <small>
                                    <FaLaptop className="me-1 text-success" />
                                    <strong>{todosLosEquipos.length} equipo(s)</strong>
                                  </small>
                                  <br />
                                  <small className="text-muted">
                                    Principal: {todosLosEquipos[0]?.serial}
                                    {todosLosEquipos.length > 1 && ` +${todosLosEquipos.length - 1} más`}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted small">Sin equipos</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${persona.estado === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {persona.estado === 1 ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                {/* Botón QR */}
                                <button 
                                  className="btn btn-outline-success"
                                  onClick={() => generarQR(persona)}
                                  title="Generar QR"
                                  disabled={todosLosEquipos.length === 0}
                                >
                                  <FaQrcode />
                                </button>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => mostrarDetallePersona(persona)}
                                  title="Ver detalle"
                                >
                                  <FaEye />
                                </button>
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => seleccionarPersona(persona)}
                                  title="Editar"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  className={`btn ${persona.estado === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => cambiarEstadoPersona(persona)}
                                  title={persona.estado === 1 ? 'Desactivar' : 'Activar'}
                                >
                                  {persona.estado === 1 ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => eliminarPersona(persona.documento)}
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                
                {personasFiltradas.length === 0 && !loading && (
                  <div className="text-center py-4 text-muted">
                    <FaUser className="display-4 mb-2" />
                    <p className="mb-0">No se encontraron personas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario COMPLETO */}
        <div className="col-lg-3">
          <div className="card module-card">
            <div className="card-header py-2">
              <h5 className="mb-0">
                {modoEdicion ? 'Editar Persona' : 'Nueva Persona'}
                {modoEdicion && (
                  <button 
                    className="btn btn-sm btn-outline-light float-end"
                    onClick={resetForm}
                  >
                    <FaPlus className="me-1" /> Nueva
                  </button>
                )}
              </h5>
            </div>
            <div className="card-body p-3">
              <form onSubmit={guardarPersona}>
                {/* Información de la Persona */}
                <div className="row g-2 mb-2">
                  <div className="col-12">
                    <label className="form-label small mb-1">
                      Tipo documento <span className="text-danger">*</span>
                    </label>
                    <select
                      name="tipoDocumento"
                      className="form-select form-select-sm"
                      value={formData.tipoDocumento}
                      onChange={handleChangePersona}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="CC">Cédula</option>
                      <option value="CE">Extranjería</option>
                      <option value="TI">Tarjeta</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-12">
                    <label className="form-label small mb-1">
                      Documento <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="documento"
                      className="form-control form-control-sm"
                      value={formData.documento}
                      onChange={handleChangePersona}
                      required
                      disabled={modoEdicion}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control form-control-sm"
                      value={formData.nombre}
                      onChange={handleChangePersona}
                      required
                    />
                  </div>
                  
                  <div className="col-6">
                    <label className="form-label small mb-1">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      className="form-control form-control-sm"
                      value={formData.apellido}
                      onChange={handleChangePersona}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">Celular</label>
                    <input
                      type="tel"
                      name="celular"
                      className="form-control form-control-sm"
                      value={formData.celular}
                      onChange={handleChangePersona}
                    />
                  </div>
                  
                  <div className="col-6">
                    <label className="form-label small mb-1">Correo</label>
                    <input
                      type="email"
                      name="correo"
                      className="form-control form-control-sm"
                      value={formData.correo}
                      onChange={handleChangePersona}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <label className="form-label small mb-1">
                      Tipo Persona <span className="text-danger">*</span>
                    </label>
                    <select
                      name="tipoPersonaId"
                      className="form-select form-select-sm"
                      value={formData.tipoPersonaId}
                      onChange={handleChangePersona}
                      required
                    >
                      <option value="">Seleccione...</option>
                      {tiposPersona.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <label className="form-label small mb-1">Fecha Registro</label>
                    <input
                      type="date"
                      name="fechaRegistro"
                      className="form-control form-control-sm"
                      value={formData.fechaRegistro}
                      onChange={handleChangePersona}
                      required
                    />
                  </div>
                </div>

                {/* Equipos Asociados */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 small">
                      <FaLaptop className="me-1" />
                      Equipos Asociados ({formData.equipos.length})
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={agregarEquipo}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>

                  {formData.equipos.map((equipo, index) => (
                    <div key={index} className="card mb-2">
                      <div className="card-header py-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="small">
                            {index === 0 ? '🏠 Equipo Principal' : `➕ Equipo Adicional ${index}`}
                          </strong>
                          {formData.equipos.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger p-1"
                              onClick={() => removerEquipo(index)}
                            >
                              <FaTrash size={8} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="card-body p-2">
                        <div className="row g-1 mb-1">
                          <div className="col-12">
                            <label className="form-label small mb-0">
                              Serial <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              name="serial"
                              className="form-control form-control-sm"
                              value={equipo.serial}
                              onChange={(e) => handleChangeEquipo(index, e)}
                              required
                              placeholder="Serial del equipo"
                            />
                          </div>
                        </div>

                        <div className="row g-1 mb-1">
                          <div className="col-12">
                            <label className="form-label small mb-0">
                              Tipo <span className="text-danger">*</span>
                            </label>
                            <select
                              name="tipoEquipoId"
                              className="form-select form-select-sm"
                              value={equipo.tipoEquipoId}
                              onChange={(e) => handleChangeEquipo(index, e)}
                              required
                            >
                              <option value="">Seleccione...</option>
                              {tiposEquipo.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                  {tipo.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row g-1">
                          <div className="col-6">
                            <label className="form-label small mb-0">Marca</label>
                            <input
                              type="text"
                              name="marca"
                              className="form-control form-control-sm"
                              value={equipo.marca}
                              onChange={(e) => handleChangeEquipo(index, e)}
                              placeholder="Marca"
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small mb-0">Color</label>
                            <input
                              type="color"
                              name="color"
                              className="form-control form-control-color form-control-sm"
                              value={equipo.color}
                              onChange={(e) => handleChangeEquipo(index, e)}
                            />
                          </div>
                        </div>

                        <div className="row g-1 mt-1">
                          <div className="col-12">
                            <label className="form-label small mb-0">Accesorios</label>
                            <select
                              name="accesorios"
                              className="form-select form-select-sm"
                              value={equipo.accesorios}
                              onChange={(e) => handleChangeEquipo(index, e)}
                            >
                              <option>Sin accesorios</option>
                              <option>Cargador</option>
                              <option>Mouse</option>
                              <option>Audífonos</option>
                              <option>Mochila</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="d-grid gap-1">
                  <button
                    type="submit"
                    className="btn btn-success btn-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-1" />
                        {modoEdicion ? 'Actualizar' : 'Guardar'} Persona
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Persona */}
      {showDetalle && personaDetalle && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content modal-modern details-modal">
              <div className="modal-header py-2">
                <h6 className="modal-title">
                  <FaUser className="me-2" />
                  Detalle de Persona - {personaDetalle.equipos?.length || 0} equipo(s)
                </h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDetalle(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2">Información Personal</h6>
                    <p><strong>Documento:</strong><br/>{personaDetalle.documento}</p>
                    <p><strong>Nombre:</strong><br/>{personaDetalle.nombre} {personaDetalle.apellido}</p>
                    <p><strong>Tipo Persona:</strong><br/>{
                      tiposPersona.find(tp => tp.id.toString() === personaDetalle.tipoPersonaId?.toString())?.nombre || 'N/A'
                    }</p>
                    <p><strong>Estado:</strong><br/>
                      <span className={`badge ${personaDetalle.estado === 1 ? 'bg-success' : 'bg-danger'}`}>
                        {personaDetalle.estado === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                    <p><strong>Fecha Registro:</strong><br/>
                      {new Date(personaDetalle.fechaRegistro).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2">
                      Equipos Asociados ({personaDetalle.equipos?.length || 0})
                    </h6>
                    {personaDetalle.equipos && personaDetalle.equipos.length > 0 ? (
                      personaDetalle.equipos.map((equipo, index) => (
                        <div key={index} className="card mb-2">
                          <div className="card-body p-2">
                            <p className="mb-1">
                              <strong>
                                {index === 0 ? '🏠 Principal' : `➕ Adicional ${index}`}
                              </strong>
                            </p>
                            <p className="mb-1"><strong>Serial:</strong> {equipo.serial}</p>
                            <p className="mb-1"><strong>Tipo:</strong> {obtenerNombreTipoEquipo(equipo.tipoEquipoId)}</p>
                            <p className="mb-1"><strong>Marca:</strong> {equipo.marca || 'N/A'}</p>
                            <p className="mb-1"><strong>Color:</strong> {equipo.color || 'N/A'}</p>
                            <p className="mb-0"><strong>Accesorios:</strong> {equipo.accesorios || 'Ninguno'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No tiene equipos asignados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Generar Código QR CON LIBRERÍA REAL Y DESCARGA FUNCIONAL */}
      {showQRModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-md">
            <div className="modal-content modal-modern qr-modal">
              <div className="modal-header py-2">
                <h6 className="modal-title">
                  <FaQrcode className="me-2" />
                  {qrData ? 'Código QR Generado' : 'Seleccionar Equipo para QR'}
                </h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={cerrarQRModal}
                ></button>
              </div>
              <div className="modal-body p-3 text-center">
                
                {!qrData ? (
                  // Vista de selección de equipo (para múltiples equipos)
                  <div>
                    <h6 className="mb-3">
                      {personaSeleccionada?.nombre} {personaSeleccionada?.apellido}
                      <br />
                      <small className="text-muted">Documento: {personaSeleccionada?.documento}</small>
                    </h6>
                    
                    <p className="text-muted mb-3">
                      Esta persona tiene {obtenerTodosLosEquiposPersona(personaSeleccionada?.documento).length} equipos asignados. 
                      Seleccione uno para generar el código QR:
                    </p>
                    
                    <div className="list-group">
                      {obtenerTodosLosEquiposPersona(personaSeleccionada?.documento).map((equipo, index) => (
                        <button
                          key={equipo.serial}
                          type="button"
                          className="list-group-item list-group-item-action text-start"
                          onClick={() => seleccionarEquipoParaQR(equipo)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{equipo.serial}</strong>
                              <br />
                              <small className="text-muted">
                                {obtenerNombreTipoEquipo(equipo.tipoEquipoId)} • {equipo.marca || 'Sin marca'}
                                {index === 0 && <span className="badge bg-primary ms-1">Principal</span>}
                              </small>
                            </div>
                            <FaQrcode className="text-success" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Vista del QR generado
                  <div>
                    <h6 className="mb-2">{qrData.nombre}</h6>
                    <p className="text-muted small mb-3">
                      Documento: {qrData.documento} | Equipo: {qrData.equipo}
                    </p>
                    
                    {/* Contenedor del QR con librería real - USANDO QRCodeCanvas */}
                    <div 
                      ref={qrCodeRef}
                      className="border rounded p-3 mb-3 bg-light d-flex justify-content-center"
                    >
                      <QRCodeCanvas
                        value={qrText}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                      />
                    </div>
                    
                    {/* Información del equipo */}
                    <div className="card mb-3">
                      <div className="card-body p-2">
                        <p className="mb-1"><strong>Equipo:</strong> {qrData.equipo}</p>
                        <p className="mb-1"><strong>Tipo:</strong> {qrData.tipoEquipo}</p>
                        <p className="mb-0"><strong>Marca:</strong> {equipoSeleccionadoQR?.marca || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-success"
                        onClick={descargarQR}
                      >
                        <FaDownload className="me-2" />
                        Descargar QR
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={cerrarQRModal}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudPersonasEquipos;