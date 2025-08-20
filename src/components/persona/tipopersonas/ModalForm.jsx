import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

export default function CrudModal({ show, handleClose, handleSubmit, formData }) {
  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="modal-lg" // Hace el modal más grande
      centered // Centra el modal verticalmente
    >
      <Modal.Header closeButton>
        <Modal.Title>{"Nuevo Tipo de Persona"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  defaultValue={formData?.nombre || ""}
                />
              </Form.Group>
            </Col>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}