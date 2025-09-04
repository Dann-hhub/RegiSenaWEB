import { useState } from 'react';
import { Table, Button, Container, Card, Modal } from 'react-bootstrap';
import { FaFilePdf, FaTrash, FaPlus, FaExclamationTriangle, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';

export default function CrudTable({ data, onEdit, onDelete, onCreate, onRegisterExit }) {
  // Estados para modales y selección
  const [modalState, setModalState] = useState({
    showConfirm: false,
    showDetails: false,
    selectedItem: null,
    itemToDelete: null
  });

  // Estado individual para cada item
  const [itemsEstado, setItemsEstado] = useState(
    data.reduce((acc, item) => ({ ...acc, [item.id]: item.estado || false }), {}
  ));

  // Manejadores de acciones
  const actions = {
    showDeleteConfirmation: (item) => {
      setModalState(prev => ({
        ...prev,
        showConfirm: true,
        itemToDelete: item.id
      }));
    },
    
    confirmDelete: () => {
      onDelete(modalState.itemToDelete);
      setModalState(prev => ({ ...prev, showConfirm: false }));
    },
    
    cancelDelete: () => {
      setModalState(prev => ({ ...prev, showConfirm: false }));
    },
    
    toggleEstado: (item) => {
      setItemsEstado(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    },
    
    showDetails: (item) => {
      setModalState(prev => ({
        ...prev,
        showDetails: true,
        selectedItem: item
      }));
    },
    
    closeDetails: () => {
      setModalState(prev => ({ ...prev, showDetails: false }));
    },
    
    registerExit: () => {
      onRegisterExit(modalState.selectedItem);
      setModalState(prev => ({ ...prev, showDetails: false }));
    }
  };

  // Helper para verificar datos de salida
  const hasExitData = (item) => {
    return item?.salida && item?.dia_salida && item?.hora_salida;
  };

  // Estilos reutilizables
  const styles = {
    actionButton: {
      marginRight: '0.5rem',
      minWidth: '100px'
    },
    statusButton: (active) => ({
      backgroundColor: active ? '#28a745' : '#dc3545',
      borderColor: active ? '#28a745' : '#dc3545'
    }),
    pendingText: {
      color: '#dc3545',
      fontWeight: 'bold'
    }
  };

  return (
    <Container className="mt-4">
      {/* Tarjeta principal con tabla */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
          <h2 className="mb-0">Gestión de Movimientos</h2>
          <Button variant="light" onClick={onCreate}>
            <FaPlus className="me-1" /> Nuevo Ingreso
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>Documento</th>
                <th>Serial</th>
                <th>Tipo Ingreso</th>
                <th>Hora Ingreso</th>
                <th>Hora Salida</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.documento}</td>
                  <td>{item.serial}</td>
                  <td>{item.ingreso || 'Ocasional'}</td>
                  <td>{item.hora_ingreso}</td>
                  <td>{item.hora_salida}</td>
                  
                  <td>
                    <Button 
                      variant={itemsEstado[item.id] ? "success" : "danger"}
                      size="sm"
                      onClick={() => actions.toggleEstado(item)}
                      style={styles.statusButton(itemsEstado[item.id])}
                    >
                      {itemsEstado[item.id] ? "Activo" : "Inactivo"}
                    </Button>
                  </td>
                  
                  <td className="text-nowrap">
                    <Button 
                      variant="info"
                      size="sm"
                      style={styles.actionButton}
                      onClick={() => actions.showDetails(item)}
                    >
                      <FaInfoCircle className="me-1" /> Detalles
                    </Button>
                    
                    <Button 
                      variant="warning" 
                      size="sm"
                      style={styles.actionButton}
                    >
                      <FaFilePdf className="me-1" /> PDF
                    </Button>
                    
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => actions.showDeleteConfirmation(item)}
                    >
                      <FaTrash className="me-1" /> Anular
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal show={modalState.showConfirm} onHide={actions.cancelDelete} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Anulación
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <p>¿Estás seguro que deseas anular este movimiento?</p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={actions.cancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={actions.confirmDelete}>
            <FaTrash className="me-1" /> Confirmar Anulación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de detalles */}
      <Modal show={modalState.showDetails} onHide={actions.closeDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalState.selectedItem && hasExitData(modalState.selectedItem)
              ? "Detalles Completos del Movimiento"
              : "Detalles del Ingreso"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {modalState.selectedItem && (
            <div className="movement-details">
              {/* Sección de Ingreso */}
              <section className="mb-4">
                <h5 className="border-bottom pb-2">Información de Ingreso</h5>
                <Table borderless>
                  <tbody>
                    {[
                      { label: 'Documento', value: modalState.selectedItem.documento },
                      { label: 'Serial', value: modalState.selectedItem.serial },
                      { label: 'Centro de formación', value: modalState.selectedItem.centroformacion },
                      { label: 'Vigilante', value: modalState.selectedItem.vigilante },
                      { label: 'Observaciones', value: modalState.selectedItem.observaciones },
                      { label: 'Tipo de Ingreso', value: modalState.selectedItem.ingreso || 'Ocasional' },
                      { label: 'Fecha de Ingreso', value: modalState.selectedItem.dia_ingreso },
                      { label: 'Hora de Ingreso', value: modalState.selectedItem.hora_ingreso }
                    ].map((field, index) => (
                      <tr key={index}>
                        <td width="30%" className="font-weight-bold">{field.label}:</td>
                        <td>{field.value || 'No especificado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>

              {/* Sección de Salida */}
              <section>
                <h5 className="border-bottom pb-2">Información de Salida</h5>
                <Table borderless>
                  <tbody>
                    {[
                      { label: 'Motivo de Salida', value: modalState.selectedItem.salida, required: true },
                      { label: 'Fecha de Salida', value: modalState.selectedItem.dia_salida, required: true },
                      { label: 'Hora de Salida', value: modalState.selectedItem.hora_salida, required: true }
                    ].map((field, index) => (
                      <tr key={index}>
                        <td width="30%" className="font-weight-bold">{field.label}:</td>
                        <td style={!field.value && field.required ? styles.pendingText : {}}>
                          {field.value || (field.required ? 'Pendiente de registro' : 'No especificado')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          {modalState.selectedItem && !hasExitData(modalState.selectedItem) && (
            <Button 
              variant="primary" 
              onClick={actions.registerExit}
              className="me-auto"
            >
              <FaSignOutAlt className="me-1" /> Registrar Salida
            </Button>
          )}
          
          <Button variant="secondary" onClick={actions.closeDetails}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}