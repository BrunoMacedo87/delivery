import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

const validationSchema = Yup.object({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: Yup.string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  preco: Yup.number()
    .required('Preço é obrigatório')
    .min(0, 'Preço não pode ser negativo'),
  quantidade_estoque: Yup.number()
    .required('Quantidade em estoque é obrigatória')
    .min(0, 'Quantidade não pode ser negativa')
    .integer('Quantidade deve ser um número inteiro'),
});

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const formik = useFormik({
    initialValues: {
      nome: '',
      descricao: '',
      preco: '',
      quantidade_estoque: '',
      imagem_url: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (editandoProduto) {
          await api.put(`/produtos/${editandoProduto.id}`, values);
          toast.success('Produto atualizado com sucesso!');
        } else {
          await api.post('/produtos', values);
          toast.success('Produto cadastrado com sucesso!');
        }
        carregarProdutos();
        handleCloseDialog();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Erro ao salvar produto');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (produto = null) => {
    if (produto) {
      setEditandoProduto(produto);
      formik.setValues({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade_estoque: produto.quantidade_estoque,
        imagem_url: produto.imagem_url || '',
      });
    } else {
      setEditandoProduto(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditandoProduto(null);
    formik.resetForm();
  };

  const handleDeleteProduto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        toast.success('Produto excluído com sucesso!');
        carregarProdutos();
      } catch (error) {
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      const response = await api.post('/upload/imagem', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      formik.setFieldValue('imagem_url', response.data.url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Gerenciar Produtos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Produto
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {produtos.map((produto) => (
            <Grid item xs={12} sm={6} md={4} key={produto.id}>
              <Card>
                {produto.imagem_url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={produto.imagem_url}
                    alt={produto.nome}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {produto.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {produto.descricao}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {produto.preco.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Em estoque: {produto.quantidade_estoque}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleOpenDialog(produto)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduto(produto.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editandoProduto ? 'Editar Produto' : 'Novo Produto'}
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Nome do Produto"
            name="nome"
            value={formik.values.nome}
            onChange={formik.handleChange}
            error={formik.touched.nome && Boolean(formik.errors.nome)}
            helperText={formik.touched.nome && formik.errors.nome}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Descrição"
            name="descricao"
            multiline
            rows={3}
            value={formik.values.descricao}
            onChange={formik.handleChange}
            error={formik.touched.descricao && Boolean(formik.errors.descricao)}
            helperText={formik.touched.descricao && formik.errors.descricao}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Preço</InputLabel>
            <OutlinedInput
              name="preco"
              type="number"
              startAdornment={<InputAdornment position="start">R$</InputAdornment>}
              value={formik.values.preco}
              onChange={formik.handleChange}
              error={formik.touched.preco && Boolean(formik.errors.preco)}
              label="Preço"
            />
            {formik.touched.preco && formik.errors.preco && (
              <Typography color="error" variant="caption">
                {formik.errors.preco}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Quantidade em Estoque"
            name="quantidade_estoque"
            type="number"
            value={formik.values.quantidade_estoque}
            onChange={formik.handleChange}
            error={formik.touched.quantidade_estoque && Boolean(formik.errors.quantidade_estoque)}
            helperText={formik.touched.quantidade_estoque && formik.errors.quantidade_estoque}
          />

          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="imagem-produto"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="imagem-produto">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Enviando...' : 'Enviar Imagem'}
              </Button>
            </label>
            {formik.values.imagem_url && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Imagem selecionada
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
            <Button variant="outlined" onClick={handleCloseDialog}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default GerenciarProdutos;
