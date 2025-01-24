import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const VitrineProdutos = ({ empresa }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carrinho, setCarrinho] = useState([]);
  const [openCarrinho, setOpenCarrinho] = useState(false);
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/produtos/empresa/${empresa.id}`);
      setProdutos(response.data.filter(p => p.quantidade_estoque > 0));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar produtos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prevCarrinho => {
      const itemExistente = prevCarrinho.find(item => item.id === produto.id);
      if (itemExistente) {
        return prevCarrinho.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: Math.min(item.quantidade + 1, produto.quantidade_estoque) }
            : item
        );
      }
      return [...prevCarrinho, { ...produto, quantidade: 1 }];
    });
    setSnackbar({
      open: true,
      message: 'Produto adicionado ao carrinho',
      severity: 'success'
    });
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(prevCarrinho => {
      const itemExistente = prevCarrinho.find(item => item.id === produtoId);
      if (itemExistente.quantidade === 1) {
        return prevCarrinho.filter(item => item.id !== produtoId);
      }
      return prevCarrinho.map(item =>
        item.id === produtoId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      );
    });
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const formatarMensagemWhatsApp = () => {
    const mensagem = `Olá! Gostaria de fazer um pedido:\n\n`;
    const itensPedido = carrinho.map(item =>
      `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`
    ).join('\n');
    const total = `\n\nTotal: R$ ${calcularTotal().toFixed(2)}`;
    return encodeURIComponent(mensagem + itensPedido + total);
  };

  const enviarPedido = async () => {
    if (!telefoneCliente) {
      setSnackbar({
        open: true,
        message: 'Por favor, informe seu telefone',
        severity: 'error'
      });
      return;
    }

    try {
      setEnviandoPedido(true);
      const pedido = {
        empresa_id: empresa.id,
        cliente_telefone: telefoneCliente,
        itens: carrinho.map(item => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        }))
      };

      await api.post('/pedidos', pedido);
      
      // Enviar mensagem via WhatsApp
      const mensagem = formatarMensagemWhatsApp();
      window.open(`https://wa.me/${empresa.telefone}?text=${mensagem}`, '_blank');

      setCarrinho([]);
      setOpenCarrinho(false);
      setTelefoneCliente('');
      
      setSnackbar({
        open: true,
        message: 'Pedido enviado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao enviar pedido',
        severity: 'error'
      });
    } finally {
      setEnviandoPedido(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Nossos Produtos
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setOpenCarrinho(true)}
          disabled={carrinho.length === 0}
        >
          <Badge badgeContent={carrinho.length} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
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
                    <Typography variant="body2" color="text.secondary">
                      Sem imagem
                    </Typography>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {produto.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {produto.descricao}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    R$ {produto.preco.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => adicionarAoCarrinho(produto)}
                    disabled={
                      produto.quantidade_estoque === 0 ||
                      (carrinho.find(item => item.id === produto.id)?.quantidade || 0) >= produto.quantidade_estoque
                    }
                  >
                    Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog do Carrinho */}
      <Dialog
        open={openCarrinho}
        onClose={() => setOpenCarrinho(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seu Carrinho</DialogTitle>
        <DialogContent>
          {carrinho.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle1">{item.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  R$ {item.preco.toFixed(2)} x {item.quantidade}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => removerDoCarrinho(item.id)}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography>{item.quantidade}</Typography>
                <IconButton
                  size="small"
                  onClick={() => adicionarAoCarrinho(item)}
                  disabled={item.quantidade >= item.quantidade_estoque}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: R$ {calcularTotal().toFixed(2)}
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Seu Telefone (WhatsApp)"
            value={telefoneCliente}
            onChange={(e) => setTelefoneCliente(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCarrinho(false)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={enviarPedido}
            disabled={enviandoPedido || carrinho.length === 0}
          >
            {enviandoPedido ? 'Enviando...' : 'Enviar Pedido'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VitrineProdutos;
