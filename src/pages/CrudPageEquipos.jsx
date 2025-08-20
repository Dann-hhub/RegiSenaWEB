import { useState } from 'react';
import CrudTable from '../components/equipo/Table';
import CrudModal from '../components/equipo/ModalForm';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  // Datos iniciales de ejemplo (pueden venir de una API)
  const initialData = [
    {
      id: currentItem?.id || Date.now(),
      tipoDocumento: formData?.tipoDocumento,
      documento: formData?.documento,
      nombre: formData?.nombre,
      apellido: formData?.apellido,
      correo: formData?.correo,
      tipoPersona: formData?.tipoPersona,
      celular: formData?.celular,
      equipos: [
        {
          id: currentItem?.id || Date.now(),
          tipoEquipo: formData?.tipoEquipo,
          marca: formData?.marca,
          serial: formData?.serial,
          accesorios: formData?.accesorios,
          fechaRegistro: formData?.fechaRegistro,
          horaRegistro: formData?.horaRegistro,
          color: formData?.color,
        }
      ]
    }
  ];

  const [data, setData] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const handleSubmit = (formData) => {
    if (currentItem) {
      // Editar elemento existente
      setData(data.map(item => 
        item.id === currentItem.id ? formData : item
      ));
    } else {
      // Crear nuevo elemento
      setData([...data, {
        ...formData,
        id: Date.now()
      }]);
    }
    setShowModal(false);
  };

  const handleView = (item) => {
    setCurrentItem(item);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentItem(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <Layout>
      <div className="crud-container">
        <CrudTable
          data={data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
        
        <CrudModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleSubmit={handleSubmit}
          formData={currentItem}
          isViewMode={isViewMode}
        />
      </div>
    </Layout>
  );
}