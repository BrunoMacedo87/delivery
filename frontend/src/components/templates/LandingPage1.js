import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const LandingPage1 = ({ empresa, produtos }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const customTheme = {
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        main: empresa.cor_primaria || '#1976d2',
      },
      secondary: {
        main: empresa.cor_secundaria || '#dc004e',
      },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: customTheme.palette.primary.main,
          color: 'white',
          py: 4,
          mb: 4,
        }}
      >
        <Container>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={3}>
              {empresa.logo_url && (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nome}
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h3" component="h1" gutterBottom>
                {empresa.nome}
              </Typography>
              <Typography variant="h6" component="h2">
                {empresa.descricao}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Produtos em Destaque */}
      <Container sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Produtos em Destaque
        </Typography>
        <Grid container spacing={3}>
          {produtos?.slice(0, 6).map((produto) => (
            <Grid item xs={12} sm={6} md={4} key={produto.id}>
              <Card>
                {produto.imagem_url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={produto.imagem_url}
                    alt={produto.nome}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {produto.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {produto.descricao}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {produto.preco.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = `/produtos/${produto.id}`}
                  >
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contato */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Entre em Contato
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {empresa.whatsapp && (
              <Grid item>
                <IconButton
                  color="success"
                  size="large"
                  onClick={() => window.open(`https://wa.me/${empresa.whatsapp}`, '_blank')}
                >
                  <WhatsAppIcon fontSize="large" />
                </IconButton>
              </Grid>
            )}
            {empresa.telefone && (
              <Grid item>
                <IconButton
                  color="primary"
                  size="large"
                  onClick={() => window.location.href = `tel:${empresa.telefone}`}
                >
                  <PhoneIcon fontSize="large" />
                </IconButton>
              </Grid>
            )}
            {empresa.email && (
              <Grid item>
                <IconButton
                  color="primary"
                  size="large"
                  onClick={() => window.location.href = `mailto:${empresa.email}`}
                >
                  <EmailIcon fontSize="large" />
                </IconButton>
              </Grid>
            )}
          </Grid>
          {empresa.endereco && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                <LocationIcon /> {empresa.endereco}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage1;
