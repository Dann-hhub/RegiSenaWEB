import { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CrudTable from '../components/user/Table';
import CrudModal from '../components/user/ModalForm';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function UsuarioCrud() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  // Obtener usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/usuario`);
      
      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const result = await response.json();
      setUsuarios(result.usuarios || []);
    } catch (error) {
      showAlert('Error al cargar usuarios: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Obtener roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/rol`);
      
      if (!response.ok) throw new Error('Error al cargar roles');
      
      const result = await response.json();
      setRoles(result.roles || []);
    } catch (error) {
      showAlert('Error al cargar roles: ' + error.message, 'danger');
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  // CORREGIDO: Función para verificar documento único
  const verificarDocumentoUnico = async (documento, documentoOriginal = null) => {
    if (documento === documentoOriginal) return true;

    try {
      const response = await fetch(`${API_URL}/usuario/${documento}`);
      const result = await response.json();
      
      // Si la API devuelve un mensaje de "Usuario no encontrado", el documento es único
      if (result.mensaje && result.mensaje.includes('no encontrado')) {
        return true;
      }
      
      // Si encuentra un usuario (result.usuario existe), el documento NO es único
      if (result.usuario) {
        return false;
      }
      
      // Por defecto, asumimos que es único
      return true;
    } catch (error) {
      console.error('Error verificando documento:', error);
      return true; // En caso de error, permitimos continuar
    }
  };

  // CORREGIDO: Función para verificar correo único
  const verificarCorreoUnico = async (correo, correoOriginal = null) => {
    if (correo === correoOriginal) return true;

    try {
      // Verificamos en la lista local de usuarios
      const usuarioExistente = usuarios.find(u => u.correo === correo && u.documento !== correoOriginal);
      return !usuarioExistente;
    } catch (error) {
      console.error('Error verificando correo:', error);
      return true;
    }
  };

  // Crear nuevo usuario - CORREGIDO
  const handleCreate = async (formData) => {
    try {
      // Verificar si el documento ya existe - CORREGIDO
      const documentoUnico = await verificarDocumentoUnico(formData.documento);
      if (!documentoUnico) {
        showAlert('El documento ya existe en el sistema', 'warning');
        return;
      }

      // Verificar si el correo ya existe - CORREGIDO
      const correoUnico = await verificarCorreoUnico(formData.correo);
      if (!correoUnico) {
        showAlert('El correo electrónico ya está registrado', 'warning');
        return;
      }

      const nuevoUsuario = {
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        rol: formData.rol,
        correo: formData.correo,
        contrasena: formData.contrasena,
        estado: 1
      };

      console.log('Creando usuario:', nuevoUsuario);

      const response = await fetch(`${API_URL}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(result.mensaje || 'Usuario creado exitosamente');
        setShowModal(false);
        fetchUsuarios();
      } else {
        throw new Error(result.mensaje || 'Error al crear usuario');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al crear usuario:', error);
    }
  };

  // Actualizar usuario - CORREGIDO
  const handleUpdate = async (formData) => {
    try {
      // Solo verificar correo único en actualización (el documento no puede cambiar)
      const correoUnico = await verificarCorreoUnico(formData.correo, editingItem.documento);
      if (!correoUnico) {
        showAlert('El correo electrónico ya está registrado por otro usuario', 'warning');
        return;
      }

      const usuarioActualizado = {
        tipoDocumento: formData.tipoDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        rol: formData.rol,
        correo: formData.correo,
        contrasena: formData.contrasena || editingItem.contrasena,
        estado: editingItem.estado
      };

      console.log('Actualizando usuario:', usuarioActualizado);

      const response = await fetch(`${API_URL}/usuario/${editingItem.documento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(result.mensaje || 'Usuario actualizado exitosamente');
        setShowModal(false);
        setEditingItem(null);
        fetchUsuarios();
      } else {
        throw new Error(result.mensaje || 'Error al actualizar usuario');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
      console.error('Error al actualizar usuario:', error);
    }
  };

  // Eliminar usuario
  const handleDelete = async (documento) => {
    try {
      const response = await fetch(`${API_URL}/usuario/${documento}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(result.mensaje || 'Usuario eliminado exitosamente');
        fetchUsuarios();
      } else {
        throw new Error(result.mensaje || 'Error al eliminar usuario');
      }
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Cambiar estado del usuario
  const handleToggleEstado = async (usuario) => {
    try {
      const nuevoEstado = usuario.estado === 1 ? 0 : 1;
      
      const usuarioActualizado = {
        tipoDocumento: usuario.tipoDocumento,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        correo: usuario.correo,
        contrasena: usuario.contrasena,
        estado: nuevoEstado
      };

      const response = await fetch(`${API_URL}/usuario/${usuario.documento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioActualizado)
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(`Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`);
        fetchUsuarios();
      } else {
        throw new Error(result.mensaje || 'Error al cambiar estado del usuario');
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
          data={usuarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreateNew}
          onToggleEstado={handleToggleEstado}
          loading={loading}
          roles={roles}
        />

        <CrudModal 
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={editingItem}
          roles={roles}
        />
        </AnimatedPage>
      </Layout>
    </Container>
  );
}