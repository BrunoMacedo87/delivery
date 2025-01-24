import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import Login from '../components/Login';
import GerenciarProdutos from '../components/produtos/GerenciarProdutos';
import GerenciarDominio from '../components/GerenciarDominio';
import VitrineProdutos from '../components/produtos/VitrineProdutos';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../contexts/AuthContext';

const RotasPrivadas = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Administrativas */}
        <Route path="/admin" element={
          <RotasPrivadas>
            <AdminLayout />
          </RotasPrivadas>
        }>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<GerenciarProdutos />} />
          <Route path="dominio" element={<GerenciarDominio />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        {/* Rotas Públicas */}
        <Route path="/e/:empresaSlug" element={<PublicLayout />}>
          <Route index element={<VitrineProdutos />} />
        </Route>

        {/* Rota para domínios personalizados */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<VitrineProdutos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
