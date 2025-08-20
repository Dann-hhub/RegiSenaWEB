import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function CrudModal({
  show,
  handleClose,
  handleSubmit,
  formData = null,
  isViewMode = false
}) {
  // Datos constantes para selectores (podrían venir de una API)
  const marcasDisponibles = ['Acer', 'HP', 'Lenovo', 'Dell', 'Asus', 'Apple'];
  const tiposEquipoDisponibles = ['Tablet', 'Portátil', 'Pantallas'];
  const coloresDisponibles = ['Negro', 'Plateado', 'Blanco', 'Azul', 'Rojo', 'Verde'];

  // Función para inicializar los valores del formulario
  const getInitialValues = () => {
    const equipoInicial = {
      id: Date.now(),
      tipoEquipo: '',
      marca: '',
      serial: '',
      accesorios: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
      horaRegistro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: ''
    };

    if (!formData) {
      return {
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        correo: '',
        tipoPersona: '',
        celular: '',
        equipos: [equipoInicial]
      };
    }
    return {
      tipoDocumento: formData.tipoDocumento || '',
      documento: formData.documento || '',
      nombre: formData.nombre || '',
      apellido: formData.apellido || '',
      correo: formData.correo || '',
      tipoPersona: formData.tipoPersona || '',
      celular: formData.celular || '',
      equipos: formData.equipos && formData.equipos.length > 0
        ? formData.equipos.map(eq => ({
          ...eq,
          // Asegurar que los nuevos campos existan en datos antiguos
          tipoEquipo: eq.tipoEquipo || '',
          fechaRegistro: eq.fechaRegistro || new Date().toISOString().split('T')[0],
          horaRegistro: eq.horaRegistro || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: eq.color || ''
        }))
        : [equipoInicial]
    };
  };

  // Estado del formulario
  const [formValues, setFormValues] = useState(getInitialValues());

  // Manejar cambios en los inputs principales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  // Manejar cambios en los campos de equipos
  const handleEquipoChange = (e, id, field) => {
    const { value } = e.target;
    setFormValues({
      ...formValues,
      equipos: formValues.equipos.map(equipo => {
        if (equipo.id === id) {
          return {
            ...equipo,
            [field]: value
          };
        }
        return equipo;
      })
    });
  };

  // Agregar nuevo equipo
  const agregarEquipo = () => {
    setFormValues({
      ...formValues,
      equipos: [
        ...formValues.equipos,
        {
          id: Date.now(),
          tipoEquipo: '',
          marca: '',
          serial: '',
          accesorios: '',
          fechaRegistro: new Date().toISOString().split('T')[0],
          horaRegistro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: ''
        }
      ]
    });
  };

  // Eliminar equipo
  const eliminarEquipo = (id) => {
    if (formValues.equipos.length <= 1) return;
    setFormValues({
      ...formValues,
      equipos: formValues.equipos.filter(equipo => equipo.id !== id)
    });
  };

  // Manejar envío del formulario
  const handleSubmitForm = (e) => {
    e.preventDefault();

    // Validar que haya al menos un equipo con tipo, marca y serial
    const equiposValidos = formValues.equipos.filter(eq => eq.tipoEquipo && eq.marca && eq.serial);
    if (equiposValidos.length === 0) {
      alert('Debe completar al menos tipo, marca y serial para cada equipo');
      return;
    }

    // Preparar datos para enviar
    const datosParaEnviar = {
      ...formValues,
      equipos: equiposValidos
    };

    handleSubmit(datosParaEnviar);
    handleClose();
  };

  // Componente para mostrar/editar un equipo
  const EquipoForm = ({ equipo, index }) => (
    <div className="border p-3 mb-3 rounded">
      <h6>Equipo {index + 1}</h6>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Equipo</Form.Label>
            <Form.Select
              value={equipo.tipoEquipo}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'tipoEquipo')}
              disabled={isViewMode}
            >
              <option value="">Seleccione un tipo...</option>
              {tiposEquipoDisponibles.map((tipo, i) => (
                <option key={i} value={tipo}>{tipo}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Select
              value={equipo.marca}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'marca')}
              disabled={isViewMode}
            >
              <option value="">Seleccione una marca...</option>
              {marcasDisponibles.map((marca, i) => (
                <option key={i} value={marca}>{marca}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Serial</Form.Label>
            <Form.Control
              type="text"
              value={equipo.serial}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'serial')}
              disabled={isViewMode}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type='color'
              value={equipo.color}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'color')}
              disabled={isViewMode}
            >
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Accesorios</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={equipo.accesorios}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'accesorios')}
              disabled={isViewMode}
              placeholder="Teclado, mouse, cargador, etc."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Registro</Form.Label>
            <Form.Control
              type="date"
              value={equipo.fechaRegistro}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'fechaRegistro')}
              disabled={isViewMode}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hora de Registro</Form.Label>
            <Form.Control
              type="time"
              value={equipo.horaRegistro}
              onChange={(e) => handleEquipoChange(e, equipo.id, 'horaRegistro')}
              disabled={isViewMode}
            />
          </Form.Group>

        </Col>
      </Row>

      {!isViewMode && (
        <div className="d-flex justify-content-end">
          <Button
            variant="outline-danger"
            onClick={() => eliminarEquipo(equipo.id)}
            disabled={formValues.equipos.length <= 1}
            title="Eliminar equipo"
            size="sm"
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {formData?.id ? "Editar Persona" : "Nueva Persona"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmitForm}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo documento</Form.Label>
                <Form.Select
                  name="tipoDocumento"
                  value={formValues.tipoDocumento}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                >
                  <option value="">Seleccione un tipo...</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Documento</Form.Label>
                <Form.Control
                  type="number"
                  name="documento"
                  value={formValues.documento}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formValues.nombre}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={formValues.apellido}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={formValues.correo}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Persona</Form.Label>
                <Form.Select
                  name="tipoPersona"
                  value={formValues.tipoPersona}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                >
                  <option value="">Seleccione un tipo de persona...</option>
                  <option value="Aprendiz">Aprendiz</option>
                  <option value="Funcionario">Funcionario</option>
                  <option value="PersonaCorriente">Persona Corriente</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Celular</Form.Label>
                <Form.Control
                  type="number"
                  name="celular"
                  value={formValues.celular}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-4">
            <h5>Equipos</h5>
            {formValues.equipos.map((equipo, index) => (
              <EquipoForm key={equipo.id} equipo={equipo} index={index} />
            ))}

            {!isViewMode && (
              <Button
                variant="outline-primary"
                onClick={agregarEquipo}
                size="sm"
                className="mt-2"
                type="button"
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Agregar Equipo
              </Button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancelar
          </Button>
          {!isViewMode && (
            <Button variant="success" type="submit">
              Guardar
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}