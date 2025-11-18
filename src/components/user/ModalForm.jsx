import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default function CrudModal({ show, handleClose, handleSubmit, formData, roles = [] }) {
  const [formValues, setFormValues] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    rol: '',
    correo: '',
    contrasena: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Inicializar formulario cuando cambian los props
  useEffect(() => {
    if (formData) {
      setFormValues({
        tipoDocumento: formData.tipoDocumento || '',
        documento: formData.documento || '',
        nombre: formData.nombre || '',
        apellido: formData.apellido || '',
        rol: formData.rol || '',
        correo: formData.correo || '',
        contrasena: '' // Por seguridad, no mostramos la contraseña existente
      });
    } else {
      setFormValues({
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        rol: '',
        correo: '',
        contrasena: ''
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
    
    // Validaciones
    if (!formValues.tipoDocumento || !formValues.documento || !formValues.nombre || 
        !formValues.apellido || !formValues.rol || !formValues.correo) {
      setAlertMessage('Todos los campos marcados con * son obligatorios');
      setShowAlert(true);
      return;
    }

    if (!formData && !formValues.contrasena) {
      setAlertMessage('La contraseña es obligatoria para nuevos usuarios');
      setShowAlert(true);
      return;
    }

    if (formValues.documento.length < 5) {
      setAlertMessage('El documento debe tener al menos 5 caracteres');
      setShowAlert(true);
      return;
    }

    if (!validateEmail(formValues.correo)) {
      setAlertMessage('Ingrese un correo electrónico válido');
      setShowAlert(true);
      return;
    }

    // Pasar los datos como objeto
    handleSubmit(formValues);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
          {formData ? "Editar Usuario" : "Nuevo Usuario"}
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo Documento *</Form.Label>
                <Form.Select
                  name="tipoDocumento"
                  value={formValues.tipoDocumento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un tipo...</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="Pasaporte">Pasaporte</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Documento *</Form.Label>
                <Form.Control
                  type="number"
                  name="documento"
                  value={formValues.documento}
                  onChange={handleChange}
                  required
                  disabled={!!formData} // No permitir modificar documento en edición
                  min="10000"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formValues.nombre}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={formValues.apellido}
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
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="rol"
                  value={formValues.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico *</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={formValues.correo}
                  onChange={handleChange}
                  required
                  placeholder="usuario@ejemplo.com"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña {!formData && '*'}</Form.Label>
                <Form.Control
                  type="password"
                  name="contrasena"
                  value={formValues.contrasena}
                  onChange={handleChange}
                  required={!formData}
                  placeholder={formData ? "Dejar vacío para mantener la actual" : "Ingrese la contraseña"}
                />
                <Form.Text className="text-muted">
                  {formData ? "Complete solo si desea cambiar la contraseña" : "La contraseña es obligatoria"}
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
            {formData ? "Actualizar" : "Guardar"} Usuario
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}