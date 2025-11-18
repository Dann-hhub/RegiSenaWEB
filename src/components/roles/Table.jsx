import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Badge } from 'react-bootstrap';
import HeaderBar from '../ui/HeaderBar.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaInfoCircle, FaPowerOff, FaSearch } from 'react-icons/fa';

export default function CrudTable({ data, onEdit, onDelete, onCreate, onToggleEstado, loading }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEstadoConfirm, setShowEstadoConfirm] = useState(false);
  const [itemToToggle, setItemToToggle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para verificar si es admin
  const isAdmin = (nombre) => {
    return nombre.toLowerCase() === 'administrador';
  };

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => 
      item.nombre?.toLowerCase().includes(term) ||
      item.permisos?.toLowerCase().includes(term) ||
      (item.estado === 1 ? 'activo' : 'inactivo').includes(term) ||
      formatDate(item.fechaCreacion)?.toLowerCase().includes(term) ||
      item.id?.toString().includes(term)
    );
  }, [data, searchTerm, formatDate]);

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

  return (
    <div>
      <Card className="module-card">
        <HeaderBar
          title="Roles"
          count={filteredData.length}
          right={
            <Button className="modern-btn" onClick={onCreate}>
              <FaPlus className="me-1" /> Nuevo Rol
            </Button>
          }
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Buscar por nombre, permisos, estado o fecha..."
          />
        </HeaderBar>
        <Card.Body>
          {searchTerm && (
            <div className="mt-2">
              <small className="text-muted">
                Mostrando {filteredData.length} de {data.length} roles
                {filteredData.length === 0 && ' - No se encontraron coincidencias'}
              </small>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando roles...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No hay roles registrados. Crea un nuevo rol para comenzar.
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron resultados</h5>
              <p className="text-muted">
                No hay roles que coincidan con "{searchTerm}"
              </p>
              <Button variant="outline-success" onClick={clearSearch}>
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div>
              <div className="table-scroll table-sticky">
                <Table striped hover size="sm" className="table-modern table-compact">
                  <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Permisos</th>
                    <th>Fecha Creación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                  </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const admin = isAdmin(item.nombre);
                    return (
                      <tr key={item.id || index}>
                        <td>
                          <strong>{item.nombre}</strong>
                          {admin && (
                            <Badge bg="primary" className="ms-2">Sistema</Badge>
                          )}
                        </td>
                        <td>
                          {item.permisos ? (
                            <Badge bg="info" className="me-1">
                              {item.permisos.split(', ').length} permiso(s)
                            </Badge>
                          ) : (
                            <Badge bg="secondary">Sin permisos</Badge>
                          )}
                        </td>
                        <td>{formatDate(item.fechaCreacion)}</td>
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
                              title={item.estado === 1 ? "Desactivar rol" : "Activar rol"}
                              disabled={admin}
                            >
                              <FaPowerOff />
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm"
                              onClick={() => onEdit(item)}
                              title="Editar rol"
                              disabled={admin}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteClick(item)}
                              title="Eliminar rol"
                              disabled={admin}
                            >
                              <FaTrash />
                            </Button>
                            {admin && (
                              <span className="ms-2 text-muted small">
                                (Acciones bloqueadas)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              </div>
              
              {/* Información de resultados */}
              {searchTerm && filteredData.length > 0 && (
                <div className="mt-3 text-center">
                  <Badge bg="success" className="p-2">
                    Mostrando {filteredData.length} de {data.length} roles
                  </Badge>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showConfirm} onHide={cancelDelete} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header className="bg-danger text-light">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el rol: <strong>"{itemToDelete?.nombre}"</strong>? 
          <br />
          <span className="text-warning">
            <small>
              Esta acción no se puede deshacer. No se podrá eliminar si el rol está asignado a usuarios.
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

      <Modal show={showEstadoConfirm} onHide={cancelToggleEstado} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header className={itemToToggle?.estado === 1 ? "bg-warning" : "bg-success"}>
          <Modal.Title className="text-light">
            <FaPowerOff className="me-2" />
            {itemToToggle?.estado === 1 ? "Desactivar" : "Activar"} Rol
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas {itemToToggle?.estado === 1 ? "desactivar" : "activar"} el rol: 
          <strong> "{itemToToggle?.nombre}"</strong>?
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

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="row">
              <div className="col-md-6">
                <h6>Información del Rol</h6>
                <Table bordered size="sm">
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
                    <tr>
                      <td><strong>Fecha Creación:</strong></td>
                      <td>{formatDate(selectedItem.fechaCreacion)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <div className="col-md-6">
                <h6>Permisos Asignados</h6>
                {selectedItem.permisos ? (
                  <div>
                    <Badge bg="info" className="mb-2">
                      {selectedItem.permisos.split(', ').length} permiso(s) asignado(s)
                    </Badge>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <ul className="list-unstyled">
                        {selectedItem.permisos.split(', ').map((permiso, index) => (
                          <li key={index} className="mb-1">
                            <FaInfoCircle className="text-success me-2" />
                            {permiso}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Badge bg="secondary">Sin permisos asignados</Badge>
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
    </div>
  );
}