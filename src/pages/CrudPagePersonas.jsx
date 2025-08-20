import { useState } from 'react';
import CrudTable from '../components/persona/Table';
import CrudModal from '../components/persona/ModalForm';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const handleSubmit = (formData) => {
    const newItem = {
      id: currentItem?.id || Date.now(),
      documento: formData.documento,
      tipoDocumento: formData.tipoDocumento,
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      tipoPersona: formData.tipoPersona,
      celular: formData.celular,
      equipos: formData.equipos || []
    };

    setData(currentItem
      ? data.map(item => item.id === currentItem.id ? newItem : item)
      : [...data, newItem]
    );
    setShowModal(false);
    setCurrentItem(null);
  };

  const handleCreate = () => {
    setCurrentItem(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleView = (item) => {
    setCurrentItem(item);
    setIsViewMode(true);
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
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onCreate={handleCreate}
        />
        
        <CrudModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setCurrentItem(null);
          }}
          handleSubmit={handleSubmit}
          formData={currentItem}
          isViewMode={isViewMode}
        />
      </div>
    </Layout>
  );
}