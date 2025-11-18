import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CrudTable from '../components/roles/Table';
import CrudModal from '../components/roles/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function CrudPage() {
  const [data, setData] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  // Obtener roles desde la API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/roles-completos`);
      
      if (!response.ok) throw new Error('Error al cargar roles');
      
      const result = await response.json();
      setData(result.roles || []);
    } catch (error) {
      showAlert('Error al cargar roles: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Obtener permisos desde la API
  const fetchPermisos = async () => {
    try {
      const response = await fetch(`${API_URL}/permisos`);
      
      if (!response.ok) throw new Error('Error al cargar permisos');
      
      const result = await response.json();
      setPermisos(result.permisos || []);
    } catch (error) {
      showAlert('Error al cargar permisos: ' + error.message, 'danger');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  // Generar ID único
  const generateId = () => {
    return 'R' + Date.now().toString(36).toUpperCase().substr(2, 8);
  };

  // Crear nuevo rol
  const handleCreate = async (formData) => {
    try {
      const nuevoRol = {
        id: generateId(),
        nombre: formData.nombre,
        estado: formData.estado || 1,
        fechaCreacion: new Date().toISOString(),
        permisos_ids: formData.permisos_ids || []
      };

      const response = await fetch(`${API_URL}/rol-completo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRol)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Rol creado exitosamente');
        setShowModal(false);
        fetchRoles();
      } else {
        throw new Error(result.mensaje || 'Error al crear rol');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Actualizar rol
  const handleUpdate = async (formData) => {
    try {
      const rolActualizado = {
        nombre: formData.nombre,
        estado: formData.estado || 1,
        permisos_ids: formData.permisos_ids || []
      };

      const response = await fetch(`${API_URL}/rol-completo/${currentItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Rol actualizado exitosamente');
        setShowModal(false);
        setCurrentItem(null);
        fetchRoles();
      } else {
        throw new Error(result.mensaje || 'Error al actualizar rol');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Eliminar rol
  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/rol-completo/${item.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('Rol eliminado exitosamente');
        fetchRoles();
      } else {
        throw new Error(result.mensaje || 'Error al eliminar rol');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Cambiar estado del rol
  const handleToggleEstado = async (item) => {
    try {
      const nuevoEstado = item.estado === 1 ? 0 : 1;
      const rolActualizado = {
        nombre: item.nombre,
        estado: nuevoEstado,
        permisos_ids: item.permisos_ids || []
      };

      const response = await fetch(`${API_URL}/rol-completo/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`Rol ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
        fetchRoles();
      } else {
        throw new Error(result.mensaje || 'Error al cambiar estado');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (formData) => {
    if (currentItem) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  return (
    <>
      <Layout>
        <AnimatedPage>
        <Container fluid>
          {alert.show && (
            <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
              {alert.message}
            </Alert>
          )}
          
          <div>
            <CrudTable
              data={data}
              onEdit={(item) => {
                setCurrentItem(item);
                setShowModal(true);
              }}
              onDelete={handleDelete}
              onCreate={() => {
                setCurrentItem(null);
                setShowModal(true);
              }}
              onToggleEstado={handleToggleEstado}
              loading={loading}
            />
            
            <CrudModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              handleSubmit={handleSubmit}
              formData={currentItem}
              permisos={permisos}
            />
          </div>
        </Container>
        </AnimatedPage>
      </Layout>
    </>
  );
}