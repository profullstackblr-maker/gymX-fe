import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a2e',
      light: '#16213e',
      dark: '#0f3460',
    },
    secondary: {
      main: '#e94560',
      light: '#ff6b81',
      dark: '#c0392b',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    success: { main: '#2ecc71' },
    warning: { main: '#f39c12' },
    error: { main: '#e74c3c' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

// Waits for auth check before rendering — prevents flash-redirect to /login
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Redirect already-logged-in users away from /login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/"
      element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="members" element={<MembersPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
