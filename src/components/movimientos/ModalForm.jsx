import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaSignOutAlt, FaQrcode } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function CrudModal({ 
  show, 
  handleClose, 
  handleSubmit, 
  formData,
  isEdit = false,
  isEditingExit = false,
  fromQR = false
}) {
  // Obtener el usuario del contexto - CORREGIDO
  const { usuario } = useAuth();
  
  const [formValues, setFormValues] = useState({
    documento: '',
    serial: '',
    centroformacion: '',
    vigilante: '',
    observaciones: '',
    ingreso: 'Ocasional',
    dia_ingreso: '',
    hora_ingreso: '',
    salida: '',
    dia_salida: '',
    hora_salida: ''
  });

  // Actualizar valores del formulario cuando cambia formData - CORREGIDO
  useEffect(() => {
    if (formData) {
      const initialValues = fromQR ? {
        ...formData,
        ingreso: 'Permanente',
        salida: 'Permanente'
      } : {
        ...formData,
        ingreso: formData.ingreso || 'Ocasional',
        salida: formData.salida || '',
        vigilante: formData.vigilante || usuario?.documento || '' // CORREGIDO
      };

      setFormValues(initialValues);
    } else {
      setFormValues({
        documento: '',
        serial: '',
        centroformacion: 'CESGE',
        vigilante: usuario?.documento || '', // CORREGIDO
        observaciones: '',
        ingreso: fromQR ? 'Permanente' : 'Ocasional',
        dia_ingreso: fromQR ? new Date().toISOString().split('T')[0] : '',
        hora_ingreso: fromQR ? new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : '',
        salida: fromQR ? 'Permanente' : '',
        dia_salida: '',
        hora_salida: ''
      });
    }
  }, [formData, show, fromQR, usuario]);

  // Determinar qué campos están deshabilitados
  const isFieldDisabled = (fieldType) => {
    if (isEditingExit) {
      return !['salida', 'dia_salida', 'hora_salida'].includes(fieldType);
    }
    if (isEdit) {
      return false;
    }
    return false;
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const submitData = { ...formValues };
    
    // Llamar al handleSubmit del padre
    handleSubmit(e, submitData);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="modal-lg"
      centered
      contentClassName="modal-modern form-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {fromQR && (
            <FaQrcode className="me-2 text-success" />
          )}
          {isEditingExit ? "Registrar Salida" : 
           isEdit ? "Editar Movimiento" : "Nuevo Ingreso"}
          {fromQR && " (QR)"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          {/* Alert para indicar origen QR */}
          {fromQR && (
            <Alert variant="info" className="mb-3">
              <FaQrcode className="me-2" />
              <strong>Datos cargados desde código QR</strong>
              <br />
              <small>Tipo de ingreso y salida establecidos como "Permanente" por defecto.</small>
            </Alert>
          )}

          {/* Información del usuario actual - CORREGIDO */}
          {usuario && (
            <Alert variant="light" className="mb-3 py-2">
              <small>
                <strong>Usuario actual:</strong> {usuario.nombre} {usuario.apellido} 
                ({usuario.documento})
              </small>
            </Alert>
          )}

          <Row>
            {/* Columna izquierda - Datos de Ingreso */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Documento Persona *</Form.Label>
                <Form.Control
                  type="number"
                  value={formValues.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  disabled={isFieldDisabled('documento')}
                  required
                  placeholder="Documento de la persona"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Serial del Equipo *</Form.Label>
                <Form.Control
                  type="text"
                  value={formValues.serial}
                  onChange={(e) => handleInputChange('serial', e.target.value)}
                  disabled={isFieldDisabled('serial')}
                  required
                  placeholder="Serial del equipo"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Centro de formación *</Form.Label>
                <Form.Control
                  type="text"
                  value={formValues.centroformacion}
                  onChange={(e) => handleInputChange('centroformacion', e.target.value)}
                  disabled={isFieldDisabled('centroformacion')}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vigilante *</Form.Label>
                <Form.Control
                  type="text"
                  value={formValues.vigilante}
                  onChange={(e) => handleInputChange('vigilante', e.target.value)}
                  disabled={true} // Siempre deshabilitado, se auto-completa
                  required
                  placeholder="Se auto-completa con tu documento"
                />
                <Form.Text className="text-muted">
                  Este campo se completa automáticamente con tu documento de usuario
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Columna derecha - Datos de Ingreso/Salida */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formValues.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  disabled={isFieldDisabled('observaciones')}
                  placeholder="Observaciones adicionales..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Ingreso *</Form.Label>
                <Form.Select
                  value={formValues.ingreso}
                  onChange={(e) => handleInputChange('ingreso', e.target.value)}
                  disabled={isFieldDisabled('ingreso') || fromQR}
                >
                  <option value="Ocasional">Ocasional</option>
                  <option value="Permanente">Permanente</option>
                </Form.Select>
                {fromQR && (
                  <Form.Text className="text-muted">
                    Tipo establecido como "Permanente" por lectura QR
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de ingreso *</Form.Label>
                <Form.Control
                  type="date"
                  value={formValues.dia_ingreso}
                  onChange={(e) => handleInputChange('dia_ingreso', e.target.value)}
                  disabled={isFieldDisabled('dia_ingreso')}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hora de ingreso *</Form.Label>
                <Form.Control
                  type="time"
                  value={formValues.hora_ingreso}
                  onChange={(e) => handleInputChange('hora_ingreso', e.target.value)}
                  disabled={isFieldDisabled('hora_ingreso')}
                  required
                />
              </Form.Group>

              {/* Sección de Salida - Solo editable en modo registro de salida */}
              <div className="border-top pt-3">
                <h5>Datos de Salida</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Salida *</Form.Label>
                  <Form.Select
                    value={formValues.salida}
                    onChange={(e) => handleInputChange('salida', e.target.value)}
                    disabled={isFieldDisabled('salida') || fromQR}
                    required={isEditingExit}
                  >
                    <option value="">Seleccione tipo de salida...</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Permanente">Permanente</option>
                  </Form.Select>
                  {fromQR && (
                    <Form.Text className="text-muted">
                      Tipo establecido como "Permanente" por lectura QR
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de salida *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formValues.dia_salida}
                    onChange={(e) => handleInputChange('dia_salida', e.target.value)}
                    disabled={isFieldDisabled('dia_salida')}
                    required={isEditingExit}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora de salida *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formValues.hora_salida}
                    onChange={(e) => handleInputChange('hora_salida', e.target.value)}
                    disabled={isFieldDisabled('hora_salida')}
                    required={isEditingExit}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {isEditingExit ? (
              <>
                <FaSignOutAlt className="me-1" /> Registrar Salida
              </>
            ) : isEdit ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}