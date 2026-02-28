import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './core/auth/AuthContext';
import AppErrorBoundary from './modules/shared/AppErrorBoundary';
import './index.css';

const rawBase = String(import.meta.env.BASE_URL || '/');
const normalizedBase = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter
          basename={normalizedBase}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </BrowserRouter>
      </AuthProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
