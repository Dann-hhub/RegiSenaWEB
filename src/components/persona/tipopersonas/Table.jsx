import { useState, useMemo } from 'react';
import { Table, Button, Container, Card, Modal, Badge, Spinner, Form, InputGroup } from 'react-bootstrap';
import HeaderBar from '../../ui/HeaderBar.jsx';
import SearchBar from '../../ui/SearchBar.jsx';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaInfoCircle, FaPowerOff, FaSearch } from 'react-icons/fa';

export default function CrudTable({ 
  data, 
  onEdit, 
  onDelete, 
  onCreate, 
  onToggleEstado,
  loading = false 
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => 
      item.nombre?.toLowerCase().includes(term) ||
      item.id?.toString().includes(term) ||
      (item.estado === 1 ? 'activo' : 'inactivo').includes(term) ||
      item.descripcion?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(itemToDelete.id);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const getEstadoBadge = (estado) => (
    <Badge bg={estado === 1 ? "success" : "secondary"}>
      {estado === 1 ? "Activo" : "Inactivo"}
    </Badge>
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <Container className="crud-container mt-4">
        <Card className="module-card">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando tipos de persona...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="crud-container mt-4">
      <Card className="module-card">
        <HeaderBar
          title="Gestión de Tipos de Persona"
          count={filteredData.length}
          right={
            <Button className="modern-btn" onClick={onCreate}>
              <FaPlus className="me-1" /> Nuevo Tipo
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

          {data.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No hay tipos de persona registrados. Crea uno nuevo para comenzar.
            </div>
          ) : filteredData.length === 0 && searchTerm ? (
            <div className="text-center py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No se encontraron resultados</h5>
              <p className="text-muted">
                No hay tipos de persona que coincidan con "{searchTerm}"
              </p>
              <Button variant="outline-primary" onClick={clearSearch}>
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
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Badge bg="info">{item.id}</Badge>
                      </td>
                      <td>
                        <strong>{item.nombre}</strong>
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
                            title={item.estado === 1 ? "Desactivar" : "Activar"}
                          >
                            <FaPowerOff />
                          </Button>
                          
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => onEdit(item)}
                            title="Editar"
                          >
                            <FaEdit />
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            title="Eliminar"
                            disabled={item.estado === 1} // No permitir eliminar activos
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
                  <Badge bg="info" className="p-2">
                    Mostrando {filteredData.length} de {data.length} tipos de persona
                  </Badge>
                </div>
              )}
            </>
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
          ¿Estás seguro que deseas eliminar el tipo de persona: 
          <strong> {itemToDelete?.nombre}</strong>?
          <br />
          <span className="text-warning">
            <small>
              {itemToDelete?.estado === 1 
                ? "No se puede eliminar un tipo de persona activo. Debe desactivarlo primero." 
                : "Esta acción no se puede deshacer."}
            </small>
          </span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={itemToDelete?.estado === 1}
          >
            <FaTrash className="me-1" /> Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} contentClassName="modal-modern details-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalles del Tipo de Persona
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Table borderless>
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
                  <td>{getEstadoBadge(selectedItem.estado)}</td>
                </tr>
                <tr>
                  <td><strong>Descripción:</strong></td>
                  <td>
                    {selectedItem.descripcion || 
                     'Tipo de persona del sistema de gestión de equipos.'}
                  </td>
                </tr>
              </tbody>
            </Table>
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