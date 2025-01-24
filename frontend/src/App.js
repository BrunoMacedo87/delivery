import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Dashboard from './components/Dashboard';
import CadastroEmpresa from './components/CadastroEmpresa';
import EmpresaLanding from './components/EmpresaLanding';
import AdminLayout from './components/layouts/AdminLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Se ainda está carregando, não faz nada
  if (loading) {
    return null;
  }

  // Se não está autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está autenticado, renderiza o componente
  return children;
};

// Componente para envolver as rotas administrativas com o layout
const AdminRoute = ({ children }) => {
  return (
    <PrivateRoute>
      <AdminLayout>{children}</AdminLayout>
    </PrivateRoute>
  );
};

function AppRoutes() {
  const domain = window.location.hostname;
  const isCustomDomain = !domain.includes('localhost') && !domain.includes('127.0.0.1');

  if (isCustomDomain) {
    return (
      <Routes>
        <Route path="/*" element={<EmpresaLanding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route
        path="/admin/cadastro-empresa"
        element={
          <AdminRoute>
            <CadastroEmpresa />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route path="/e/:dominio" element={<EmpresaLanding />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
