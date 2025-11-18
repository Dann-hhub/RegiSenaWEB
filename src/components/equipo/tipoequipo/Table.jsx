import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Spinner, Badge, Form, InputGroup } from 'react-bootstrap';
import HeaderBar from '../../ui/HeaderBar.jsx';
import SearchBar from '../../ui/SearchBar.jsx';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaInfoCircle, FaPowerOff, FaSearch } from 'react-icons/fa';

export default function TipoEquipoTable({ 
  data, 
  onEdit, 
  onDelete, 
  onCreate, 
  loading,
  onToggleEstado // Nueva prop para cambiar estado
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEstadoConfirm, setShowEstadoConfirm] = useState(false);
  const [itemToToggle, setItemToToggle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => 
      item.nombre?.toLowerCase().includes(term) ||
      item.id?.toString().includes(term) ||
      (item.estado === 1 ? 'activo' : 'inactivo').includes(term) ||
      (item.descripcion?.toLowerCase().includes(term)) ||
      (item.fechaCreacion && formatDate(item.fechaCreacion)?.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const handleDeleteClick = (item) => {
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Formatear fecha si existe
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Container className="crud-container mt-4">
      <Card className="module-card">
        <HeaderBar
          title="Tipos de Equipo"
          count={filteredData.length}
          right={
            <Button className="modern-btn" onClick={onCreate}>
              <FaPlus className="me-1" /> Nuevo Tipo de Equipo
            </Button>
          }
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Buscar por nombre o ID..."
          />
        </HeaderBar>
        <Card.Body>
          {searchTerm && (
            <div className="mt-2">
              <small className="text-muted">
                Mostrando {filteredData.length} de {data.length} resultados
                {filteredData.length === 0 && ' - No se encontraron coincidencias'}
              </small>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando tipos de equipo...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No hay tipos de equipo registrados. Crea uno nuevo para comenzar.
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron resultados</h5>
              <p className="text-muted">
                No hay tipos de equipo que coincidan con "{searchTerm}"
              </p>
              <Button variant="outline-success" onClick={clearSearch}>
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <>
              <div className="table-scroll table-sticky">
                <Table striped hover size="sm" className="table-modern table-compact">
                  <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                  </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        <strong>{item.id}</strong>
                      </td>
                      <td>{item.nombre}</td>
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
                            title={item.estado === 1 ? "Desactivar" : "Activar"}
                          >
                            <FaPowerOff />
                          </Button>
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => onEdit(item)}
                            title="Editar tipo de equipo"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            title="Eliminar tipo de equipo"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </Table>
              </div>
              
              {/* Información de resultados */}
              {searchTerm && filteredData.length > 0 && (
                <div className="mt-3 text-center">
                  <Badge bg="success" className="p-2">
                    Mostrando {filteredData.length} de {data.length} tipos de equipo
                  </Badge>
                </div>
              )}
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
          ¿Estás seguro que deseas eliminar el tipo de equipo: <strong>"{itemToDelete?.nombre}"</strong>? 
          <br />
          <span className="text-warning">
            <small>
              Nota: Esta acción no se puede deshacer y podría afectar a los equipos asociados.
            </small>
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
            {itemToToggle?.estado === 1 ? "Desactivar" : "Activar"} Tipo de Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas {itemToToggle?.estado === 1 ? "desactivar" : "activar"} el tipo de equipo: 
          <strong> "{itemToToggle?.nombre}"</strong>?
          <br />
          <span className="text-info">
            <small>
              {itemToToggle?.estado === 1 
                ? "Al desactivarlo, no podrá ser seleccionado en nuevos equipos." 
                : "Al activarlo, estará disponible para ser seleccionado en nuevos equipos."}
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
      <Modal show={showDetails} onHide={() => setShowDetails(false)} contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaInfoCircle className="me-2" />
            Detalles del Tipo de Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Table bordered>
              <tbody>
                <tr>
                  <td><strong>ID:</strong></td>
                  <td>{selectedItem.id}</td>
                </tr>
                <tr>
                  <td><strong>Nombre:</strong></td>
                  <td>{selectedItem.nombre}</td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <Badge bg={selectedItem.estado === 1 ? "success" : "danger"}>
                      {selectedItem.estado === 1 ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                </tr>
                {selectedItem.fechaCreacion && (
                  <tr>
                    <td><strong>Fecha de Creación:</strong></td>
                    <td>{formatDate(selectedItem.fechaCreacion)}</td>
                  </tr>
                )}
                {selectedItem.descripcion && (
                  <tr>
                    <td><strong>Descripción:</strong></td>
                    <td>{selectedItem.descripcion}</td>
                  </tr>
                )}
              </tbody>
            </Table>
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