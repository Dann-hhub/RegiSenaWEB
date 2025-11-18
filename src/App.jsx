import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import CrudPageUser from './pages/CrudPageUser';
import MyProfilePage from './pages/PageProfile';
import CrudPageRoles from './pages/CrudPageRoles';
import DashboardPage from './pages/DashboardPage';
import CrudPagePersonas from './pages/CrudPagePersonas';
import CrudPageEquipos from './pages/CrudPageEquipos';
import CrudPageIngresos from './pages/CrudPageIngresos';
import CrudPageTipoEquipos from './pages/CrudPageTipoEquipos';
import CrudPageTipoPersonas from './pages/CrudPageTipoPersonas';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Rutas protegidas */}
          <Route path="/crud-page-user" element={
            <ProtectedRoute>
                <CrudPageUser />
            </ProtectedRoute>
          } />
          
          <Route path="/my-profile" element={
            <ProtectedRoute>
                <MyProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-roles" element={
            <ProtectedRoute>
                <CrudPageRoles />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-personas" element={
            <ProtectedRoute>
                <CrudPagePersonas />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-equipos" element={
            <ProtectedRoute>
                <CrudPageEquipos />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard-page" element={
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-ingresos" element={
            <ProtectedRoute>
                <CrudPageIngresos />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-tipo-equipo" element={
            <ProtectedRoute>
                <CrudPageTipoEquipos />
            </ProtectedRoute>
          } />
          
          <Route path="/crud-page-tipo-persona" element={
            <ProtectedRoute>
                <CrudPageTipoPersonas />
            </ProtectedRoute>
          } />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}