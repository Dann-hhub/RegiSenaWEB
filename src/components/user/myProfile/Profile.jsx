// src/pages/ProfilePage.js
import { useState, useEffect } from "react";
import { Card, Button, Modal, Alert, Form, Spinner, Row, Col, Container, Badge } from "react-bootstrap";
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaKey, FaUserCircle, FaEdit } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext"; // ajusta ruta si hace falta
import "./Profile.css";

export default function ProfilePage() {
  const { usuario, permisos = [], permisosRutas = {} } = useAuth(); // tomamos usuario y permisos desde el contexto

  const [userData, setUserData] = useState({
    documento: "",
    tipoDocumento: "",
    nombre: "",
    apellido: "",
    correo: "",
    rol: "",
    rolNombre: "", // Nuevo campo para el nombre del rol
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [editSuccessAlert, setEditSuccessAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    correo: ""
  });
  const [roles, setRoles] = useState({}); // Objeto para mapear IDs de rol a nombres
  const [originalUser, setOriginalUser] = useState(null); // Datos completos para mantener estado y contraseña

  // Utilidad para iniciales del avatar
  const getInitials = (nombre = "", apellido = "") => {
    const n = (nombre || "").trim().charAt(0);
    const a = (apellido || "").trim().charAt(0);
    return `${n}${a}`.toUpperCase() || "U";
  };

  // Función para obtener los nombres de los roles
  const fetchRoles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/roles", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const rolesData = await res.json();
        // Convertir array de roles a objeto { id: nombre }
        const rolesMap = {};
        rolesData.forEach(rol => {
          rolesMap[rol.id] = rol.nombre;
        });
        setRoles(rolesMap);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  // Función para obtener el nombre del rol basado en el ID
  const getRolNombre = (rolId) => {
    const nombresRoles = {
      1: "Administrador",
      2: "Docente", 
      3: "Estudiante",
      4: "Coordinador",
      // Agrega más mapeos según los roles de tu sistema
    };
    
    // Primero intenta con los roles obtenidos del API, luego con el mapeo local
    return roles[rolId] || nombresRoles[rolId] || rolId;
  };

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Obtener roles primero
        await fetchRoles();

        // Priorizar el usuario del context, si no, fallback a localStorage
        const storageUser = (() => {
          try {
            return JSON.parse(localStorage.getItem("user") || "null");
          } catch {
            return null;
          }
        })();

        const documento = usuario?.documento || storageUser?.documento;

        if (!documento) {
          // No hay documento: no podemos pedir al backend
          if (mounted) {
            setError("No se encontraron datos de usuario. Por favor inicia sesión.");
            setIsLoading(false);
          }
          return;
        }

        // Llamada al endpoint que devuelve el usuario por documento
        const res = await fetch(`http://127.0.0.1:5000/usuario/${documento}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          // Si el backend responde mal, intentar usar el usuario del context/localStorage
          if (usuario) {
            if (mounted) {
              const rolNombre = getRolNombre(usuario.rol);
              setUserData({
                documento: usuario.documento || "",
                tipoDocumento: usuario.tipoDocumento || "",
                nombre: usuario.nombre || "",
                apellido: usuario.apellido || "",
                correo: usuario.correo || "",
                rol: usuario.rol || "",
                rolNombre: rolNombre,
              });
            }
            return;
          }

          if (storageUser) {
            if (mounted) {
              const rolNombre = getRolNombre(storageUser.rol);
              setUserData({
                documento: storageUser.documento || "",
                tipoDocumento: storageUser.tipoDocumento || "",
                nombre: storageUser.nombre || "",
                apellido: storageUser.apellido || "",
                correo: storageUser.correo || "",
                rol: storageUser.rol || "",
                rolNombre: rolNombre,
              });
            }
            return;
          }

          throw new Error("No se pudo obtener la información del usuario desde el servidor.");
        }

        const data = await res.json();
        // El endpoint puede devolver { usuario: {...} } o directamente el objeto
        const u = data.usuario || data;

        if (mounted) {
          const rolNombre = getRolNombre(u.rol || u.role || u.rol_id);
          setUserData({
            documento: u.documento || u.id || "",
            tipoDocumento: u.tipoDocumento || u.tipo_documento || "",
            nombre: u.nombre || "",
            apellido: u.apellido || "",
            correo: u.correo || u.email || "",
            rol: u.rol || u.role || u.rol_id || "",
            rolNombre: rolNombre,
          });
          setOriginalUser(u);

          // Actualizar localStorage para mantener consistencia
          localStorage.setItem(
            "user",
            JSON.stringify({
              documento: u.documento || u.id || "",
              tipoDocumento: u.tipoDocumento || u.tipo_documento || "",
              nombre: u.nombre || "",
              apellido: u.apellido || "",
              correo: u.correo || u.email || "",
              rol: u.rol || u.role || u.rol_id || "",
              rolNombre: rolNombre,
            })
          );
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (mounted) setError(err.message || "Error al cargar los datos del usuario");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [usuario]); // re-ejecuta cuando el contexto actualiza el usuario

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!userData.documento) {
      setError("Documento de usuario no disponible.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const payload = {
        documento: userData.documento,
        contrasenaActual: passwordData.currentPassword,
        nuevaContrasena: passwordData.newPassword,
      };

      const res = await fetch("http://127.0.0.1:5000/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al cambiar contraseña");
      }

      setShowSuccessAlert(true);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // (Opcional) actualizar localStorage si cambia algo relevante
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) {
        localStorage.setItem("user", JSON.stringify({ ...stored }));
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = () => {
    setEditError("");
    setEditForm({
      nombre: userData.nombre || "",
      apellido: userData.apellido || "",
      correo: userData.correo || ""
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      setEditError("");
      setIsLoading(true);

      if (!userData.documento) {
        throw new Error("Documento de usuario no disponible.");
      }

      // Verificar correo único contra otros usuarios
      const verificarCorreoUnico = async (correo, documentoActual) => {
        try {
          const response = await fetch('http://127.0.0.1:5000/usuario', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.ok) {
            const data = await response.json();
            const lista = data.usuarios || [];
            const existe = lista.find(u => u.correo === correo && u.documento !== documentoActual);
            return !existe;
          }
          return true; // si falla el listado, permitir continuar
        } catch (err) {
          console.error('Error verificando correo único:', err);
          return true;
        }
      };

      const esCorreoUnico = await verificarCorreoUnico(editForm.correo.trim(), userData.documento);
      if (!esCorreoUnico) {
        throw new Error('El correo electrónico ya está registrado por otro usuario');
      }

      // Asegurar envío de campos requeridos por backend (estado, contrasena)
      const payload = {
        tipoDocumento: userData.tipoDocumento,
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        rol: userData.rol,
        correo: editForm.correo.trim(),
        estado: originalUser?.estado ?? 1,
        contrasena: originalUser?.contrasena ?? undefined
      };

      const res = await fetch(`http://127.0.0.1:5000/usuario/${userData.documento}` ,{
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.mensaje || result.message || "Error al actualizar el perfil");
      }

      // Actualizar estado local y almacenamiento
      const rolNombre = getRolNombre(userData.rol);
      const updated = {
        documento: userData.documento,
        tipoDocumento: userData.tipoDocumento,
        nombre: payload.nombre,
        apellido: payload.apellido,
        correo: payload.correo,
        rol: userData.rol,
        rolNombre
      };
      setUserData(updated);
      localStorage.setItem("user", JSON.stringify(updated));

      setShowEditModal(false);
      setEditSuccessAlert(true);
    } catch (err) {
      console.error("Error updating profile:", err);
      setEditError(err.message || "Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-4 profile-section">
        {/* Hero del perfil */}
        <div className="profile-hero mb-4 p-4 rounded-3">
          <Row className="align-items-center">
            <Col xs={12} md={8} className="d-flex align-items-center">
              <div className="profile-avatar me-3 d-flex align-items-center justify-content-center">
                <span className="profile-initials">{getInitials(userData.nombre, userData.apellido)}</span>
              </div>
              <div>
                <h3 className="mb-1 fw-semibold">{userData.nombre} {userData.apellido}</h3>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="success" className="role-badge">{userData.rolNombre || "Usuario"}</Badge>
                  <span className="text-muted">Documento: {userData.documento || "-"}</span>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-success" className="me-2" onClick={() => setShowPasswordModal(true)}>
                <FaLock className="me-2" /> Cambiar contraseña
              </Button>
              <Button variant="success" onClick={openEditModal}>
                <FaEdit className="me-2" /> Editar perfil
              </Button>
            </Col>
          </Row>
        </div>

        {/* Estadísticas rápidas */}
        <Row className="g-3 mb-4">
          <Col sm={6} md={4}>
            <Card className="stat-card card-modern">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Módulos habilitados</span>
                  <FaKey className="text-success" />
                </div>
                <div className="display-6 fw-semibold">{Object.keys(permisosRutas || {}).length || 0}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={4}>
            <Card className="stat-card card-modern">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Permisos</span>
                  <FaKey className="text-success" />
                </div>
                <div className="display-6 fw-semibold">{(permisos || []).length}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={4}>
            <Card className="stat-card card-modern">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Correo</span>
                  <FaEnvelope className="text-success" />
                </div>
                <div className="h5 mb-0 fw-semibold text-truncate">{userData.correo || "-"}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {isLoading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-2">Cargando información del perfil...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}

            {showSuccessAlert && (
              <Alert
                variant="success"
                onClose={() => setShowSuccessAlert(false)}
                dismissible
              >
                Contraseña actualizada correctamente
              </Alert>
            )}

            <Row className="justify-content-center">
              <Col lg={7} className="mb-3">
                <Card className="card-modern">
                  <Card.Header className="bg-light py-3">
                    <h5 className="mb-0 d-flex align-items-center"><FaUser className="me-2" /> Información Personal</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">Documento</span>
                          <span className="value">{userData.documento}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">Tipo de Documento</span>
                          <span className="value">{userData.tipoDocumento}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">Nombre Completo</span>
                          <span className="value">{userData.nombre} {userData.apellido}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">Correo Electrónico</span>
                          <span className="value">{userData.correo}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <span className="label">Rol</span>
                          <span className="value">{userData.rolNombre}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={5}>
                <Card className="card-modern h-100">
                  <Card.Header className="bg-light py-3">
                    <h5 className="mb-0">Cuenta y Seguridad</h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted">Gestiona tu contraseña y revisa datos clave de tu cuenta.</p>
                    <div className="d-grid gap-2">
                      <Button variant="success" onClick={() => setShowPasswordModal(true)}>
                        <FaLock className="me-2" /> Cambiar Contraseña
                      </Button>
                      <Button variant="outline-success" onClick={openEditModal}>
                        <FaEdit className="me-2" /> Actualizar Datos
                      </Button>
                    </div>
                    <hr className="my-3" />
                    <div className="small text-muted">
                      Consejo: usa una contraseña robusta y única para este sistema.
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {editSuccessAlert && (
          <Alert
            variant="success"
            onClose={() => setEditSuccessAlert(false)}
            dismissible
            className="mt-3"
          >
            Perfil actualizado correctamente
          </Alert>
        )}

        {/* Modal para cambiar contraseña */}
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="w-100 text-center">
              <FaLock className="me-2 text-success" />
              Cambiar Contraseña
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form>
              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label className="fw-semibold">Contraseña Actual</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="py-2"
                />
              </Form.Group>
              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label className="fw-semibold">Nueva Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="py-2"
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label className="fw-semibold">Confirmar Nueva Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="py-2"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowPasswordModal(false)}
              className="px-4"
            >
              Cancelar
            </Button>
            <Button 
              variant="success" 
              onClick={handlePasswordChange}
              className="px-4"
            >
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para editar perfil */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="w-100 text-center">
              <FaEdit className="me-2 text-success" />
              Editar Perfil
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            {editError && (
              <Alert variant="danger" onClose={() => setEditError("")} dismissible>
                {editError}
              </Alert>
            )}
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="editNombre">
                    <Form.Label className="fw-semibold">Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={editForm.nombre}
                      onChange={handleEditChange}
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editApellido">
                    <Form.Label className="fw-semibold">Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={editForm.apellido}
                      onChange={handleEditChange}
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="editCorreo">
                    <Form.Label className="fw-semibold">Correo</Form.Label>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={editForm.correo}
                      onChange={handleEditChange}
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editDocumento">
                    <Form.Label className="fw-semibold">Documento</Form.Label>
                    <Form.Control type="text" value={userData.documento} disabled className="py-2" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editTipoDocumento">
                    <Form.Label className="fw-semibold">Tipo de Documento</Form.Label>
                    <Form.Control type="text" value={userData.tipoDocumento} disabled className="py-2" />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowEditModal(false)}
              className="px-4"
            >
              Cancelar
            </Button>
            <Button 
              variant="success" 
              onClick={handleEditSubmit}
              className="px-4"
            >
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
}
