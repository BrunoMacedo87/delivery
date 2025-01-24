import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListSubheader,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Domain as DomainIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuCatalogo, setMenuCatalogo] = React.useState(true);
  const [menuVendas, setMenuVendas] = React.useState(true);
  const [menuConfiguracao, setMenuConfiguracao] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/admin/login');
  };

  // Verifica se o caminho atual corresponde ao item do menu
  const isCurrentPath = (path) => location.pathname === path;

  const menuGroups = [
    {
      header: null,
      items: [
        { 
          text: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/admin',
          notification: null
        }
      ]
    },
    {
      header: 'Catálogo',
      state: menuCatalogo,
      setState: setMenuCatalogo,
      items: [
        {
          text: 'Produtos',
          icon: <InventoryIcon />,
          path: '/admin/produtos',
          notification: null
        },
        {
          text: 'Categorias',
          icon: <CategoryIcon />,
          path: '/admin/categorias',
          notification: null
        }
      ]
    },
    {
      header: 'Vendas',
      state: menuVendas,
      setState: setMenuVendas,
      items: [
        {
          text: 'Pedidos',
          icon: <ShoppingCartIcon />,
          path: '/admin/pedidos',
          notification: '5'
        },
        {
          text: 'Clientes',
          icon: <PeopleIcon />,
          path: '/admin/clientes',
          notification: null
        },
        {
          text: 'Entregas',
          icon: <ShippingIcon />,
          path: '/admin/entregas',
          notification: null
        }
      ]
    },
    {
      header: 'Relatórios',
      items: [
        {
          text: 'Vendas',
          icon: <AssessmentIcon />,
          path: '/admin/relatorios/vendas',
          notification: null
        }
      ]
    },
    {
      header: 'Configurações',
      state: menuConfiguracao,
      setState: setMenuConfiguracao,
      items: [
        {
          text: 'Domínio',
          icon: <DomainIcon />,
          path: '/admin/dominio',
          notification: null
        },
        {
          text: 'WhatsApp',
          icon: <WhatsAppIcon />,
          path: '/admin/whatsapp',
          notification: null
        },
        {
          text: 'Pagamentos',
          icon: <PaymentIcon />,
          path: '/admin/pagamentos',
          notification: null
        },
        {
          text: 'Configurações',
          icon: <SettingsIcon />,
          path: '/admin/configuracoes',
          notification: null
        }
      ]
    }
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          {user?.empresa?.nome || 'Painel Admin'}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ width: '100%' }}>
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={group.header || groupIndex}>
            {group.header && (
              <>
                <ListItem
                  button
                  onClick={() => group.setState?.(!group.state)}
                  sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                >
                  <ListItemText
                    primary={group.header}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'textSecondary',
                    }}
                  />
                  {group.setState && (
                    group.state ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItem>
                <Collapse in={group.state ?? true} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.items.map((item) => (
                      <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                          navigate(item.path);
                          setMobileOpen(false);
                        }}
                        selected={isCurrentPath(item.path)}
                        sx={{
                          pl: 4,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemIcon>
                          {item.notification ? (
                            <Badge badgeContent={item.notification} color="error">
                              {item.icon}
                            </Badge>
                          ) : (
                            item.icon
                          )}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            )}
            {!group.header && group.items.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={isCurrentPath(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            {groupIndex < menuGroups.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.empresa?.nome || 'Painel Administrativo'}
          </Typography>

          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar
              alt={user?.nome}
              src={user?.avatar}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/admin/perfil');
            }}>
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/admin/configuracoes');
            }}>
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhor desempenho em mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
