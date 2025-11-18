import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function CrudModal({ 
  show, 
  handleClose, 
  handleSubmit, 
  formData, 
  title,
  tiposEquipo = []
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');
  const [formValues, setFormValues] = useState({
    serial: '',
    marca: '',
    tipoEquipoId: '',
    accesorios: '',
    color: '#000000',
    fechaRegistro: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (formData) {
      setFormValues({
        serial: formData.serial || '',
        marca: formData.marca || '',
        tipoEquipoId: formData.tipoEquipoId || '',
        accesorios: formData.accesorios || '',
        color: formData.color || '#000000',
        fechaRegistro: formData.fechaRegistro ? 
          new Date(formData.fechaRegistro).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      });
    } else {
      setFormValues({
        serial: '',
        marca: '',
        tipoEquipoId: '',
        accesorios: '',
        color: '#000000',
        fechaRegistro: new Date().toISOString().split('T')[0]
      });
    }
  }, [formData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!formValues.serial.trim() || !formValues.marca.trim() || !formValues.tipoEquipoId) {
      setAlertMessage('Todos los campos marcados con * son obligatorios');
      setAlertType('warning');
      setShowAlert(true);
      return;
    }

    if (formValues.serial.trim().length < 2) {
      setAlertMessage('El serial debe tener al menos 2 caracteres');
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
    <Modal show={show} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title || "Nuevo Equipo"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          {showAlert && (
            <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Serial del Equipo *</Form.Label>
                <Form.Control
                  type="text"
                  name="serial"
                  placeholder="Ingrese el serial del equipo"
                  value={formValues.serial}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Marca *</Form.Label>
                <Form.Control
                  type="text"
                  name="marca"
                  placeholder="Ej: Dell, HP, Lenovo, etc."
                  value={formValues.marca}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Equipo *</Form.Label>
                <Form.Select
                  name="tipoEquipoId"
                  value={formValues.tipoEquipoId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un tipo de equipo...</option>
                  {tiposEquipo.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Accesorios</Form.Label>
                <Form.Select
                  name="accesorios"
                  value={formValues.accesorios}
                  onChange={handleChange}
                >
                  <option value="">Seleccione los accesorios...</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Cargador">Cargador</option>
                  <option value="Mouse y Cargador">Mouse y Cargador</option>
                  <option value="Sin accesorios">Sin accesorios</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="color"
                  name="color"
                  value={formValues.color}
                  onChange={handleChange}
                  style={{ height: '40px' }}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Registro</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaRegistro"
                  value={formValues.fechaRegistro}
                  onChange={handleChange}
                />
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
            {formData ? "Actualizar" : "Guardar"} Equipo
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}