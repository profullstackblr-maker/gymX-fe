import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  FitnessCenter as GymIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Members', path: '/members', icon: <PeopleIcon /> },
];

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2.5,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        }}
      >
        <GymIcon sx={{ color: '#e94560', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>
          GymX
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: '#fff' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Nav Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? '#fff' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#fff' : 'text.secondary',
                    minWidth: 40,
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Admin Info + Logout */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}
          >
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {admin?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {admin?.email || ''}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar (mobile) */}
      <AppBar
        position="fixed"
        sx={{
          display: { md: 'none' },
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <GymIcon sx={{ color: '#e94560', mr: 1 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing={1}>
            GymX
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar - desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '2px 0 8px rgba(0,0,0,0.08)' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar - mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 7, md: 0 },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
