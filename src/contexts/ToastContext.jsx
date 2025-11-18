import { createContext, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext({ showToast: () => {}, hideToast: () => {}, toast: null });

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, title: '', message: '', variant: 'success' });

  const showToast = (title, message, variant = 'success') => {
    setToast({ show: true, title, message, variant });
  };

  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
      {/* Contenedor global fijo para que no se esconda tras modales */}
      <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 3000 }}>
        <Toast show={toast.show} onClose={hideToast} delay={5000} autohide bg={toast.variant}>
          <Toast.Header>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body className={["success","danger","dark"].includes(toast.variant) ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);