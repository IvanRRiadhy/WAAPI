import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Button, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  CircularProgress,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { 
  IconPlus, 
  IconTrash, 
  IconPlug,
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconCheck
} from '@tabler/icons-react';
import { useAgentList } from '../hooks/useAgents';
import { 
  useIntegration, 
  useCreateApiKey, 
  useDeleteApiKey, 
  useAssignAgent, 
  useIntegrationAgents
} from '../hooks/useIntegration';
import type { IntegrationItem } from '../hooks/useIntegration';
import axiosServices from '../utils/axios';

// ── CHILD COMPONENT: Integration Card ──────────────────────────────────────
interface IntegrationCardProps {
  item: IntegrationItem;
  availableAgents: any[];
  onDelete: (id: string, e: React.MouseEvent) => void;
  onViewApiKey: (item: IntegrationItem) => void;
  onCardClick: (item: IntegrationItem, agents: string[]) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  item,
  availableAgents,
  onDelete,
  onViewApiKey,
  onCardClick
}) => {
  const { data: agentsData, isLoading: isAgentsLoading } = useIntegrationAgents(item.id);

  // Extract linked agents (id and name) from response robustly
  const getLinkedAgents = (response: any): { id: string; name: string }[] => {
    if (!response) return [];
    const list = response.collection || response.data || response;
    if (!Array.isArray(list)) return [];
    return list.map((a: any) => {
      if (!a) return null;
      if (typeof a === 'string') {
        const found = availableAgents.find(ag => ag.id === a);
        return { id: a, name: found ? found.name : a };
      }
      if (typeof a === 'number') {
        const idStr = String(a);
        const found = availableAgents.find(ag => ag.id === idStr);
        return { id: idStr, name: found ? found.name : idStr };
      }
      
      const agentObj = a.agent || {};
      const agentId = agentObj.id || a.agentId || a.id || '';
      const agentName = agentObj.name || a.name || agentId;
      
      if (!agentId) return null;
      return { id: agentId, name: agentName };
    }).filter(Boolean) as { id: string; name: string }[];
  };

  const linkedAgents = getLinkedAgents(agentsData);

  const getMaskedApiKey = (key: string) => {
    if (!key) return '••••••••••••••••';
    if (key.length > 8) {
      return `${key.slice(0, 3)}••••••••${key.slice(-3)}`;
    }
    return '••••••••••••••••';
  };

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card 
        onClick={() => onCardClick(item, linkedAgents.map(la => la.id))}
        sx={{ 
          height: '350px', 
          display: 'flex', 
          flexDirection: 'column', 
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: 'primary.main',
            boxShadow: (theme) => theme.palette.mode === 'light' 
              ? '0 12px 24px -10px rgba(225, 29, 72, 0.12)' 
              : '0 12px 24px -10px rgba(251, 113, 133, 0.18)',
          }
        }}
      >
        <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, '&:last-child': { pb: 3 }, height: '100%', boxSizing: 'border-box' }}>
          {/* Status header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: 'primary.main',
              }}
            >
              <IconPlug size={20} />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                color="error" 
                onClick={(e) => onDelete(item.id, e)}
                sx={{ mr: 0.5 }}
              >
                <IconTrash size={16} />
              </IconButton>
            </Box>
          </Box>

          {/* Name and agent count */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAgentsLoading ? 'Loading agents...' : `${linkedAgents.length} agent${linkedAgents.length !== 1 ? 's' : ''} linked`}
            </Typography>
          </Box>

          <Divider />

          {/* Masked API Key Row */}
          <Box 
            onClick={(e) => e.stopPropagation()} // Stop navigation when interacting with API key row
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              bgcolor: 'action.hover', 
              px: 1.5, 
              py: 0.75, 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                API KEY
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600 }}>
                {getMaskedApiKey(item.apiKey)}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => onViewApiKey(item)}
              sx={{ color: 'text.secondary' }}
            >
              <IconEye size={16} />
            </IconButton>
          </Box>

          {/* Scrollable list of Agents */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>
              LINKED AGENTS
            </Typography>
            {isAgentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : linkedAgents.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">No agents linked.</Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  flexGrow: 1,
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1,
                  pr: 0.5,
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'divider',
                    borderRadius: '2px',
                  }
                }}
              >
                {linkedAgents.map((agent) => (
                  <Box 
                    key={agent.id} 
                    sx={{ 
                      px: 1.5, 
                      py: 0.75, 
                      borderRadius: 1.5, 
                      bgcolor: 'action.hover', 
                      border: '1px solid', 
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.775rem' }}>
                      {agent.name}
                    </Typography>
                    <Chip 
                      label="linked" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700 }} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Redirection indicator footer */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: 'primary.main', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Open Messaging Console
            </Typography>
            <IconArrowRight size={14} />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

// ── MAIN COMPONENT: Integration View ────────────────────────────────────────
export const Integration: React.FC = () => {
  const navigate = useNavigate();

  // ── Query & Mutation hooks ────────────────────────────────────────
  const { data: availableAgents = [] } = useAgentList();
  const { data: integrations = [], isLoading } = useIntegration();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const assignAgent = useAssignAgent();

  // ── UI state ─────────────────────────────────────────────────────
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newIntegrationName, setNewIntegrationName] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Notification state ───────────────────────────────────────────
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── View API Key Dialog states ───────────────────────────────────
  const [viewApiKeyTarget, setViewApiKeyTarget] = useState<IntegrationItem | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toggle agent selection inside dialog
  const handleToggleAgentSelection = (id: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Helper: Verify password
  const verifyAccountPassword = async (passwordInputStr: string): Promise<boolean> => {
    // 1. Try local storage (mock registered users) first
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const email = currentUser.email || currentUser.username || currentUser.name || '';
        
        const storedUsersStr = localStorage.getItem('registeredUsers');
        if (storedUsersStr) {
          const users = JSON.parse(storedUsersStr);
          if (Array.isArray(users)) {
            const foundUser = users.find((u: any) => 
              (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
              (u.username && u.username.toLowerCase() === email.toLowerCase()) ||
              (u.name && u.name.toLowerCase() === email.toLowerCase())
            );
            if (foundUser && foundUser.password) {
              return foundUser.password === passwordInputStr;
              // return true
            }
          }
        }
        
        // Default local admin fallback
        if (email.toLowerCase() === 'admin@waagent.com' || email.toLowerCase() === 'admin') {
          return passwordInputStr === 'admin123';
        }
      }
    } catch (err) {
      console.error('Error during local password verification:', err);
    }

    // 2. Call the auth login endpoint to verify the credentials
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      let usernameVal = '';
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        usernameVal = currentUser.username || currentUser.email || currentUser.name || '';
      }
      
      if (!usernameVal) {
        return false;
      }

      await axiosServices.post('/api/auth/login', {
        username: usernameVal,
        password: passwordInputStr,
      });
      return true;
    } catch (err) {
      console.error('API password verification failed:', err);
      return false;
    }
  };

  // Reveal Dialog Handlers
  const handleOpenRevealDialog = (item: IntegrationItem) => {
    setViewApiKeyTarget(item);
    setPasswordInput('');
    setShowPasswordInput(false);
    setIsPasswordVerified(false);
    setRevealError(null);
    setCopied(false);
  };

  const handleCloseRevealDialog = () => {
    setViewApiKeyTarget(null);
    setPasswordInput('');
    setShowPasswordInput(false);
    setIsPasswordVerified(false);
    setRevealError(null);
    setCopied(false);
  };

  const handleVerifyPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput) {
      setRevealError('Please enter your password.');
      return;
    }
    setRevealError(null);
    setIsRevealing(true);

    const isValid = await verifyAccountPassword(passwordInput);
    setIsRevealing(false);

    if (isValid) {
      setIsPasswordVerified(true);
    } else {
      setRevealError('Incorrect password. Please try again.');
    }
  };

  const handleCopyApiKey = () => {
    if (viewApiKeyTarget?.apiKey) {
      navigator.clipboard.writeText(viewApiKeyTarget.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Delete an integration from the dashboard
  const handleDeleteIntegration = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteApiKey.mutate(id, {
      onSuccess: () => {
        setToast({
          open: true,
          message: 'Integration deleted successfully.',
          severity: 'success',
        });
      },
      onError: (err: any) => {
        setToast({
          open: true,
          message: err.response?.data?.message || err.message || 'Failed to delete integration.',
          severity: 'error',
        });
      }
    });
  };

  // Submit and create integration
  const handleCreateIntegration = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (!newIntegrationName.trim()) {
      setValidationError('Please enter a valid integration name.');
      return;
    }

    try {
      // Create integration sending only name
      const res = await createApiKey.mutateAsync(newIntegrationName.trim());
      
      // Determine the created integration ID from response
      const createdId = res?.collection?.id || res?.collection?.[0]?.id || res?.collection?.apiKey?.id || res?.id || res?.apiKey?.id || res?.data?.id || res?.data?.collection?.id;
      
      if (!createdId) {
        throw new Error('Successfully created integration, but failed to retrieve integration ID.');
      }

      // Automatically assign agents using useAssignAgent hook
      if (selectedAgentIds.length > 0) {
        await Promise.all(
          selectedAgentIds.map(agentId => 
            assignAgent.mutateAsync({ id: createdId, agentId })
          )
        );
      }

      // Success notification
      setToast({
        open: true,
        message: `Integration "${newIntegrationName.trim()}" created successfully${selectedAgentIds.length > 0 ? ` and ${selectedAgentIds.length} agent(s) assigned` : ''}.`,
        severity: 'success'
      });

      // Reset fields and close dialog
      setAddDialogOpen(false);
      setNewIntegrationName('');
      setSelectedAgentIds([]);
    } catch (err: any) {
      console.error('Failed to create integration:', err);
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to create integration or assign agents.',
        severity: 'error'
      });
    }
  };

  // Click card, navigate to /integration/messaging
  const handleCardClick = (integration: IntegrationItem, agents: string[]) => {
    navigate('/integration/messaging', { state: { integration: { id: integration.id, name: integration.name, agents } } });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        height: { xs: 'auto', md: 'calc(100vh - 185px)' },
        overflow: 'hidden'
      }}
    >
      {/* Header with Add Integration Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Gateway Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure and link autonomous agents to API message routing pipelines.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconPlus size={18} />}
          onClick={() => {
            setNewIntegrationName('');
            setSelectedAgentIds([]);
            setValidationError(null);
            setAddDialogOpen(true);
          }}
          sx={{ fontWeight: 700, borderRadius: 2.5 }}
        >
          Add Integration
        </Button>
      </Box>

      {/* Scrollable Container for Grid */}
      <Box 
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          pb: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: '3px',
          }
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Grid 
            container 
            spacing={3}
          >
            {integrations.length === 0 ? (
              <Grid size={12}>
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body1" color="text.secondary">
                    No integrations configured. Click "Add Integration" to create one.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              integrations.map((item) => (
                <IntegrationCard
                  key={item.id}
                  item={item}
                  availableAgents={availableAgents}
                  onDelete={handleDeleteIntegration}
                  onViewApiKey={handleOpenRevealDialog}
                  onCardClick={handleCardClick}
                />
              ))
            )}
          </Grid>
        )}
      </Box>

      {/* Add New Integration Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: 420,
              width: '100%'
            }
          }
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleCreateIntegration}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                handleCreateIntegration(e);
              }
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add New Integration
          </DialogTitle>
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Configure a new message routing channel pipeline by specifying a name and including active agents.
            </Typography>

            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}

            <TextField
              fullWidth
              label="Integration Name"
              value={newIntegrationName}
              onChange={(e) => setNewIntegrationName(e.target.value)}
              size="small"
              placeholder="e.g. Sales Pipeline Gateway"
              autoFocus
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 2.5,
                }
              }}
            />

            <Divider sx={{ my: 0.5 }} />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                Select Agents to Include
              </Typography>
              {availableAgents.length === 0 ? (
                <Typography variant="caption" color="error">
                  No agents available. Create them on the Agents screen first!
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 150, overflowY: 'auto', pr: 0.5 }}>
                  <FormGroup>
                    {availableAgents.map((agent) => (
                      <FormControlLabel
                        key={agent.id}
                        control={
                          <Checkbox 
                            size="small"
                            checked={selectedAgentIds.includes(agent.id)}
                            onChange={() => handleToggleAgentSelection(agent.id)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {agent.name}
                            </Typography>
                            <Chip 
                              label={agent.status} 
                              size="small" 
                              variant="outlined"
                              color={agent.status === 'ACTIVE' ? 'success' : 'default'}
                              sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700 }}
                            />
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddDialogOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained" 
              sx={{ fontWeight: 700 }} 
              disabled={createApiKey.isPending || assignAgent.isPending}
            >
              {createApiKey.isPending || assignAgent.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Password Reveal Dialog */}
      <Dialog 
        open={!!viewApiKeyTarget} 
        onClose={handleCloseRevealDialog}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: 400,
              width: '100%'
            }
          }
        }}
      >
        <Box component="form" onSubmit={handleVerifyPassword}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Reveal API Key
          </DialogTitle>
          
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isPasswordVerified ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  For security, please enter your account password to reveal the API key for <strong>{viewApiKeyTarget?.name}</strong>.
                </Typography>
                
                {revealError && <Alert severity="error" sx={{ borderRadius: 2 }}>{revealError}</Alert>}

                <TextField
                  fullWidth
                  label="Password"
                  type={showPasswordInput ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  size="small"
                  required
                  autoFocus
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPasswordInput(!showPasswordInput)} edge="end" size="small">
                            {showPasswordInput ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Here is the API key for <strong>{viewApiKeyTarget?.name}</strong>. Keep it confidential.
                </Typography>
                
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'action.hover', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.8rem', 
                      wordBreak: 'break-all', 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {viewApiKeyTarget?.apiKey}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleCopyApiKey} 
                    color={copied ? 'success' : 'primary'}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </IconButton>
                </Box>
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {!isPasswordVerified ? (
              <>
                <Button onClick={handleCloseRevealDialog} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  variant="contained" 
                  sx={{ fontWeight: 700 }} 
                  disabled={isRevealing}
                >
                  {isRevealing ? 'Verifying...' : 'Verify'}
                </Button>
              </>
            ) : (
              <Button onClick={handleCloseRevealDialog} color="primary" variant="contained" sx={{ fontWeight: 700 }}>
                Close
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>

      {/* Toast notifications */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast(prev => ({ ...prev, open: false }))} 
          severity={toast.severity} 
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Integration;
