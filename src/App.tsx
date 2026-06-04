import { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  Typography, 
  IconButton, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
} from '@mui/material';
import { 
  IconSun, 
  IconMoon, 
  IconUpload,
} from '@tabler/icons-react';
import { RouterProvider } from 'react-router';
import { getAppTheme } from './theme';
import { router } from './router';
import { ThemeToggleContext } from './context/ThemeToggleContext';

function App() {
  // Theme state initialization
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const theme = getAppTheme(themeMode);

  useEffect(() => {
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // License validation states
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);
  const [currentBootToken, setCurrentBootToken] = useState<string | null>(null);
  const [isLoadingLicense, setIsLoadingLicense] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch boot token to check for first launch/restart
  useEffect(() => {
    fetch('/api/boot-token')
      .then((res) => res.json())
      .then((data) => {
        setCurrentBootToken(data.bootToken);
        const savedToken = localStorage.getItem('bootToken');
        if (savedToken === data.bootToken) {
          setIsLicenseVerified(true);
        }
        setIsLoadingLicense(false);
      })
      .catch((err) => {
        console.error('Failed to load boot token:', err);
        // Fallback to verified for static builds or fallback environments
        setIsLicenseVerified(true);
        setIsLoadingLicense(false);
      });
  }, []);

  if (isLoadingLicense) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            minHeight: '100vh', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  if (!isLicenseVerified) {
    return (
      <ThemeToggleContext.Provider value={{ themeMode, toggleTheme }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
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
            {/* Decorative Blur Orbs */}
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
                opacity: themeMode === 'light' ? 0.25 : 0.15, 
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
                opacity: themeMode === 'light' ? 0.25 : 0.15, 
                background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
              }}
            />

            <Card sx={{ maxWidth: 450, width: '100%', mx: 2, zIndex: 10 }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 4 } }}>
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
                  
                  {/* <IconButton 
                    onClick={toggleTheme}
                    color="primary"
                    sx={{ 
                      p: 1,
                      borderRadius: 2.5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {themeMode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                  </IconButton> */}
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                    Activate License
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Please upload any license configuration file to access the console.
                  </Typography>
                </Box>

                {/* Upload Zone */}
                <Box>
                  <input 
                    type="file" 
                    id="license-file-upload" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        setSelectedFile(files[0]);
                      }
                    }} 
                  />
                  
                  <Box 
                    component="label" 
                    htmlFor="license-file-upload"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      py: 4,
                      px: 3,
                      border: '2px dashed',
                      borderColor: selectedFile ? 'primary.main' : 'divider',
                      borderRadius: 3,
                      cursor: 'pointer',
                      bgcolor: selectedFile ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: themeMode === 'light' ? 'rgba(99, 102, 241, 0.02)' : 'rgba(129, 140, 248, 0.04)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconUpload size={32} color={selectedFile ? theme.palette.primary.main : theme.palette.text.secondary} />
                    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      {selectedFile ? selectedFile.name : 'Choose a license file'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'Supports any file extension'}
                    </Typography>
                  </Box>
                </Box>

                {/* Submit Button */}
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  disabled={!selectedFile}
                  onClick={() => {
                    if (selectedFile && currentBootToken) {
                      localStorage.setItem('bootToken', currentBootToken);
                      setIsLicenseVerified(true);
                    }
                  }}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Submit & Activate
                </Button>
              </CardContent>
            </Card>
          </Box>
        </ThemeProvider>
      </ThemeToggleContext.Provider>
    );
  }

  return (
    <ThemeToggleContext.Provider value={{ themeMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
}

export default App;
