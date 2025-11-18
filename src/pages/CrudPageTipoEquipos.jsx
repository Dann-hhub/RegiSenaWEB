import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import TipoEquipoTable from '../components/equipo/tipoequipo/Table';
import TipoEquipoModal from '../components/equipo/tipoequipo/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function TipoEquipoCrud() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Mostrar alerta
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  // Obtener todos los tipos de equipo
  const fetchTiposEquipo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tipoequipo`);
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const result = await response.json();
      
      if (result.tipoequipos) {
        setData(result.tipoequipos);
      } else {
        showAlert('Error al cargar los datos', 'danger');
      }
    } catch (error) {
      showAlert('Error de conexión con la API: ' + error.message, 'danger');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposEquipo();
  }, []);

  // Generar ID único
  const generateId = () => {
    return 'TE' + Date.now().toString(36).toUpperCase().substr(2, 8);
  };

  // Crear nuevo tipo de equipo - CORREGIDO
  const handleCreate = async (formData) => {
    try {
      const nuevoTipoEquipo = {
        id: generateId(),
        nombre: formData.nombre, // Cambiado: acceder directamente a las propiedades
        estado: formData.estado || 1
      };

      console.log('Enviando datos:', nuevoTipoEquipo); // Para debug

      const response = await fetch(`${API_URL}/tipoequipo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoTipoEquipo)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de equipo creado exitosamente');
        setShowModal(false);
        fetchTiposEquipo();
      } else {
        throw new Error(result.mensaje || 'Error al crear tipo de equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error:', error);
    }
  };

  // Actualizar tipo de equipo - CORREGIDO
  const handleUpdate = async (formData) => {
    try {
      const tipoEquipoActualizado = {
        nombre: formData.nombre, // Cambiado: acceder directamente a las propiedades
        estado: formData.estado || 1
      };

      console.log('Actualizando datos:', tipoEquipoActualizado); // Para debug

      const response = await fetch(`${API_URL}/tipoequipo/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tipoEquipoActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de equipo actualizado exitosamente');
        setShowModal(false);
        setEditingItem(null);
        fetchTiposEquipo();
      } else {
        throw new Error(result.mensaje || 'Error al actualizar tipo de equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error:', error);
    }
  };

  // Eliminar tipo de equipo
  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/tipoequipo/${item.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Tipo de equipo eliminado exitosamente');
        fetchTiposEquipo();
      } else {
        throw new Error(result.mensaje || 'Error al eliminar tipo de equipo');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error:', error);
    }
  };

  // Manejar envío del formulario - CORREGIDO
  const handleSubmit = (formData) => {
    if (editingItem) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // Abrir modal para editar
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Abrir modal para crear
  const handleCreateNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Cerrar modal
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
        <TipoEquipoTable 
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreateNew}
          loading={loading}
        />

        <TipoEquipoModal 
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={editingItem}
          title={editingItem ? "Editar Tipo de Equipo" : "Nuevo Tipo de Equipo"}
        />
        </AnimatedPage>
      </Layout>
    </Container>
  );
}