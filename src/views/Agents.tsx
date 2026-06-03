import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { 
  IconCpu, 
  IconPlus, 
  IconTrash, 
  IconPlayerPlay, 
  IconPlayerPause, 
  IconLogout, 
  IconLogin 
} from '@tabler/icons-react';
import { useAgentList, useAddAgent, useEditAgent, useDeleteAgent } from '../hooks/useAgents';
import type { AgentItem } from '../hooks/useAgents';

export const Agents: React.FC = () => {
  // ── Query hooks ──────────────────────────────────────────────────
  const { data: agents = [], isLoading } = useAgentList();
  const addAgent = useAddAgent();
  const editAgent = useEditAgent();
  const deleteAgent = useDeleteAgent();

  // ── UI state (dialogs, forms) ────────────────────────────────────
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<AgentItem | null>(null);

  // Toggle agent status between ACTIVE and STOPPED
  const handleToggleStatus = (agent: AgentItem) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
    editAgent.mutate({ id: agent.id, status: nextStatus });
  };

  // Toggle login status between LOGGED_OUT and ACTIVE
  const handleToggleLogin = (agent: AgentItem) => {
    const nextStatus = agent.status === 'LOGGED_OUT' ? 'ACTIVE' : 'LOGGED_OUT';
    editAgent.mutate({ id: agent.id, status: nextStatus });
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (agentToDelete) {
      deleteAgent.mutate(agentToDelete.id);
      setAgentToDelete(null);
    }
  };

  // Submit and create new agent
  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newAgentName.trim()) {
      setValidationError('Please enter a valid agent name.');
      return;
    }

    addAgent.mutate(
      { name: newAgentName.trim() },
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setNewAgentName('');
        },
      }
    );
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
      {/* Header with Add Agent Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Autonomous Agents
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and configure active background workflows and NLP services.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconPlus size={18} />}
          onClick={() => {
            setNewAgentName('');
            setValidationError(null);
            setAddDialogOpen(true);
          }}
          sx={{ fontWeight: 700, borderRadius: 2.5 }}
        >
          Add Agent
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
        <Grid container spacing={3}>
        {agents.map((agent) => {
          const isActive = agent.status === 'ACTIVE';
          const isStopped = agent.status === 'STOPPED';
          const isLoggedOut = agent.status === 'LOGGED_OUT';

          let statusColor: 'success' | 'warning' | 'default' = 'default';
          let chipLabel = 'LOGGED OUT';
          let statusBg = 'rgba(0, 0, 0, 0.04)';
          let statusText = 'text.secondary';
          
          if (isActive) {
            statusColor = 'success';
            chipLabel = 'ACTIVE';
            statusBg = 'rgba(46, 125, 50, 0.08)';
            statusText = 'success.main';
          } else if (isStopped) {
            statusColor = 'warning';
            chipLabel = 'STOPPED';
            statusBg = 'rgba(239, 108, 0, 0.08)';
            statusText = 'warning.main';
          }

          return (
            <Grid key={agent.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5, '&:last-child': { pb: 3 } }}>
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
                        bgcolor: statusBg,
                        color: statusText,
                      }}
                    >
                      <IconCpu size={20} />
                    </Box>
                    <Chip 
                      label={chipLabel} 
                      size="small" 
                      color={statusColor} 
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }} 
                    />
                  </Box>

                  {/* Name and ID */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {agent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      ID: {agent.id}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Controls: Delete, Stop/Start, Logout/Login */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {/* Stop / Start Button */}
                      <Button
                        variant={isActive ? 'outlined' : 'contained'}
                        color={isActive ? 'warning' : 'primary'}
                        fullWidth
                        size="small"
                        startIcon={isActive ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                        onClick={() => handleToggleStatus(agent)}
                        sx={{ fontWeight: 700, borderRadius: 2, py: 0.75 }}
                      >
                        {isActive ? 'Stop' : 'Start'}
                      </Button>

                      {/* Logout / Login Button */}
                      <Button
                        variant="outlined"
                        color={isLoggedOut ? 'primary' : 'secondary'}
                        fullWidth
                        size="small"
                        startIcon={isLoggedOut ? <IconLogin size={16} /> : <IconLogout size={16} />}
                        onClick={() => handleToggleLogin(agent)}
                        sx={{ fontWeight: 700, borderRadius: 2, py: 0.75 }}
                      >
                        {isLoggedOut ? 'Login' : 'Logout'}
                      </Button>
                    </Box>

                    {/* Delete Button */}
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      size="small"
                      startIcon={<IconTrash size={16} />}
                      onClick={() => setAgentToDelete(agent)}
                      sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2,
                        py: 0.75,
                        borderStyle: 'dashed',
                        '&:hover': {
                          borderStyle: 'solid'
                        }
                      }}
                    >
                      Delete Agent
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        </Grid>
        )}
      </Box>

      {/* Add New Agent Dialog */}
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
              maxWidth: 400,
              width: '100%'
            }
          }
        }}
      >
        <Box component="form" onSubmit={handleAddAgent}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add New Agent
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter the name of the new autonomous agent instance. By default, it will start in the ACTIVE state.
            </Typography>

            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}

            <TextField
              fullWidth
              label="Agent Name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              size="small"
              placeholder="e.g. NLP Billing Agent"
              autoFocus
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddDialogOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained" sx={{ fontWeight: 700 }} disabled={addAgent.isPending}>
              {addAgent.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Agent Confirmation Dialog */}
      <Dialog 
        open={agentToDelete !== null} 
        onClose={() => setAgentToDelete(null)}
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Delete Agent
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the agent <strong>{agentToDelete?.name}</strong>? This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAgentToDelete(null)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ fontWeight: 700 }} disabled={deleteAgent.isPending}>
            {deleteAgent.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;
