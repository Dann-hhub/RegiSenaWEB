import { useState, useEffect } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { FaSync } from 'react-icons/fa';
import PersonaCrudUnificado from '../components/persona/PersonaCrudUnificado';
import Layout from '../components/Layout';
import AnimatedPage from '../components/AnimatedPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://127.0.0.1:5000';

export default function PersonaCrud() {
  const [personas, setPersonas] = useState([]);
  const [tiposPersona, setTiposPersona] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tiposEquipo, setTiposEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  // 🔄 FUNCIÓN GENÉRICA PARA FETCH
  const fetchData = async (endpoint, setter, dataKey) => {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setter(result[dataKey] || []);
      
    } catch (error) {
      console.error(`❌ Error cargando ${endpoint}:`, error);
      showAlert(`❌ Error al cargar ${endpoint}: ${error.message}`, 'danger');
      setter([]);
    }
  };

  // 📥 CARGAR TODOS LOS DATOS
  const fetchAllData = async () => {
    setRefreshing(true);
    
    await Promise.all([
      fetchData('persona', setPersonas, 'personas'),
      fetchData('tipopersona', setTiposPersona, 'tipopersonas'),
      fetchData('equipo', setEquipos, 'equipos'),
      fetchData('tipoequipo', setTiposEquipo, 'tipoequipos')
    ]);
    
    setRefreshing(false);
  };

  // 🔄 MANEJAR ACTUALIZACIÓN
  const handleRefresh = async () => {
    await fetchAllData();
    showAlert('✅ Datos actualizados correctamente', 'success');
  };

  // 📥 CARGA INICIAL
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };

    loadInitialData();
  }, []);

  return (
    <Layout>
      <AnimatedPage>
      <Container className="mt-4">
        {/* ALERTAS */}
        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ show: false, message: '', type: '' })}
            className="mb-3"
          >
            {alert.message}
          </Alert>
        )}

        {/* HEADER CON BOTÓN */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">👥 Gestión de Personas</h1>
          <Button
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'fa-spin me-2' : 'me-2'} />
            {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
          </Button>
        </div>

        {/* COMPONENTE PRINCIPAL */}
        <PersonaCrudUnificado
          personas={personas}
          tiposPersona={tiposPersona}
          equipos={equipos}
          tiposEquipo={tiposEquipo}
          loading={loading}
          onRefresh={() => fetchData('persona', setPersonas, 'personas')}
          showAlert={showAlert}
        />
      </Container>
      </AnimatedPage>
    </Layout>
  );
}