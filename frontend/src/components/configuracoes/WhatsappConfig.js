import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  QrCode as QrCodeIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const WhatsappConfig = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    ativo: false,
    numero_whatsapp: '',
    mensagem_boas_vindas: '',
    mensagem_pedido: '',
    notificar_novos_pedidos: true,
    notificar_status_pedido: true,
  });
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState('desconectado');
  const [openQR, setOpenQR] = useState(false);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/configuracoes/whatsapp');
      setConfig(response.data);
      setStatus(response.data.status || 'desconectado');
    } catch (error) {
      toast.error('Erro ao carregar configurações do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const salvarConfig = async () => {
    try {
      setLoading(true);
      await api.post('/configuracoes/whatsapp', config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const gerarQRCode = async () => {
    try {
      setLoading(true);
      const response = await api.post('/whatsapp/gerar-qr');
      setQrCode(response.data.qr_code);
      setOpenQR(true);
    } catch (error) {
      toast.error('Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const desconectar = async () => {
    try {
      setLoading(true);
      await api.post('/whatsapp/desconectar');
      setStatus('desconectado');
      toast.success('WhatsApp desconectado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configurações do WhatsApp
      </Typography>

      <Grid container spacing={3}>
        {/* Status do WhatsApp */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WhatsAppIcon
                  color={status === 'conectado' ? 'success' : 'disabled'}
                  sx={{ fontSize: 40 }}
                />
                <Box>
                  <Typography variant="h6">
                    Status: {status === 'conectado' ? 'Conectado' : 'Desconectado'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {status === 'conectado'
                      ? 'Seu WhatsApp está conectado e pronto para receber pedidos'
                      : 'Conecte seu WhatsApp para receber pedidos'}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  {status === 'conectado' ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={desconectar}
                      disabled={loading}
                    >
                      Desconectar
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<QrCodeIcon />}
                      onClick={gerarQRCode}
                      disabled={loading}
                    >
                      Conectar WhatsApp
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Configurações Gerais */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configurações Gerais
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.ativo}
                      onChange={handleChange}
                      name="ativo"
                    />
                  }
                  label="Ativar integração com WhatsApp"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do WhatsApp"
                  name="numero_whatsapp"
                  value={config.numero_whatsapp}
                  onChange={handleChange}
                  placeholder="Ex: 5511999999999"
                  helperText="Digite apenas números, com DDD e código do país"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Mensagem de Boas-vindas"
                  name="mensagem_boas_vindas"
                  value={config.mensagem_boas_vindas}
                  onChange={handleChange}
                  placeholder="Olá! Seja bem-vindo à nossa loja..."
                  helperText="Esta mensagem será enviada quando um cliente iniciar uma conversa"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Mensagem de Pedido"
                  name="mensagem_pedido"
                  value={config.mensagem_pedido}
                  onChange={handleChange}
                  placeholder="Obrigado pelo seu pedido! Aqui estão os detalhes..."
                  helperText="Use {nome_cliente}, {numero_pedido}, {total} como variáveis"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificar_novos_pedidos}
                      onChange={handleChange}
                      name="notificar_novos_pedidos"
                    />
                  }
                  label="Receber notificações de novos pedidos"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificar_status_pedido}
                      onChange={handleChange}
                      name="notificar_status_pedido"
                    />
                  }
                  label="Notificar cliente sobre status do pedido"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={salvarConfig}
                disabled={loading}
              >
                Salvar Configurações
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={carregarConfig}
                disabled={loading}
              >
                Recarregar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog do QR Code */}
      <Dialog open={openQR} onClose={() => setOpenQR(false)}>
        <DialogTitle>Conectar WhatsApp</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {qrCode ? (
              <>
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Abra o WhatsApp no seu celular e escaneie o QR Code
                </Typography>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQR(false)}>Fechar</Button>
          <Button onClick={gerarQRCode} startIcon={<RefreshIcon />}>
            Gerar Novo QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsappConfig;
