import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Badge, Spinner } from 'react-bootstrap';
import HeaderBar from '../ui/HeaderBar.jsx';
import SearchBar from '../ui/SearchBar.jsx';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaInfoCircle, FaPowerOff, FaSearch } from 'react-icons/fa';

export default function CrudTable({ data, onEdit, onDelete, onCreate, onToggleEstado, loading = false, roles = [] }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para obtener el nombre del rol
  const getRolNombre = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : rolId || 'No especificado';
  };

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => 
      item.documento?.toString().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.apellido?.toLowerCase().includes(term) ||
      `${item.nombre} ${item.apellido}`.toLowerCase().includes(term) ||
      item.correo?.toLowerCase().includes(term) ||
      item.tipoDocumento?.toLowerCase().includes(term) ||
      getRolNombre(item.rol)?.toLowerCase().includes(term) ||
      (item.estado === 1 ? 'activo' : 'inactivo').includes(term)
    );
  }, [data, searchTerm, roles, getRolNombre]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(itemToDelete.documento);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getEstadoBadge = (estado) => (
    <Badge bg={estado === 1 ? "success" : "secondary"}>
      {estado === 1 ? "Activo" : "Inactivo"}
    </Badge>
  );

  if (loading) {
    return (
      <Container className="mt-4">
        <Card>
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando usuarios...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="crud-container mt-4">
      <Card className="module-card">
        <HeaderBar
          title="Gestión de Usuarios"
          count={filteredData.length}
          right={
            <Button className="modern-btn" onClick={onCreate}>
              <FaPlus className="me-1" /> Nuevo Usuario
            </Button>
          }
        >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            placeholder="Buscar por documento, nombre, apellido, correo o rol..."
          />
        </HeaderBar>
        
        <Card.Body>
          {searchTerm && (
            <div className="mt-2">
              <small className="text-muted">
                Mostrando {filteredData.length} de {data.length} usuarios
                {filteredData.length === 0 && ' - No se encontraron coincidencias'}
              </small>
            </div>
          )}

          {data.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No hay usuarios registrados. Crea un nuevo usuario para comenzar.
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron usuarios</h5>
              <p className="text-muted">
                No hay usuarios que coincidan con "{searchTerm}"
              </p>
              <Button variant="outline-primary" onClick={clearSearch}>
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div>
              <div className="table-scroll table-sticky">
                <Table striped hover size="sm" className="table-modern table-compact">
                  <thead className="table-light">
                  <tr>
                    <th>Documento</th>
                    <th>Nombre Completo</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                  </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.documento}>
                      <td>
                        <strong>{item.documento}</strong>
                        <br />
                        <small className="text-muted">{item.tipoDocumento}</small>
                      </td>
                      <td>{item.nombre} {item.apellido}</td>
                      <td>{item.correo}</td>
                      <td>
                        <Badge bg="info">
                          {getRolNombre(item.rol)}
                        </Badge>
                      </td>
                      <td>
                        {getEstadoBadge(item.estado)}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <Button 
                            variant="info"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetails(true);
                            }}
                            title="Ver detalles"
                          >
                            <FaInfoCircle />
                          </Button>
                          
                          <Button 
                            variant={item.estado === 1 ? "warning" : "success"}
                            size="sm"
                            onClick={() => onToggleEstado(item)}
                            title={item.estado === 1 ? "Desactivar usuario" : "Activar usuario"}
                          >
                            <FaPowerOff />
                          </Button>
                          
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => onEdit(item)}
                            title="Editar usuario"
                          >
                            <FaEdit />
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            title="Eliminar usuario"
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
                  <Badge bg="primary" className="p-2">
                    Mostrando {filteredData.length} de {data.length} usuarios
                  </Badge>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showConfirm} onHide={cancelDelete} centered contentClassName="modal-modern confirm-modal">
        <Modal.Header className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar al usuario: 
          <strong> {itemToDelete?.nombre} {itemToDelete?.apellido}</strong>?
          <br />
          <span className="text-warning">
            <small>Documento: {itemToDelete?.documento}</small>
          </span>
          <br />
          <span className="text-danger">
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

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalles del Usuario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="row">
              <div className="col-md-6">
                <h5>Información Personal</h5>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Tipo Documento:</strong></td>
                      <td>{selectedItem.tipoDocumento || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Documento:</strong></td>
                      <td>{selectedItem.documento || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Nombre Completo:</strong></td>
                      <td>{selectedItem.nombre} {selectedItem.apellido}</td>
                    </tr>
                    <tr>
                      <td><strong>Correo:</strong></td>
                      <td>{selectedItem.correo || 'N/A'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <div className="col-md-6">
                <h5>Información del Sistema</h5>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Rol:</strong></td>
                      <td>
                        <Badge bg="info">
                          {getRolNombre(selectedItem.rol)}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Estado:</strong></td>
                      <td>{getEstadoBadge(selectedItem.estado)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}