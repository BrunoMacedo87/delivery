import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link
} from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const validationSchema = Yup.object({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone: Yup.string()
    .required('Telefone é obrigatório')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  senha: Yup.string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: Yup.string()
    .oneOf([Yup.ref('senha'), null], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
});

const Cadastro = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      nome: '',
      telefone: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.post('/registrar', {
          nome: values.nome,
          telefone: values.telefone,
          email: values.email,
          senha: values.senha,
        });
        
        toast.success('Cadastro realizado com sucesso!');
        navigate('/login');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Erro ao realizar cadastro');
      }
    },
  });

  const formatarTelefone = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      formik.setFieldValue('telefone', value);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Cadastro
          </Typography>
          
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Nome"
              name="nome"
              value={formik.values.nome}
              onChange={formik.handleChange}
              error={formik.touched.nome && Boolean(formik.errors.nome)}
              helperText={formik.touched.nome && formik.errors.nome}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Telefone"
              name="telefone"
              value={formik.values.telefone}
              onChange={formatarTelefone}
              error={formik.touched.telefone && Boolean(formik.errors.telefone)}
              helperText={formik.touched.telefone && formik.errors.telefone}
              placeholder="(99) 99999-9999"
            />

            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Senha"
              name="senha"
              type="password"
              value={formik.values.senha}
              onChange={formik.handleChange}
              error={formik.touched.senha && Boolean(formik.errors.senha)}
              helperText={formik.touched.senha && formik.errors.senha}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirmar Senha"
              name="confirmarSenha"
              type="password"
              value={formik.values.confirmarSenha}
              onChange={formik.handleChange}
              error={formik.touched.confirmarSenha && Boolean(formik.errors.confirmarSenha)}
              helperText={formik.touched.confirmarSenha && formik.errors.confirmarSenha}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3, mb: 2 }}
            >
              Cadastrar
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                Já tem uma conta? Faça login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Cadastro;
