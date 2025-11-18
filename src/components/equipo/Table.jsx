import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Spinner, Badge, Alert } from 'react-bootstrap';
import HeaderBar from '../ui/HeaderBar.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaInfoCircle, FaPowerOff, FaUser } from 'react-icons/fa';

export default function CrudTable({ data, onEdit, onDelete, onCreate, loading, tiposEquipo = [], onToggleEstado, personas = [] }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEstadoConfirm, setShowEstadoConfirm] = useState(false);
  const [itemToToggle, setItemToToggle] = useState(null);
  const [showAlertEliminar, setShowAlertEliminar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Verificar si el equipo tiene personas asociadas
  const tienePersonasAsociadas = (serialEquipo) => {
    return personas.some(persona => persona.equipo === serialEquipo);
  };

  // Obtener personas asociadas a un equipo
  const obtenerPersonasAsociadas = (serialEquipo) => {
    return personas.filter(persona => persona.equipo === serialEquipo);
  };

  const handleDeleteClick = (item) => {
    // Validar si el equipo tiene personas asociadas
    if (tienePersonasAsociadas(item.serial)) {
      const personasAsociadas = obtenerPersonasAsociadas(item.serial);
      setAlertMessage(`No se puede eliminar el equipo porque tiene ${personasAsociadas.length} persona(s) asociada(s)`);
      setShowAlertEliminar(true);
      return;
    }

    setItemToDelete(item);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(itemToDelete);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleToggleEstadoClick = (item) => {
    setItemToToggle(item);
    setShowEstadoConfirm(true);
  };

  const confirmToggleEstado = () => {
    onToggleEstado(itemToToggle);
    setShowEstadoConfirm(false);
  };

  const cancelToggleEstado = () => {
    setShowEstadoConfirm(false);
  };

  const handleShowDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  // Obtener nombre del tipo de equipo
  const getTipoEquipoNombre = (tipoEquipoId) => {
    const tipo = tiposEquipo.find(t => t.id === tipoEquipoId);
    return tipo ? tipo.nombre : 'No especificado';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Badge para indicar si tiene personas asociadas
  const BadgePersonasAsociadas = ({ serial }) => {
    const personasAsociadas = obtenerPersonasAsociadas(serial);
    
    if (personasAsociadas.length === 0) {
      return null;
    }

    return (
      <Badge bg="info" className="ms-1" title={`${personasAsociadas.length} persona(s) asociada(s)`}>
        <FaUser className="me-1" />
        {personasAsociadas.length}
      </Badge>
    );
  };

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => {
      const tipoNombre = getTipoEquipoNombre(item.tipoEquipoId)?.toLowerCase();
      return (
        item.serial?.toLowerCase().includes(term) ||
        item.marca?.toLowerCase().includes(term) ||
        tipoNombre?.includes(term) ||
        (item.estado === 1 ? 'activo' : 'inactivo').includes(term)
      );
    });
  }, [data, searchTerm, tiposEquipo]);

  const clearSearch = () => setSearchTerm('');

  return (
    <Container className="crud-container mt-4">
      <Card className="module-card">
        <HeaderBar
          title="Gestión de Equipos"
          count={filteredData.length}
          right={
            <Button className="modern-btn" onClick={onCreate}>
              <FaPlus className="me-1" /> Nuevo Equipo
            </Button>
          }
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Buscar por serial, marca o tipo de equipo..."
          />
        </HeaderBar>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando equipos...</p>
            </div>
          ) : (
            <>
              {showAlertEliminar && (
                <Alert variant="warning" dismissible onClose={() => setShowAlertEliminar(false)}>
                  <FaExclamationTriangle className="me-2" />
                  {alertMessage}
                </Alert>
              )}
              
              <div className="table-scroll table-sticky">
                <Table striped hover size="sm" className="table-modern table-compact">
                  <thead className="table-light">
                  <tr>
                    <th>Serial</th>
                    <th>Marca</th>
                    <th>Tipo de Equipo</th>
                    <th>Accesorios</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                  </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.serial || index}>
                      <td>
                        <strong>{item.serial}</strong>
                        <BadgePersonasAsociadas serial={item.serial} />
                      </td>
                      <td>{item.marca}</td>
                      <td>{getTipoEquipoNombre(item.tipoEquipoId)}</td>
                      <td>
                        <Badge bg="primary">{item.accesorios || 'Sin accesorios'}</Badge>
                      </td>
                      <td>{formatDate(item.fechaRegistro)}</td>
                      <td>
                        <Badge bg={item.estado === 1 ? "success" : "danger"}>
                          {item.estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <Button 
                            variant="info"
                            size="sm"
                            onClick={() => handleShowDetails(item)}
                            title="Ver detalles"
                          >
                            <FaInfoCircle />
                          </Button>
                          <Button 
                            variant={item.estado === 1 ? "warning" : "success"}
                            size="sm"
                            onClick={() => handleToggleEstadoClick(item)}
                            title={item.estado === 1 ? "Desactivar equipo" : "Activar equipo"}
                            disabled={tienePersonasAsociadas(item.serial) && item.estado === 1}
                          >
                            <FaPowerOff />
                          </Button>
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => onEdit(item)}
                            title="Editar equipo"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            title="Eliminar equipo"
                            disabled={tienePersonasAsociadas(item.serial)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No hay equipos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showConfirm} onHide={cancelDelete} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header className="bg-danger text-light">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el equipo con serial: <strong>{itemToDelete?.serial}</strong>? 
          <br />
          <span className="text-warning">
            <small>Esta acción no se puede deshacer.</small>
          </span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Cambio de Estado */}
      <Modal show={showEstadoConfirm} onHide={cancelToggleEstado} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header className={itemToToggle?.estado === 1 ? "bg-warning" : "bg-success"}>
          <Modal.Title className="text-light">
            <FaPowerOff className="me-2" />
            {itemToToggle?.estado === 1 ? "Desactivar" : "Activar"} Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas {itemToToggle?.estado === 1 ? "desactivar" : "activar"} el equipo: 
          <strong> {itemToToggle?.serial}</strong> - {itemToToggle?.marca}?
          <br />
          {tienePersonasAsociadas(itemToToggle?.serial) && itemToToggle?.estado === 1 && (
            <Alert variant="warning" className="mt-2">
              <FaExclamationTriangle className="me-2" />
              <strong>Advertencia:</strong> Este equipo tiene personas asociadas. 
              Al desactivarlo, no podrá ser asignado a nuevas personas.
            </Alert>
          )}
          <span className="text-info">
            <small>
              {itemToToggle?.estado === 1 
                ? "Al desactivarlo, no podrá ser utilizado en nuevos movimientos." 
                : "Al activarlo, estará disponible para ser utilizado en movimientos."}
            </small>
          </span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelToggleEstado}>
            Cancelar
          </Button>
          <Button 
            variant={itemToToggle?.estado === 1 ? "warning" : "success"} 
            onClick={confirmToggleEstado}
          >
            <FaPowerOff className="me-1" /> 
            {itemToToggle?.estado === 1 ? "Desactivar" : "Activar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaInfoCircle className="me-2" />
            Detalles del Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="row">
              <div className="col-md-6">
                <h6>Información Principal</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Serial:</strong></td>
                      <td>{selectedItem.serial}</td>
                    </tr>
                    <tr>
                      <td><strong>Marca:</strong></td>
                      <td>{selectedItem.marca}</td>
                    </tr>
                    <tr>
                      <td><strong>Tipo de Equipo:</strong></td>
                      <td>{getTipoEquipoNombre(selectedItem.tipoEquipoId)}</td>
                    </tr>
                    <tr>
                      <td><strong>Accesorios:</strong></td>
                      <td>{selectedItem.accesorios || 'No especificado'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <div className="col-md-6">
                <h6>Información Adicional</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Color:</strong></td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            style={{
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: selectedItem.color || '#000000',
                              border: '1px solid #ccc',
                              marginRight: '10px'
                            }}
                          ></div>
                          {selectedItem.color || 'No especificado'}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Fecha Registro:</strong></td>
                      <td>{formatDate(selectedItem.fechaRegistro)}</td>
                    </tr>
                    <tr>
                      <td><strong>Estado:</strong></td>
                      <td>
                        <Badge bg={selectedItem.estado === 1 ? "success" : "danger"}>
                          {selectedItem.estado === 1 ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>

                {/* Sección de Personas Asociadas */}
                {tienePersonasAsociadas(selectedItem.serial) && (
                  <div className="mt-3">
                    <h6>Personas Asociadas</h6>
                    <div className="bg-light p-2 rounded">
                      <small>
                        <strong>Este equipo está asignado a:</strong>
                      </small>
                      <ul className="mb-0 mt-1">
                        {obtenerPersonasAsociadas(selectedItem.serial).map((persona, index) => (
                          <li key={index}>
                            {persona.nombre} {persona.apellido} ({persona.documento})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}