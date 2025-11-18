import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function TipoEquipoModal({ 
  show, 
  handleClose, 
  handleSubmit, 
  formData, 
  title 
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');
  const [formValues, setFormValues] = useState({
    nombre: '',
    estado: 1
  });

  useEffect(() => {
    if (formData) {
      setFormValues({
        nombre: formData.nombre || '',
        estado: formData.estado !== undefined ? formData.estado : 1
      });
    } else {
      setFormValues({
        nombre: '',
        estado: 1
      });
    }
  }, [formData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'estado' ? parseInt(value) : value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!formValues.nombre.trim()) {
      setAlertMessage('El nombre es requerido');
      setAlertType('warning');
      setShowAlert(true);
      return;
    }

    if (formValues.nombre.trim().length < 2) {
      setAlertMessage('El nombre debe tener al menos 2 caracteres');
      setAlertType('warning');
      setShowAlert(true);
      return;
    }

    // Pasar los datos como objeto, no como event
    handleSubmit(formValues);
  };

  const handleCloseModal = () => {
    setShowAlert(false);
    setAlertMessage('');
    handleClose();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleCloseModal} 
      dialogClassName="modal-lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title || "Nuevo Tipo de Equipo"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {showAlert && (
            <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </Alert>
          )}
          
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Tipo de Equipo *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Ej: Portátil, Desktop, Tablet, Impresora, etc."
                  value={formValues.nombre}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
                <Form.Text className="text-muted">
                  Máximo 50 caracteres
                </Form.Text>
              </Form.Group>
            </Col>
            
            {formData && (
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.id}
                    disabled
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Identificador único
                  </Form.Text>
                </Form.Group>
              </Col>
            )}
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={formValues.estado}
                  onChange={handleChange}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {formData ? "Actualizar" : "Guardar"} Tipo de Equipo
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}