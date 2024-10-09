import { createContext, ReactNode, useCallback, useRef, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type ToastContextType = {
  show: (message: string, type: 'success' | 'danger') => void;
};

const initialState: ToastContextType = {
  show() {
    throw new Error('Not implemented');
  },
};

export const ToastContext = createContext(initialState);

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'danger';
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const idRef = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: 'success' | 'danger') => {
    setToasts((toasts) => [...toasts, { id: ++idRef.current, message, type }]);
  }, []);

  const close = useCallback((toast: Toast) => {
    setToasts((toasts) => toasts.filter((t) => t != toast));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      <ToastContainer position="bottom-end" className="p-2">
        {toasts.map((toast) => (
          <Toast
            animation
            key={toast.id}
            bg={toast.type}
            autohide
            delay={5000}
            onClose={() => close(toast)}
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
      {children}
    </ToastContext.Provider>
  );
}
