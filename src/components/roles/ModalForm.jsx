import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';

export default function CrudModal({ show, handleClose, handleSubmit, formData, permisos = [] }) {
  const [localFormData, setLocalFormData] = useState({
    nombre: '',
    estado: 1,
    permisos_ids: []
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Actualizar el estado local cuando cambia formData
  useEffect(() => {
    if (formData) {
      setLocalFormData({
        nombre: formData.nombre || '',
        estado: formData.estado !== undefined ? formData.estado : 1,
        permisos_ids: formData.permisos_ids || []
      });
    } else {
      setLocalFormData({
        nombre: '',
        estado: 1,
        permisos_ids: []
      });
    }
  }, [formData, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({
      ...prev,
      [name]: name === 'estado' ? parseInt(value) : value
    }));
  };

  const handlePermisoChange = (permisoId) => {
    setLocalFormData(prev => ({
      ...prev,
      permisos_ids: prev.permisos_ids.includes(permisoId)
        ? prev.permisos_ids.filter(id => id !== permisoId)
        : [...prev.permisos_ids, permisoId]
    }));
  };

  const selectAllPermisos = () => {
    const allIds = permisos.map(p => p.id);
    setLocalFormData(prev => ({
      ...prev,
      permisos_ids: allIds
    }));
  };

  const clearAllPermisos = () => {
    setLocalFormData(prev => ({
      ...prev,
      permisos_ids: []
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!localFormData.nombre.trim()) {
      setAlertMessage('El nombre del rol es requerido');
      setShowAlert(true);
      return;
    }

    if (localFormData.nombre.trim().length < 2) {
      setAlertMessage('El nombre debe tener al menos 2 caracteres');
      setShowAlert(true);
      return;
    }

    // Pasar los datos al componente padre
    handleSubmit(localFormData);
  };

  const handleCloseModal = () => {
    setShowAlert(false);
    setAlertMessage('');
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {formData?.id ? "Editar Rol" : "Nuevo Rol"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {showAlert && (
            <Alert variant="warning" dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </Alert>
          )}
          
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Rol *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Ej: Administrador, Vigilante, Visitante, etc."
                  value={localFormData.nombre}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className="py-2"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={localFormData.estado}
                  onChange={handleInputChange}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">Permisos (Seleccione uno o más) *</Form.Label>
                  <div>
                    <Button variant="outline-primary" size="sm" onClick={selectAllPermisos} className="me-2">
                      Seleccionar Todos
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={clearAllPermisos}>
                      Limpiar
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <Row>
                    {permisos.map((permiso) => (
                      <Col key={permiso.id} md={6}>
                        <Form.Check
                          type="checkbox"
                          id={`permiso-${permiso.id}`}
                          label={permiso.nombre}
                          checked={localFormData.permisos_ids.includes(permiso.id)}
                          onChange={() => handlePermisoChange(permiso.id)}
                          className="border p-3 rounded mb-2"
                        />
                      </Col>
                    ))}
                  </Row>
                  {permisos.length === 0 && (
                    <div className="text-center text-muted py-3">
                      No hay permisos disponibles
                    </div>
                  )}
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    {localFormData.permisos_ids.length} permiso(s) seleccionado(s)
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={12}>
              <div className="bg-light p-3 rounded">
                <small className="text-muted">
                  <strong>Nota:</strong> Los campos marcados con * son obligatorios.
                </small>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {formData ? "Actualizar" : "Guardar"} Rol
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}