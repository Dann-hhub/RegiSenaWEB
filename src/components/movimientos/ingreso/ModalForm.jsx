import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';

export default function CrudModal({ 
  show, 
  handleClose, 
  handleSubmit, 
  formData,
  isEdit = false,
  isEditingExit = false // Nueva prop para modo "registrar salida"
}) {
  // Determinar el modo de operación
  const isEditing = isEdit || (formData && formData.id);
  const isExitRegistration = isEditingExit; // Modo específico para registrar salida

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="modal-lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isExitRegistration ? "Registrar Salida" : 
           isEditing ? "Editar Movimiento" : "Nuevo Ingreso"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            {/* Columna izquierda - Datos de Ingreso */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Documento</Form.Label>
                <Form.Control
                  type="number"
                  name="documento"
                  defaultValue={formData?.documento || ""}
                  disabled={isEditing && !isExitRegistration} // Bloqueado en edición normal
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Serial</Form.Label>
                <Form.Control
                  type="text"
                  name="serial"
                  defaultValue={formData?.serial || ""}
                  disabled={isEditing && !isExitRegistration}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Centro de formación</Form.Label>
                <Form.Control
                  type="text"
                  name="centroformacion"
                  defaultValue={formData?.centroformacion || ""}
                  disabled={isEditing && !isExitRegistration}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vigilante</Form.Label>
                <Form.Control
                  type="text"
                  name="vigilante"
                  defaultValue={formData?.vigilante || ""}
                  disabled={isEditing && !isExitRegistration}
                  required
                />
              </Form.Group>
            </Col>

            {/* Columna derecha - Datos de Ingreso/Salida */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="observaciones"
                  defaultValue={formData?.observaciones || ""}
                  disabled={isEditing && !isExitRegistration}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Ingreso</Form.Label>
                <Form.Control
                  as="select"
                  name="ingreso"
                  defaultValue={formData?.ingreso || "Ocasional"}
                  disabled={isEditing} // Siempre bloqueado en edición
                >
                  <option value="Ocasional">Ocasional</option>
                  <option value="Regular">Regular</option>
                  <option value="Especial">Especial</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Día de ingreso</Form.Label>
                <Form.Control
                  type="date"
                  name="dia_ingreso"
                  defaultValue={formData?.dia_ingreso || ""}
                  disabled={isEditing && !isExitRegistration}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hora de ingreso</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_ingreso"
                  defaultValue={formData?.hora_ingreso || ""}
                  disabled={isEditing && !isExitRegistration}
                  required
                />
              </Form.Group>

              {/* Sección de Salida - Solo editable en modo registro de salida */}
              <div className="border-top pt-3">
                <h5>Datos de Salida</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Salida</Form.Label>
                  <Form.Control
                    as="select"
                    name="salida"
                    defaultValue={formData?.salida || ""}
                    disabled={!isExitRegistration}
                  >
                    <option value="">Seleccione un motivo...</option>
                    <option value="Ocasional">Ocasional</option>
                    <option value="Permanente">Permanente</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Día de salida</Form.Label>
                  <Form.Control
                    type="date"
                    name="dia_salida"
                    defaultValue={formData?.dia_salida || ""}
                    disabled={!isExitRegistration}
                    max={new Date().toISOString().split('T')[0]} // No permite fechas futuras
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hora de salida</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_salida"
                    defaultValue={formData?.hora_salida || ""}
                    disabled={!isExitRegistration}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {isExitRegistration ? (
              <>
                <FaSignOutAlt className="me-1" /> Registrar Salida
              </>
            ) : isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}