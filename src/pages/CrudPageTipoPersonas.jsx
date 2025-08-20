import { useState } from 'react';
import CrudTable from '../components/persona/tipopersonas/Table';
import CrudModal from '../components/persona/tipopersonas/ModalForm';
import Layout from '../components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CrudPage() {
  const [data, setData] = useState([
  ]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      nombre: formData.get('nombre')
    };

    setData(currentItem
      ? data.map(item => item.id === currentItem.id ? newItem : item)
      : [...data, newItem]
    );
    setShowModal(false);
  };

  return (
    <>
      <Layout>
      <div className="crud-container">
      <CrudTable
        data={data}
        onEdit={(item) => {
          setCurrentItem(item);
          setShowModal(true);
        }}
        onDelete={(index) => setData(data.filter((_, i) => i !== index))}
        onCreate={() => {
          setCurrentItem(null);
          setShowModal(true);
        }}
      />
      
      <CrudModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleSubmit}
        formData={currentItem}
      />
      </div>
      </Layout>
    </>
  );
}