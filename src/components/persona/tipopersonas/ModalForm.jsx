import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function CrudModal({ 
  show, 
  handleClose, 
  handleSubmit, 
  formData 
}) {
  const [formValues, setFormValues] = useState({ nombre: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Inicializar formulario cuando cambian los props
  useEffect(() => {
    if (formData) {
      setFormValues({
        nombre: formData.nombre || ''
      });
    } else {
      setFormValues({ nombre: '' });
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
    
    // Validaciones
    if (!formValues.nombre.trim()) {
      setAlertMessage('El nombre es obligatorio');
      setShowAlert(true);
      return;
    }

    if (formValues.nombre.trim().length < 2) {
      setAlertMessage('El nombre debe tener al menos 2 caracteres');
      setShowAlert(true);
      return;
    }

    // Pasar los datos como objeto
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
        <Modal.Title>
          {formData ? "Editar Tipo de Persona" : "Nuevo Tipo de Persona"}
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
                <Form.Label>Nombre del Tipo de Persona *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Ej: Aprendiz, Funcionario, Visitante, etc."
                  value={formValues.nombre}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
                <Form.Text className="text-muted">
                  Este nombre identificará el tipo de persona en el sistema.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Nota:</strong> Los campos marcados con * son obligatorios.
            </small>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {formData ? "Actualizar" : "Guardar"} Tipo de Persona
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}