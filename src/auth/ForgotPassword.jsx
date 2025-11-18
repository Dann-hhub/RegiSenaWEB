import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Función para generar una contraseña temporal
  const generarContrasenaTemporal = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let contrasena = '';
    for (let i = 0; i < 10; i++) {
      contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasena;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // Generar contraseña temporal
      const nuevaContrasena = generarContrasenaTemporal();
      
      console.log('📧 Enviando correo a:', email);
      console.log('🔑 Nueva contraseña:', nuevaContrasena);

      // 1. Primero enviar el correo con la nueva contraseña
      const emailResponse = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'RegiSena',
          email: email,
          message: `Recuperación de Contraseña - RegiSena
          Hemos recibido una solicitud para restablecer tu contraseña. Tu nueva contraseña temporal es: ${nuevaContrasena}

          Instrucciones:
          Utiliza esta contraseña para iniciar sesión
          Una vez dentro del sistema, ve a tu perfil
          Cambia tu contraseña por una nueva y segura

          Nota de seguridad: Por favor, cambia esta contraseña temporal lo antes posible.
          Si no solicitaste este cambio, contacta inmediatamente al administrador del sistema.

          Este es un mensaje automático, por favor no responder a este correo.
          `,
          subject: 'Servicio Nacional de Aprendizaje (SENA)',
          _replyto: email,
          _template: 'table'
        })
      });

      const emailData = await emailResponse.json();
      
      if (emailResponse.ok && emailData.success) {
        console.log('✅ Correo enviado exitosamente');
        
        // 2. Ahora actualizar la contraseña en la base de datos
        try {
          const updateResponse = await fetch('http://127.0.0.1:5000/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              correo: email,
              nuevaContrasena: nuevaContrasena
            })
          });

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            if (updateData.success) {
              setMessage(`✅ Se ha enviado una nueva contraseña a ${email}. Revisa tu bandeja de entrada y spam.`);
            } else {
              setError('Error al actualizar la contraseña en el sistema');
            }
          } else {
            setError('Error al conectar con el servidor para actualizar la contraseña');
          }
        } catch (updateError) {
          console.error('Error updating password:', updateError);
          setMessage(`✅ Correo enviado a ${email}, pero hubo un error al actualizar en el sistema. Contacta al administrador.`);
        }
      } else {
        throw new Error('Error al enviar el correo');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error al enviar el correo. Por favor, intenta nuevamente o contacta al administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="login-page">
      <Card className="w-100 glass-card login-card fade-in">
        <Card.Body>
          <h2 className="text-center mb-4">🔒 Recuperar Contraseña</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><strong>📧 Correo Electrónico</strong></Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="tu_email@ejemplo.com"
                className="input-modern"
              />
              <Form.Text className="text-muted">
                <strong>Te enviaremos una contraseña temporal a tu correo</strong>
              </Form.Text>
            </Form.Group>

            <Button 
              className="w-100 mt-3 modern-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                '📨 Enviar Contraseña Temporal'
              )}
            </Button>
          </Form>
        </Card.Body>
        
        <Card.Footer className="text-center">
          <Link className='link-modern' to="/">
            ← Volver al inicio de sesión
          </Link>
        </Card.Footer>
      </Card>
    </Container>
  );
}