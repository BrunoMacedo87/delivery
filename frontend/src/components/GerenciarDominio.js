import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const steps = [
  'Configurar DNS',
  'Verificar Apontamento',
  'Gerar SSL'
];

const GerenciarDominio = ({ empresa }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dnsStatus, setDnsStatus] = useState(null);
  const [sslStatus, setSslStatus] = useState(null);
  const [checkingInterval, setCheckingInterval] = useState(null);

  const copiarParaClipboard = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.success('Copiado para a área de transferência!');
  };

  const verificarDNS = async () => {
    setLoading(true);
    try {
      const response = await api.post('/dominios/verificar', {
        dominio: empresa.dominio
      });
      
      setDnsStatus(response.data);
      
      if (response.data.status === 'ok') {
        setActiveStep(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao verificar DNS');
    } finally {
      setLoading(false);
    }
  };

  const iniciarGeracaoSSL = async () => {
    setLoading(true);
    try {
      const response = await api.post('/dominios/gerar-ssl', {
        dominio: empresa.dominio
      });
      
      toast.success('Iniciando geração do SSL...');
      setActiveStep(2);
      
      // Inicia verificação periódica do status
      const interval = setInterval(verificarStatusSSL, 5000);
      setCheckingInterval(interval);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao gerar SSL');
    } finally {
      setLoading(false);
    }
  };

  const verificarStatusSSL = async () => {
    try {
      const response = await api.get(`/dominios/status-ssl/${empresa.dominio}`);
      setSslStatus(response.data);
      
      if (response.data.status === 'concluido') {
        clearInterval(checkingInterval);
        toast.success('SSL gerado com sucesso!');
        setActiveStep(3);
      } else if (response.data.status === 'erro') {
        clearInterval(checkingInterval);
        toast.error('Erro ao gerar SSL');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (checkingInterval) {
        clearInterval(checkingInterval);
      }
    };
  }, [checkingInterval]);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gerenciar Domínio
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {/* Passo 1: Configuração DNS */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Configure seu DNS
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Adicione um registro A no DNS do seu domínio com as seguintes informações:
          </Alert>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              label="Domínio"
              value={empresa.dominio}
              disabled
            />
            <IconButton onClick={() => copiarParaClipboard(empresa.dominio)}>
              <ContentCopyIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              label="IP do Servidor"
              value={process.env.REACT_APP_SERVER_IP}
              disabled
            />
            <IconButton onClick={() => copiarParaClipboard(process.env.REACT_APP_SERVER_IP)}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Passo 2: Verificação DNS */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            onClick={verificarDNS}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            Verificar Configuração DNS
          </Button>

          {dnsStatus && (
            <Alert
              severity={dnsStatus.status === 'ok' ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {dnsStatus.message}
            </Alert>
          )}
        </Box>

        {/* Passo 3: Geração SSL */}
        {activeStep >= 1 && (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              onClick={iniciarGeracaoSSL}
              disabled={loading || activeStep < 1}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            >
              Gerar Certificado SSL
            </Button>

            {sslStatus && (
              <Alert
                severity={sslStatus.status === 'concluido' ? 'success' : 'info'}
                sx={{ mt: 2 }}
              >
                Status: {sslStatus.status}
              </Alert>
            )}
          </Box>
        )}

        {/* Conclusão */}
        {activeStep === 3 && (
          <Alert severity="success">
            Parabéns! Seu domínio está configurado e seguro com SSL.
            Acesse: https://{empresa.dominio}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default GerenciarDominio;
