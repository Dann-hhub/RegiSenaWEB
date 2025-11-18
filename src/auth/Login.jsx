// auth/Login.jsx - VERSIÓN ACTUALIZADA
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Alert, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // Importar el hook

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storedEmail, setStoredEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();
  
  // Usar el AuthContext
  const { login } = useAuth();

  // Función para obtener información completa del usuario por correo
  const obtenerUsuarioPorCorreo = async (correo) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/usuario', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.usuarios) {
          // Buscar el usuario por correo
          const usuarioEncontrado = data.usuarios.find(user => user.correo === correo);
          if (usuarioEncontrado) {
            return usuarioEncontrado;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  };

  // Función para enviar email usando FormSubmit (igual que antes)
  const sendVerificationEmail = async (userEmail, code) => {
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'RegiSena',
          email: userEmail,
          message: `Tu código de verificación es: ${code}`,
          subject: 'Código de Verificación - RegiSena',
          _replyto: userEmail,
          _template: 'table'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Email enviado exitosamente via FormSubmit');
        return true;
      } else {
        throw new Error('Error en FormSubmit');
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      alert(`📧 Código: ${code}\n\nError al enviar email. Usa este código para verificar.`);
      return true;
    }
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    console.log('🔐 Intentando login con:', email);

    // 1. Verificar credenciales con tu API
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: email,
        contrasena: password
      })
    });

    if (!response.ok) throw new Error('Error en la API');

    const data = await response.json();
    console.log('📋 Respuesta API:', data);

    if (data.success) {
      // Guardamos el usuario que viene de la API
      setStoredEmail(email);
      localStorage.setItem("tempUser", JSON.stringify(data.usuario)); // 🔑 Guardamos user temporalmente
      
      // 2. Generar código de 6 dígitos (opcional, ya que API lo genera, aquí solo manejamos email)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setAttemptsLeft(3);
      console.log('🔢 Código generado (frontend):', code);

      // 3. ENVIAR EMAIL
      console.log('📤 Enviando email a:', email);
      const emailSent = await sendVerificationEmail(email, code);
      
      if (emailSent) {
        setShowVerificationModal(true);
        setError('');
      }
    } else {
      setError(data.message || 'Error en el inicio de sesión');
    }
  } catch (err) {
    console.error('💥 Error:', err);
    setError('Error de conexión con el servidor');
  } finally {
    setIsLoading(false);
  }
};


const handleVerification = async () => {
  setIsLoading(true);
  setError('');

  try {
    if (verificationCode === generatedCode) {
      // ✅ Recuperar datos de usuario guardados del backend
      const usuarioCompleto = JSON.parse(localStorage.getItem("tempUser"));

      if (usuarioCompleto) {
        // Preparar datos del usuario para el AuthContext
        const userData = {
          correo: storedEmail,
          documento: usuarioCompleto.documento,
          nombre: usuarioCompleto.nombre || '',
          apellido: usuarioCompleto.apellido || '',
          rol: usuarioCompleto.rol || ''
        };

        // Usar la función login del AuthContext
        await login(userData);

        // Limpiar datos temporales
        localStorage.removeItem("tempUser");

        setShowVerificationModal(false);
        navigate('/my-profile');
      } else {
        setError('No se pudo obtener la información del usuario. Contacta al administrador.');
      }
    } else {
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);

      if (newAttempts > 0) {
        setError(`❌ Código incorrecto. Te quedan ${newAttempts} intentos.`);
      } else {
        setError('❌ Has agotado todos tus intentos. Se cerrará la ventana de verificación.');
        setTimeout(() => {
          setShowVerificationModal(false);
          setAttemptsLeft(3);
        }, 3000);
      }
    }
  } catch (err) {
    setError('Error en la verificación: ' + err.message);
  } finally {
    setIsLoading(false);
  }
};


  // Resto del código igual (resendCode, etc.)
  const resendCode = async () => {
    setIsLoading(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      setAttemptsLeft(3);
      setError('');
      await sendVerificationEmail(storedEmail, newCode);
    } catch (err) {
      setError('Error al reenviar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container className="login-page">
        <Card className="w-100 glass-card login-card fade-in">
          <Card.Body>
            <h2 className="text-center mb-4">Bienvenido a Regisena</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label><strong>📧 Correo Electrónico</strong></Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="tu_email@gmail.com"
                  className="input-modern"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><strong>🔒 Contraseña</strong></Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="**********"
                  className="input-modern"
                />
              </Form.Group>

              <Button className="w-100 mt-3 modern-btn" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner animation="border" size="sm" /> : '🚀 Ingresar'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <Link className='link-modern' to="/forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🔐 Verificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>📨 Se ha enviado un código a:</strong><br />
            {storedEmail}
          </Alert>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label><strong>🔢 Código de verificación:</strong></Form.Label>
            <Form.Control
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{ 
                letterSpacing: '3px', 
                fontSize: '20px', 
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            />
            <Form.Text className="text-muted">
              Intentos restantes: {attemptsLeft}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="modern-btn" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid rgba(148,163,184,0.3)' }} onClick={resendCode} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : '🔄 Reenviar código'}
          </Button>
          <Button className="modern-btn" onClick={handleVerification} disabled={isLoading || attemptsLeft <= 0}>
            {isLoading ? <Spinner animation="border" size="sm" /> : '✅ Verificar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}