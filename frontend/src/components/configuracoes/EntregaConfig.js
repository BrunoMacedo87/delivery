import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EntregaConfig = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    entrega_ativa: false,
    tempo_estimado: '',
    valor_minimo_frete_gratis: '',
    raio_entrega: '',
    tipos_entrega: [],
    regioes_entrega: [],
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editandoRegiao, setEditandoRegiao] = useState(null);
  const [novaRegiao, setNovaRegiao] = useState({
    nome: '',
    cep_inicial: '',
    cep_final: '',
    valor_entrega: '',
    tempo_estimado: '',
  });

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/configuracoes/entrega');
      setConfig(response.data);
    } catch (error) {
      toast.error('Erro ao carregar configurações de entrega');
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

  const handleRegiaoChange = (e) => {
    const { name, value } = e.target;
    setNovaRegiao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvar = async () => {
    try {
      setLoading(true);
      await api.post('/configuracoes/entrega', config);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarRegiao = () => {
    if (editandoRegiao !== null) {
      // Editando região existente
      const novasRegioes = config.regioes_entrega.map((regiao, index) =>
        index === editandoRegiao ? novaRegiao : regiao
      );
      setConfig(prev => ({
        ...prev,
        regioes_entrega: novasRegioes
      }));
      toast.success('Região atualizada com sucesso!');
    } else {
      // Adicionando nova região
      setConfig(prev => ({
        ...prev,
        regioes_entrega: [...prev.regioes_entrega, novaRegiao]
      }));
      toast.success('Região adicionada com sucesso!');
    }
    handleCloseDialog();
  };

  const handleEditarRegiao = (index) => {
    setEditandoRegiao(index);
    setNovaRegiao(config.regioes_entrega[index]);
    setOpenDialog(true);
  };

  const handleRemoverRegiao = (index) => {
    const novasRegioes = config.regioes_entrega.filter((_, i) => i !== index);
    setConfig(prev => ({
      ...prev,
      regioes_entrega: novasRegioes
    }));
    toast.success('Região removida com sucesso!');
  };

  const handleOpenDialog = () => {
    setNovaRegiao({
      nome: '',
      cep_inicial: '',
      cep_final: '',
      valor_entrega: '',
      tempo_estimado: '',
    });
    setEditandoRegiao(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditandoRegiao(null);
    setNovaRegiao({
      nome: '',
      cep_inicial: '',
      cep_final: '',
      valor_entrega: '',
      tempo_estimado: '',
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configurações de Entrega
      </Typography>

      <Grid container spacing={3}>
        {/* Card de Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShippingIcon
                  color={config.entrega_ativa ? 'success' : 'disabled'}
                  sx={{ fontSize: 40 }}
                />
                <Box>
                  <Typography variant="h6">
                    Status da Entrega: {config.entrega_ativa ? 'Ativo' : 'Inativo'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {config.entrega_ativa
                      ? `${config.regioes_entrega.length} regiões configuradas`
                      : 'Configure as regiões de entrega'}
                  </Typography>
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
                      checked={config.entrega_ativa}
                      onChange={handleChange}
                      name="entrega_ativa"
                    />
                  }
                  label="Ativar sistema de entrega"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tempo Estimado Padrão"
                  name="tempo_estimado"
                  value={config.tempo_estimado}
                  onChange={handleChange}
                  placeholder="Ex: 30-45 minutos"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor Mínimo para Frete Grátis"
                  name="valor_minimo_frete_gratis"
                  type="number"
                  value={config.valor_minimo_frete_gratis}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Raio de Entrega (km)"
                  name="raio_entrega"
                  type="number"
                  value={config.raio_entrega}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Regiões de Entrega */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Regiões de Entrega
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Adicionar Região
              </Button>
            </Box>

            <List>
              {config.regioes_entrega.map((regiao, index) => (
                <ListItem
                  key={index}
                  divider={index < config.regioes_entrega.length - 1}
                >
                  <ListItemText
                    primary={regiao.nome}
                    secondary={`CEP: ${regiao.cep_inicial} - ${regiao.cep_final} | Valor: R$ ${regiao.valor_entrega} | Tempo: ${regiao.tempo_estimado}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditarRegiao(index)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoverRegiao(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de Região */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editandoRegiao !== null ? 'Editar Região' : 'Nova Região de Entrega'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Região"
                name="nome"
                value={novaRegiao.nome}
                onChange={handleRegiaoChange}
                placeholder="Ex: Zona Sul"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CEP Inicial"
                name="cep_inicial"
                value={novaRegiao.cep_inicial}
                onChange={handleRegiaoChange}
                placeholder="00000-000"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CEP Final"
                name="cep_final"
                value={novaRegiao.cep_final}
                onChange={handleRegiaoChange}
                placeholder="00000-000"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor da Entrega"
                name="valor_entrega"
                type="number"
                value={novaRegiao.valor_entrega}
                onChange={handleRegiaoChange}
                InputProps={{
                  startAdornment: 'R$',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tempo Estimado"
                name="tempo_estimado"
                value={novaRegiao.tempo_estimado}
                onChange={handleRegiaoChange}
                placeholder="30-45 minutos"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAdicionarRegiao}
            startIcon={<SaveIcon />}
          >
            {editandoRegiao !== null ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botões de Ação */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSalvar}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Salvar Configurações'}
        </Button>
      </Box>
    </Box>
  );
};

export default EntregaConfig;
