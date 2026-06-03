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
  CircularProgress
} from '@mui/material';
import { 
  IconPlus, 
  IconTrash, 
  IconPlug,
  IconArrowRight
} from '@tabler/icons-react';
import { useAgentList } from '../hooks/useAgents';
import { useIntegrationList, useAddIntegration, useDeleteIntegration } from '../hooks/useIntegrations';

export const Integration: React.FC = () => {
  const navigate = useNavigate();

  // ── Query hooks ──────────────────────────────────────────────────
  const { data: availableAgents = [] } = useAgentList();
  const { data: integrations = [], isLoading } = useIntegrationList();
  const addIntegration = useAddIntegration();
  const deleteIntegration = useDeleteIntegration();

  // ── UI state ─────────────────────────────────────────────────────
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newIntegrationName, setNewIntegrationName] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper: Find agent name by ID
  const getAgentName = (id: string) => {
    const found = availableAgents.find(a => a.id === id);
    return found ? found.name : id;
  };

  // Toggle agent selection inside dialog
  const handleToggleAgentSelection = (id: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Delete an integration from the dashboard
  const handleDeleteIntegration = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteIntegration.mutate(id);
  };

  // Submit and create integration
  const handleCreateIntegration = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (!newIntegrationName.trim()) {
      setValidationError('Please enter a valid integration name.');
      return;
    }

    if (selectedAgentIds.length === 0) {
      setValidationError('Please select at least one agent to include.');
      return;
    }

    addIntegration.mutate(
      { name: newIntegrationName.trim(), agents: selectedAgentIds },
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setNewIntegrationName('');
          setSelectedAgentIds([]);
        },
      }
    );
  };

  // Click card, navigate to /integration/messaging
  const handleCardClick = (integration: { id: string; name: string; agents: string[] }) => {
    navigate('/integration/messaging', { state: { integration } });
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        height: { xs: 'auto', md: 'calc(100vh - 200px)' },
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
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                onClick={() => handleCardClick(item)}
                sx={{ 
                  height: '340px', 
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
                        onClick={(e) => handleDeleteIntegration(item.id, e)}
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
                      {item.agents.length} agent{item.agents.length !== 1 ? 's' : ''} linked
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Scrollable list of Agents */}
                  <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>
                      LINKED AGENTS
                    </Typography>
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
                      {item.agents.map((agentId) => (
                        <Box 
                          key={agentId} 
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
                            {getAgentName(agentId)}
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
            <Button type="submit" color="primary" variant="contained" sx={{ fontWeight: 700 }} disabled={addIntegration.isPending}>
              {addIntegration.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Integration;
