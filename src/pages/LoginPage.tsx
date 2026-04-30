import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  FitnessCenter as GymIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const validate = () => {
    const errors = { email: '', password: '' };
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!validate()) return;
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setLoginError(result.message || 'Invalid credentials.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #e94560, #c0392b)',
              mb: 2,
              boxShadow: '0 8px 24px rgba(233, 69, 96, 0.4)',
            }}
          >
            <GymIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="#fff" letterSpacing={2}>
            GymX
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={0.5}>
            Gym Management System
          </Typography>
        </Box>

        {/* Card */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Sign in to your admin account
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                  '&:hover': { background: 'linear-gradient(135deg, #0f3460, #1a1a2e)' },
                  fontSize: 16,
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'grey.300',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                Default Credentials (after seeding)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Email: admin@gymx.com
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Password: admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="rgba(255,255,255,0.4)" display="block" textAlign="center" mt={3}>
          © {new Date().getFullYear()} GymX. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
