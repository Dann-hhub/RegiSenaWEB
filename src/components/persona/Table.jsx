import { useState } from 'react';
import { 
  Table, Button, Container, Card, Modal, 
  ListGroup, Badge, Row, Col, Alert 
} from 'react-bootstrap';
import { 
  FaEdit, FaTrash, FaPlus, FaExclamationTriangle, 
  FaInfoCircle, FaLaptop, FaTabletAlt, FaDesktop 
} from 'react-icons/fa';

export default function CrudTable({ 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  onCreate 
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(itemToDelete);
    setShowConfirm(false);
  };

  const getEstadoBadge = (estado) => (
    <Badge bg={estado ? "success" : "secondary"}>
      {estado ? "Activo" : "Inactivo"}
    </Badge>
  );

  const getTipoEquipoIcon = (tipo) => {
    switch(tipo) {
      case 'Portátil': return <FaLaptop className="me-2" />;
      case 'Tablet': return <FaTabletAlt className="me-2" />;
      case 'Pantallas': return <FaDesktop className="me-2" />;
      default: return <FaInfoCircle className="me-2" />;
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
          <h2 className="mb-0">Gestión de Personas y Equipos</h2>
          <Button variant="light" onClick={onCreate}>
            <FaPlus className="me-1" /> Nueva Persona
          </Button>
        </Card.Header>
        
        <Card.Body>
          {data.length === 0 ? (
            <Alert variant="info">
              No hay personas registradas. Crea una nueva persona para comenzar.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Documento</th>
                  <th>Nombre Completo</th>
                  <th>Tipo Persona</th>
                  <th>Equipos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((persona) => (
                  <tr key={persona.id}>
                    <td>{persona.documento}</td>
                    <td>{`${persona.nombre} ${persona.apellido}`}</td>
                    <td>
                      <Badge bg="info">
                        {persona.tipoPersona}
                      </Badge>
                    </td>
                    <td>
                      {persona.equipos?.length > 0 ? (
                        <Badge bg="secondary" pill>
                          {persona.equipos.length} equipo(s)
                        </Badge>
                      ) : (
                        <Badge bg="warning" text="dark" pill>
                          Sin equipos
                        </Badge>
                      )}
                    </td>
                    <td>{getEstadoBadge(persona.estado)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => {
                            setSelectedItem(persona);
                            setShowDetails(true);
                          }}
                          title="Ver detalles"
                        >
                          <FaInfoCircle />
                        </Button>
                        <Button 
                          variant="warning" 
                          size="sm"
                          onClick={() => onEdit(persona)}
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteClick(persona.id)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar esta persona y todos sus equipos asociados?
          Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Confirmar Eliminación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalles de {selectedItem?.nombre} {selectedItem?.apellido}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Información Personal</h5>
                  <Table borderless>
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
                        <td>{`${selectedItem.nombre} ${selectedItem.apellido}`}</td>
                      </tr>
                      <tr>
                        <td><strong>Correo:</strong></td>
                        <td>{selectedItem.correo || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Información Adicional</h5>
                  <Table borderless>
                    <tbody>
                      <tr>
                        <td><strong>Tipo Persona:</strong></td>
                        <td>
                          <Badge bg="info">
                            {selectedItem.tipoPersona || 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Celular:</strong></td>
                        <td>{selectedItem.celular || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Estado:</strong></td>
                        <td>{getEstadoBadge(selectedItem.estado)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <h5 className="mt-4">
                Equipos Asociados ({selectedItem.equipos?.length || 0})
              </h5>
              
              {selectedItem.equipos && selectedItem.equipos.length > 0 ? (
                <div className="equipos-grid">
                  {selectedItem.equipos.map((equipo, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>
                          {getTipoEquipoIcon(equipo.tipoEquipo)}
                          <strong>{equipo.tipoEquipo || 'Equipo'}</strong>
                        </span>
                        <Badge bg="primary">
                          {equipo.marca}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Serial:</strong> {equipo.serial}</p>
                            <p><strong>Color:</strong> {equipo.color}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Fecha Registro:</strong> {equipo.fechaRegistro}</p>
                            <p><strong>Hora Registro:</strong> {equipo.horaRegistro}</p>
                          </Col>
                        </Row>
                        {equipo.accesorios && (
                          <p className="mt-2">
                            <strong>Accesorios:</strong> {equipo.accesorios}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  Esta persona no tiene equipos registrados.
                </Alert>
              )}
            </>
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