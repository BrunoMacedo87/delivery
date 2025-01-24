import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import InputMask from 'react-input-mask';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CadastroEmpresa = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const response = await api.get('/empresas');
      setEmpresas(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Remove máscaras antes de salvar
    if (name === 'cnpj') processedValue = value.replace(/\D/g, '');
    if (name === 'cep') processedValue = value.replace(/\D/g, '');
    if (name === 'telefone') processedValue = value.replace(/\D/g, '');
    if (name === 'slug') processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/empresas/${editingId}`, formData);
      } else {
        await api.post('/empresas', formData);
      }
      loadEmpresas();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert(error.response?.data?.detail || 'Erro ao salvar empresa');
    }
  };

  const handleEdit = (empresa) => {
    setFormData({
      nome: empresa.nome,
      slug: empresa.slug,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      telefone: empresa.telefone
    });
    setEditingId(empresa.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await api.delete(`/empresas/${id}`);
        loadEmpresas();
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
        alert('Erro ao excluir empresa');
      }
    }
  };

  const handleLogoUpload = async (empresaId, file) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      await api.post(`/empresas/${empresaId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      loadEmpresas();
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      alert('Erro ao fazer upload da logo');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      nome: '',
      slug: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: ''
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              Empresas
            </Typography>
          </Grid>
          <Grid item>
            {empresas.length === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Cadastrar Empresa
              </Button>
            )}
          </Grid>
        </Grid>

        {empresas.length === 0 ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Você ainda não possui empresas cadastradas.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {empresas.map((empresa) => (
              <Grid item xs={12} md={6} key={empresa.id}>
                <Card>
                  {empresa.logo_url ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${process.env.REACT_APP_API_URL}${empresa.logo_url}`}
                      alt={empresa.nome}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}
                    >
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`logo-upload-${empresa.id}`}
                        type="file"
                        onChange={(e) => handleLogoUpload(empresa.id, e.target.files[0])}
                      />
                      <label htmlFor={`logo-upload-${empresa.id}`}>
                        <IconButton component="span">
                          <UploadIcon />
                        </IconButton>
                      </label>
                    </Box>
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {empresa.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CNPJ: {empresa.cnpj}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {empresa.cidade} - {empresa.estado}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(empresa)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(empresa.id)}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Editar Empresa' : 'Cadastrar Empresa'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Slug (URL amigável)"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    helperText="Apenas letras minúsculas, números e hífen"
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputMask
                    mask="99.999.999/9999-99"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                  >
                    {() => (
                      <TextField
                        fullWidth
                        label="CNPJ"
                        name="cnpj"
                        required
                      />
                    )}
                  </InputMask>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    inputProps={{ maxLength: 2 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <InputMask
                    mask="99999-999"
                    value={formData.cep}
                    onChange={handleInputChange}
                  >
                    {() => (
                      <TextField
                        fullWidth
                        label="CEP"
                        name="cep"
                        required
                      />
                    )}
                  </InputMask>
                </Grid>
                <Grid item xs={6}>
                  <InputMask
                    mask="(99) 9999-99999"
                    value={formData.telefone}
                    onChange={handleInputChange}
                  >
                    {() => (
                      <TextField
                        fullWidth
                        label="Telefone"
                        name="telefone"
                        required
                      />
                    )}
                  </InputMask>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" variant="contained" color="primary">
                {editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CadastroEmpresa;
