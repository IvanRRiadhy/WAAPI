import { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { 
  IconUpload,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { RouterProvider } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { getAppTheme } from './theme';
import { router } from './router';
import { ThemeToggleContext } from './context/ThemeToggleContext';
import { useInitial, useMachineId, useActivateLicense } from './hooks/useLicense';

function App() {
  const themeMode = 'light';
  const theme = getAppTheme(themeMode);
  const toggleTheme = () => {};

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  // Queries & Mutations for License Validation
  const { isLoading: isInitialLoading, isSuccess: isInitialSuccess, isError: isInitialError } = useInitial();
  const { data: machineId, isLoading: isLoadingMachineId, isError: isMachineIdError, refetch: refetchMachineId } = useMachineId();
  const activateLicenseMutation = useActivateLicense();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isInitialError) {
      localStorage.clear();
      queryClient.removeQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key !== 'initial' && key !== 'machine-id';
        }
      });
    }
  }, [isInitialError, queryClient]);

  if (isInitialLoading) {
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

  if (!isInitialSuccess) {
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
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                    Activate License
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Please upload any license configuration file to access the console.
                  </Typography>
                </Box>

                {/* Machine ID Fetcher */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: themeMode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'text.secondary', 
                      display: 'block', 
                      mb: 1, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}
                  >
                    Machine ID
                  </Typography>
                  {isLoadingMachineId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <CircularProgress size={16} thickness={5} />
                      <Typography variant="body2" color="text.secondary">
                        Fetching machine ID...
                      </Typography>
                    </Box>
                  ) : isMachineIdError ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="error">
                        Failed to fetch Machine ID
                      </Typography>
                      <Button 
                        size="small" 
                        variant="text" 
                        onClick={() => refetchMachineId()} 
                        sx={{ minWidth: 'auto', p: 0, textTransform: 'none' }}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 600, 
                          wordBreak: 'break-all',
                          bgcolor: themeMode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          flex: 1,
                        }}
                      >
                        {typeof machineId === 'object' && machineId !== null
                          ? (machineId as any).machineId || JSON.stringify(machineId)
                          : machineId}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          if (machineId) {
                            const textToCopy = typeof machineId === 'object'
                              ? (machineId as any).machineId || JSON.stringify(machineId)
                              : machineId;
                            navigator.clipboard.writeText(textToCopy);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        color={copied ? "success" : "default"}
                      >
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </IconButton>
                    </Box>
                  )}
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

                {/* Error message */}
                {activateLicenseMutation.isError && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    {((activateLicenseMutation.error as any)?.response?.data?.message || 
                      activateLicenseMutation.error.message || 
                      'Invalid or expired license file')}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  disabled={!selectedFile || activateLicenseMutation.isPending}
                  onClick={() => {
                    if (selectedFile) {
                      activateLicenseMutation.mutate({ file: selectedFile });
                    }
                  }}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  {activateLicenseMutation.isPending ? 'Activating...' : 'Submit & Activate'}
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
