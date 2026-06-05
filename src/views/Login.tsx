import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  Alert,
  Link,
  useTheme,
  Divider
} from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import axiosServices from '../utils/axios';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const usernameVal = username.trim();
    const passwordVal = password;

    if (!usernameVal || !passwordVal) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await axiosServices.post('/api/auth/login', {
        username: usernameVal,
        password: passwordVal,
      });

      const token = res.data.collection.token || res.data.collection.accessToken || res.data.collection.data?.token || res.data.data?.accessToken;
      if (!token) {
        throw new Error('No authentication token received from server.');
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token);
      
      const userData = res.data.collection.user || { name: usernameVal, email: usernameVal };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Invalid username or password.');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Blur Orbs */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -150, 
          right: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
        }}
      />

      <Card sx={{ maxWidth: 450, width: '100%', mx: 2, zIndex: 10 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3.5, '&:last-child': { pb: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                component="img"
                src="/logoOnlyBio.png"
                alt="WA Agent Logo"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  objectFit: 'contain',
                }}
              />
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
                WA Agent
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Access the administrator panel and configure your agents.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="admin"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Sign In
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
              💡 DEMO CREDENTIALS:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
              Username: admin
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
              Password: P@ssw0rd
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
