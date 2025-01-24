import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pedidosHoje: 0,
    vendasHoje: 0,
    produtosAtivos: 0,
    produtosBaixoEstoque: 0,
  });
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [vendasPorDia, setVendasPorDia] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [statsResponse, pedidosResponse, vendasResponse] = await Promise.all([
        api.get('/estatisticas/dashboard'),
        api.get('/pedidos/ultimos'),
        api.get('/estatisticas/vendas-por-dia'),
      ]);

      setStats(statsResponse.data);
      setUltimosPedidos(pedidosResponse.data);
      setVendasPorDia(vendasResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const CardEstatistica = ({ titulo, valor, icon, cor, subtexto }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {titulo}
            </Typography>
            <Typography variant="h4" component="div">
              {valor}
            </Typography>
            {subtexto && (
              <Typography variant="body2" color="textSecondary">
                {subtexto}
              </Typography>
            )}
          </Box>
          <IconButton
            sx={{
              backgroundColor: `${cor}.light`,
              color: `${cor}.main`,
              '&:hover': { backgroundColor: `${cor}.light` },
            }}
          >
            {icon}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo, {user?.nome}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Aqui está um resumo do seu negócio hoje
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <CardEstatistica
            titulo="Pedidos Hoje"
            valor={stats.pedidosHoje}
            icon={<ShoppingCartIcon />}
            cor="primary"
            subtexto="Novos pedidos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardEstatistica
            titulo="Vendas Hoje"
            valor={`R$ ${stats.vendasHoje.toFixed(2)}`}
            icon={<MoneyIcon />}
            cor="success"
            subtexto="Faturamento"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardEstatistica
            titulo="Produtos Ativos"
            valor={stats.produtosAtivos}
            icon={<InventoryIcon />}
            cor="info"
            subtexto="Em catálogo"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardEstatistica
            titulo="Baixo Estoque"
            valor={stats.produtosBaixoEstoque}
            icon={<TrendingUpIcon />}
            cor="warning"
            subtexto="Precisam reposição"
          />
        </Grid>

        {/* Gráfico de Vendas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Vendas dos Últimos 7 Dias
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#1976d2" name="Vendas (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Últimos Pedidos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Últimos Pedidos
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin/pedidos')}
              >
                Ver Todos
              </Button>
            </Box>
            <List>
              {ultimosPedidos.map((pedido, index) => (
                <React.Fragment key={pedido.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => window.open(`https://wa.me/${pedido.cliente_telefone}`, '_blank')}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`Pedido #${pedido.id}`}
                      secondary={`R$ ${pedido.valor_total.toFixed(2)} - ${pedido.status}`}
                    />
                  </ListItem>
                  {index < ultimosPedidos.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Links Rápidos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Links Rápidos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<InventoryIcon />}
                onClick={() => navigate('/admin/produtos')}
              >
                Gerenciar Produtos
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate('/admin/pedidos')}
              >
                Ver Pedidos
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.open(`/e/${user?.empresa?.slug}`, '_blank')}
              >
                Visualizar Loja
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
