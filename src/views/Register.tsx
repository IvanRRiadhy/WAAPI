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
  CircularProgress
} from '@mui/material';
import { IconEye, IconEyeOff, IconCheck, IconQrcode } from '@tabler/icons-react';
import { PhoneInput } from '../components/PhoneInput';
import axiosServices from '../utils/axios';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState('ID');
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // QR Scan simulated states
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isScanned, setIsScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    if (isScanned) {
      setIsScanned(false);
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsScanned(true);
    }, 1500);
  };

  const navigate = useNavigate();
  const theme = useTheme();

  const isFormFilled = !!(
    username.trim() &&
    company.trim() &&
    whatsapp.trim() &&
    email.trim() &&
    password &&
    confirmPassword
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setWhatsappError(null);

    // Verify all fields filled
    if (!username.trim() || !company.trim() || !whatsapp.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      if (!whatsapp.trim()) {
        setWhatsappError('PLEASE FILL OUT THE FIELD');
      }
      return;
    }

    // Validate WhatsApp (numbers only, between 8 and 13 digits for local number part)
    const isNumeric = /^\d+$/.test(whatsapp);
    if (!isNumeric) {
      setWhatsappError('Numbers only, excluding country code');
      setError('WhatsApp Number must contain digits only.');
      return;
    }
    if (whatsapp.length < 8 || whatsapp.length > 13) {
      setWhatsappError('Must be between 8 and 13 digits.');
      setError('WhatsApp Number must be between 8 and 13 digits.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await axiosServices.post('/api/auth/signup', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword
      });
      console.log(res);
      if(res.data.status === 'success'){
        setSuccess(res.data.msg);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.data.msg);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.msg || err.message || 'Registration failed. Please try again.');
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
        py: 4,
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

      <Card sx={{ maxWidth: 850, width: '100%', mx: 2, zIndex: 10 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 4 } }}>
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

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 1 }}>
            {/* Left Section: Form */}
            <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Register your WA Agent instance settings.
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

              <Box 
                component="form" 
                id="register-form"
                onSubmit={handleRegister} 
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="admin"
                />

                <TextField
                  fullWidth
                  label="Company / Organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="Acme Corp"
                />

                <PhoneInput
                  value={whatsapp}
                  onChange={(val) => {
                    setWhatsapp(val);
                    if (val.trim()) {
                      setWhatsappError(null);
                    }
                  }}
                  countryCode={countryCode}
                  onCountryCodeChange={(code) => setCountryCode(code)}
                  error={!!whatsappError}
                  helperText={whatsappError || undefined}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="example@waagent.com"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                            {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>

            {/* Visual Divider (Desktop only) */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'block' }, 
                width: '1px', 
                bgcolor: 'divider',
                alignSelf: 'stretch',
                my: 1
              }} 
            />

            {/* Right Section: WhatsApp Linking / QR Code */}
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 3,
                p: { xs: 2, md: 1 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Link WhatsApp Device
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, px: 2 }}>
                  Scan the QR code below using WhatsApp on your phone to authorize registration.
                </Typography>
              </Box>

              {/* QR Container */}
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: 200, 
                  height: 200, 
                  border: '1px solid',
                  borderColor: isScanned ? 'success.main' : 'divider',
                  borderRadius: 3,
                  p: 1.5,
                  bgcolor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                {/* QR Code image */}
                <Box 
                  component="img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=wa-agent-session-${sessionId}&color=000000&bgcolor=f8f9fa`}
                  alt="WhatsApp QR Code"
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    opacity: isScanning || isScanned ? 0.15 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* Scanning overlay */}
                {isScanning && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.02)',
                      gap: 1.5
                    }}
                  >
                    <CircularProgress size={36} thickness={5} color="primary" />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Verifying Scan...
                    </Typography>
                  </Box>
                )}

                {/* Scanned / Connected overlay */}
                {isScanned && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.92)',
                      gap: 1.5
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)'
                      }}
                    >
                      <IconCheck size={24} stroke={3} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Device Linked!
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Status and simulator controls */}
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: isScanned ? 'success.main' : isScanning ? 'primary.main' : 'warning.main',
                      animation: isScanning ? 'pulse 1s infinite' : !isScanned ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.4 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.4 }
                      }
                    }} 
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isScanned ? 'success.main' : 'text.secondary' }}>
                    {isScanned ? 'Device Linked' : isScanning ? 'Verifying link...' : 'Waiting for scan'}
                  </Typography>
                </Box>

                {/* Developer Simulator Button */}
                <Button
                  variant="outlined"
                  size="small"
                  color={isScanned ? 'error' : 'secondary'}
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  startIcon={isScanned ? undefined : <IconQrcode size={14} />}
                  sx={{ 
                    fontSize: '0.75rem', 
                    py: 0.5, 
                    px: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  {isScanned ? 'Simulate Unlink' : 'Simulate Phone Scan'}
                </Button>
              </Box>

              {/* Sign up Button moved here */}
              <Button 
                form="register-form"
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large"
                disabled={!isScanned || !isFormFilled}
                sx={{ 
                  py: 1.25, 
                  fontWeight: 700,
                  boxShadow: (isScanned && isFormFilled) ? theme.shadows[4] : 'none',
                  transition: 'all 0.2s ease',
                  '&:not(:disabled)': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
