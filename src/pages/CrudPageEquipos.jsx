import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CrudTable from '../components/equipo/Table';
import CrudModal from '../components/equipo/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function EquipoCrud() {
  const [equipos, setEquipos] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [personas, setPersonas] = useState([]); // Nuevo estado para personas
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  // Obtener equipos
  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/equipo`);
      
      if (!response.ok) throw new Error('Error al cargar equipos');
      
      const result = await response.json();
      setEquipos(result.equipos || []);
    } catch (error) {
      showAlert('Error al cargar equipos: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Obtener tipos de equipo
  const fetchTiposEquipo = async () => {
    try {
      const response = await fetch(`${API_URL}/tipoequipo`);
      
      if (!response.ok) throw new Error('Error al cargar tipos de equipo');
      
      const result = await response.json();
      setTiposEquipo(result.tipoequipos || []);
    } catch (error) {
      showAlert('Error al cargar tipos de equipo: ' + error.message, 'danger');
    }
  };

  // Obtener personas para validación
  const fetchPersonas = async () => {
    try {
      const response = await fetch(`${API_URL}/persona`);
      
      if (!response.ok) throw new Error('Error al cargar personas');
      
      const result = await response.json();
      setPersonas(result.personas || []);
    } catch (error) {
      console.error('Error al cargar personas:', error);
      // No mostramos alerta porque es solo para validación interna
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchTiposEquipo();
    fetchPersonas(); // Cargar personas para validación
  }, []);

  // Crear nuevo equipo
  const handleCreate = async (formData) => {
    try {
      const nuevoEquipo = {
        serial: formData.serial,
        marca: formData.marca,
        accesorios: formData.accesorios || '',
        color: formData.color || '#000000',
        fechaRegistro: formData.fechaRegistro || new Date().toISOString().split('T')[0],
        tipoEquipoId: formData.tipoEquipoId,
        estado: 1
      };

      console.log('Creando equipo:', nuevoEquipo);

      const response = await fetch(`${API_URL}/equipo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEquipo)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Equipo creado exitosamente');
        setShowModal(false);
        fetchEquipos();
      } else {
        throw new Error(result.mensaje || 'Error al crear equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al crear equipo:', error);
    }
  };

  // Actualizar equipo
  const handleUpdate = async (formData) => {
    try {
      const equipoActualizado = {
        marca: formData.marca,
        accesorios: formData.accesorios || '',
        color: formData.color || '#000000',
        fechaRegistro: formData.fechaRegistro,
        tipoEquipoId: formData.tipoEquipoId,
        estado: editingItem.estado
      };

      console.log('Actualizando equipo:', equipoActualizado);

      const response = await fetch(`${API_URL}/equipo/${editingItem.serial}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipoActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Equipo actualizado exitosamente');
        setShowModal(false);
        setEditingItem(null);
        fetchEquipos();
      } else {
        throw new Error(result.mensaje || 'Error al actualizar equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al actualizar equipo:', error);
    }
  };

  // Eliminar equipo con validación de personas asociadas
  const handleDelete = async (item) => {
    try {
      // Verificar si el equipo tiene personas asociadas
      const tienePersonasAsociadas = personas.some(persona => persona.equipo === item.serial);
      
      if (tienePersonasAsociadas) {
        const personasAsociadas = personas.filter(persona => persona.equipo === item.serial);
        showAlert(`No se puede eliminar el equipo porque tiene ${personasAsociadas.length} persona(s) asociada(s)`, 'warning');
        return;
      }

      const response = await fetch(`${API_URL}/equipo/${item.serial}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Equipo eliminado exitosamente');
        fetchEquipos();
      } else {
        throw new Error(result.mensaje || 'Error al eliminar equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Cambiar estado del equipo (activar/desactivar)
  const handleToggleEstado = async (item) => {
    try {
      const nuevoEstado = item.estado === 1 ? 0 : 1;
      
      const equipoActualizado = {
        marca: item.marca,
        accesorios: item.accesorios || '',
        color: item.color || '#000000',
        fechaRegistro: item.fechaRegistro,
        tipoEquipoId: item.tipoEquipoId,
        estado: nuevoEstado
      };

      const response = await fetch(`${API_URL}/equipo/${item.serial}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipoActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`Equipo ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
        fetchEquipos();
      } else {
        throw new Error(result.mensaje || 'Error al cambiar estado del equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (formData) => {
    if (editingItem) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <Container className="mt-4">
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
          {alert.message}
        </Alert>
      )}
      <Layout>
        <AnimatedPage>
        <CrudTable 
          data={equipos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreateNew}
          onToggleEstado={handleToggleEstado}
          loading={loading}
          tiposEquipo={tiposEquipo}
          personas={personas} // Pasar las personas para validación en la tabla
        />

        <CrudModal 
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={editingItem}
          title={editingItem ? "Editar Equipo" : "Nuevo Equipo"}
          tiposEquipo={tiposEquipo}
        />
        </AnimatedPage>
      </Layout>
    </Container>
  );
}