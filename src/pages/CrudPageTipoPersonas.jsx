import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CrudTable from '../components/persona/tipopersonas/Table';
import CrudModal from '../components/persona/tipopersonas/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function TipoPersonaCrud() {
  const [tiposPersona, setTiposPersona] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  // Obtener tipos de persona
  const fetchTiposPersona = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tipopersona`);
      
      if (!response.ok) throw new Error('Error al cargar tipos de persona');
      
      const result = await response.json();
      setTiposPersona(result.tipopersonas || []);
    } catch (error) {
      showAlert('Error al cargar tipos de persona: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposPersona();
  }, []);

  // Crear nuevo tipo de persona
  const handleCreate = async (formData) => {
    try {
      // Generar ID único (puedes ajustar según tu API)
      const nuevoId = `TP${Date.now()}`;
      
      const nuevoTipoPersona = {
        id: nuevoId,
        nombre: formData.nombre,
        estado: 1 // Activo por defecto
      };

      console.log('Creando tipo de persona:', nuevoTipoPersona);

      const response = await fetch(`${API_URL}/tipopersona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTipoPersona)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de persona creado exitosamente');
        setShowModal(false);
        fetchTiposPersona(); // Recargar datos
      } else {
        throw new Error(result.mensaje || 'Error al crear tipo de persona');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al crear tipo de persona:', error);
    }
  };

  // Actualizar tipo de persona
  const handleUpdate = async (formData) => {
    try {
      const tipoPersonaActualizado = {
        nombre: formData.nombre,
        estado: editingItem.estado // Mantener el estado actual
      };

      console.log('Actualizando tipo de persona:', tipoPersonaActualizado);

      const response = await fetch(`${API_URL}/tipopersona/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipoPersonaActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de persona actualizado exitosamente');
        setShowModal(false);
        setEditingItem(null);
        fetchTiposPersona(); // Recargar datos
      } else {
        throw new Error(result.mensaje || 'Error al actualizar tipo de persona');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al actualizar tipo de persona:', error);
    }
  };

  // Eliminar tipo de persona
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tipopersona/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de persona eliminado exitosamente');
        fetchTiposPersona(); // Recargar datos
      } else {
        throw new Error(result.mensaje || 'Error al eliminar tipo de persona');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Cambiar estado (Activo/Inactivo)
  const handleToggleEstado = async (item) => {
    try {
      const nuevoEstado = item.estado === 1 ? 0 : 1;
      
      const tipoPersonaActualizado = {
        nombre: item.nombre,
        estado: nuevoEstado
      };

      const response = await fetch(`${API_URL}/tipopersona/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tipoPersonaActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`Tipo de persona ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
        fetchTiposPersona(); // Recargar datos
      } else {
        throw new Error(result.mensaje || 'Error al cambiar estado');
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
          data={tiposPersona}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreateNew}
          onToggleEstado={handleToggleEstado}
          loading={loading}
        />

        <CrudModal 
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={editingItem}
        />
        </AnimatedPage>
      </Layout>
    </Container>
  );
}