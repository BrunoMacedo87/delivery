import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import LandingPage1 from './templates/LandingPage1';
import api from '../services/api';

const EmpresaLanding = () => {
  const { dominio } = useParams();
  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        // Busca dados da empresa
        const empresaResponse = await api.get(`/empresas/${dominio}`);
        setEmpresa(empresaResponse.data);

        // Busca produtos da empresa
        const produtosResponse = await api.get(`/produtos?empresa_id=${empresaResponse.data.id}`);
        setProdutos(produtosResponse.data);
      } catch (err) {
        setError('Empresa não encontrada');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresaData();
  }, [dominio]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !empresa) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <h1>{error || 'Empresa não encontrada'}</h1>
      </Box>
    );
  }

  // Renderiza o template adequado baseado no modelo_template da empresa
  switch (empresa.modelo_template) {
    case 1:
    default:
      return <LandingPage1 empresa={empresa} produtos={produtos} />;
    // Adicione mais cases conforme novos templates forem criados
    // case 2:
    //   return <LandingPage2 empresa={empresa} produtos={produtos} />;
  }
};

export default EmpresaLanding;
