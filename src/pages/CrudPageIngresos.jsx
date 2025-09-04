import { useState } from 'react';
import CrudTable from '../components/movimientos/Table';
import CrudModal from '../components/movimientos/ModalForm';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  // Estados principales
  const [data, setData] = useState([]);
  const [modalState, setModalState] = useState({
    show: false,
    mode: 'create', // 'create', 'edit', 'registerExit'
    currentItem: null
  });

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setModalState({
      show: false,
      mode: 'create',
      currentItem: null
    });
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newItem = {
      id: modalState.currentItem?.id || Date.now(),
      // Datos de ingreso
      documento: formData.get('documento'),
      serial: formData.get('serial'),
      centroformacion: formData.get('centroformacion'),
      vigilante: formData.get('vigilante'),
      observaciones: formData.get('observaciones'),
      ingreso: formData.get('ingreso'),
      dia_ingreso: formData.get('dia_ingreso'),
      hora_ingreso: formData.get('hora_ingreso'),
      // Datos de salida
      salida: formData.get('salida'),
      dia_salida: formData.get('dia_salida'),
      hora_salida: formData.get('hora_salida'),
      // Estado
      estado: modalState.currentItem?.estado || false
    };

    setData(prevData => 
      modalState.currentItem
        ? prevData.map(item => item.id === modalState.currentItem.id ? newItem : item)
        : [...prevData, newItem]
    );

    handleCloseModal();
  };

  // Manejar eliminación
  const handleDelete = (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
  };

  // Manejar creación de nuevo registro
  const handleCreate = () => {
    setModalState({
      show: true,
      mode: 'create',
      currentItem: null
    });
  };

  // Manejar edición de registro
  const handleEdit = (item) => {
    setModalState({
      show: true,
      mode: 'edit',
      currentItem: item
    });
  };

  // Manejar registro de salida
  const handleRegisterExit = (item) => {
    setModalState({
      show: true,
      mode: 'registerExit',
      currentItem: item
    });
  };

  return (
    <Layout>
      <div className="crud-container">
        <CrudTable
          data={data}
          onEdit={handleEdit}
          onRegisterExit={handleRegisterExit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
        
        <CrudModal
          show={modalState.show}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          formData={modalState.currentItem}
          isEdit={modalState.mode === 'edit'}
          isEditingExit={modalState.mode === 'registerExit'}
        />
      </div>
    </Layout>
  );
}