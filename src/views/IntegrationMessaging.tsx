import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Select,
  MenuItem,
  OutlinedInput,
  InputLabel,
  FormControl,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  IconArrowLeft, 
  IconSend,
} from '@tabler/icons-react';
import { useAgentList } from '../hooks/useAgents';
import { useContactList } from '../hooks/useContacts';
import { useSendMessage } from '../hooks/useMessaging';

interface IntegrationItem {
  id: string;
  name: string;
  agents: string[];
}

export const IntegrationMessaging: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load active integration from navigation state or fallback
  const [activeIntegration] = useState<IntegrationItem>(() => {
    if (location.state?.integration) {
      return location.state.integration;
    }
    return { id: 'default', name: 'Direct Routing Pipeline', agents: [] };
  });

  // ── Query hooks ──────────────────────────────────────────────────
  const { data: allAgents = [] } = useAgentList();
  const { data: contacts = [] } = useContactList();
  const sendMessage = useSendMessage();

  // Filter agents linked to this integration
  const integrationAgents = allAgents.filter(a => activeIntegration.agents.includes(a.id));

  // ── UI state ─────────────────────────────────────────────────────
  const [targetNumber, setTargetNumber] = useState('6282256337325');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [sendStatus, setSendStatus] = useState('Idle');
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Pre-fill agent selection with the first agent linked to this integration
  useEffect(() => {
    if (activeIntegration.agents && activeIntegration.agents.length > 0) {
      setSelectedAgentId(activeIntegration.agents[0]);
    } else {
      setSelectedAgentId('');
    }
  }, [activeIntegration]);

  // Build target suggestions from contacts
  const targetNumbers = contacts.map(c => ({
    name: c.name,
    number: `+${c.whatsapp}`,
  }));

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    if (!selectedAgentId) return;
    
    const target = targetNumber.trim();
    if (!target) return;

    setSendStatus('Sending...');

    sendMessage.mutate(
      {
        message: messageText.trim(),
        phone: target,
        agentId: selectedAgentId,
      },
      {
        onSuccess: () => {
          setMessageText('');
          setSendStatus('Delivered');
          setToast({
            open: true,
            message: 'Message sent successfully!',
            severity: 'success',
          });
        },
        onError: (err: any) => {
          setSendStatus('Failed');
          const errMsg = err?.response?.data?.msg || err?.message || 'Failed to send message';
          setToast({
            open: true,
            message: errMsg,
            severity: 'error',
          });
        }
      }
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={() => navigate('/integration')} 
          color="primary"
          sx={{ 
            p: 1, 
            borderRadius: 2.5, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <IconArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Messaging Console
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Pipeline: <strong>{activeIntegration.name}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Main Split Panels */}
      <Grid container spacing={3}>
        {/* Left Panel: Send Message */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 3, height: '100%', boxSizing: 'border-box' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Send Message
              </Typography>

              {/* Form Layout matching mockup grid */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                <Grid container spacing={2}>
                  {/* No. Target Selection using Autocomplete freeSolo */}
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <Autocomplete
                      freeSolo
                      options={targetNumbers}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') return option;
                        return option.number;
                      }}
                      renderOption={(props, option) => {
                        const { key, ...restProps } = props as any;
                        return (
                          <li key={option.number} {...restProps}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.725rem' }}>{option.number}</Typography>
                            </Box>
                          </li>
                        );
                      }}
                      value={targetNumber}
                      onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                          setTargetNumber(newValue);
                        } else if (newValue && typeof newValue === 'object') {
                          setTargetNumber(newValue.number);
                        }
                      }}
                      onInputChange={(_, newInputValue) => {
                        setTargetNumber(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="No. Target"
                          size="small"
                          placeholder="Type or select number..."
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Agent Selector */}
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="agent-select-label" sx={{ fontWeight: 600 }}>Agent</InputLabel>
                      <Select
                        labelId="agent-select-label"
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value as string)}
                        input={<OutlinedInput label="Agent" sx={{ borderRadius: 2.5 }} />}
                      >
                        {integrationAgents.length === 0 ? (
                          <MenuItem disabled value="">
                            <Typography variant="body2" color="text.secondary">
                              No agents linked to integration
                            </Typography>
                          </MenuItem>
                        ) : (
                          integrationAgents.map((agent) => (
                            <MenuItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Message Body Input */}
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  placeholder="Message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      p: 2,
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }
                  }}
                />

                {/* Send Action */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !selectedAgentId || sendMessage.isPending}
                  startIcon={<IconSend size={18} />}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2.5 }}
                >
                  {sendMessage.isPending ? 'Sending...' : 'Send'}
                </Button>

                {/* Status Bar */}
                <Box 
                  sx={{ 
                    p: 1.75, 
                    borderRadius: 2.5, 
                    bgcolor: 'action.hover', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.025em' }}>
                    Status : <span style={{ color: sendStatus === 'Sending...' ? '#fb823c' : sendStatus.startsWith('Delivered') ? '#2e7d32' : sendStatus === 'Failed' ? '#d32f2f' : 'inherit' }}>[ {sendStatus} ]</span>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel: Message Sent */}
        {/* <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 3.5 }, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Message Sent
              </Typography>

              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  flexGrow: 1, 
                  borderRadius: 1, 
                  overflowY: 'auto', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'transparent',
                  '&::-webkit-scrollbar': { width: 5 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2.5 }
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: '#f4f4f4', borderBottom: '1px solid', borderColor: 'divider' }}>Message</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f4f4f4', borderBottom: '1px solid', borderColor: 'divider', width: 90 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 4, border: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            No logs registered. Send a message to start!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((row) => {
                        let cellBg = '';
                        let cellColor = '';
                        if (row.status === 'Sent') {
                          cellBg = '#e2f5ec';
                          cellColor = '#0f5132';
                        } else if (row.status === 'Pending') {
                          cellBg = '#fff3cd';
                          cellColor = '#664d03';
                        } else if (row.status === 'Failed') {
                          cellBg = '#f8d7da';
                          cellColor = '#842029';
                        }

                        return (
                          <TableRow 
                            key={row.id}
                            // sx={{ 
                            //   '&:last-child td, &:last-child th': { border: 0 },
                            //   animation: 'fadeIn 0.25s ease'
                            // }}
                          >
                            <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.25 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {row.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.675rem' }}>
                                Via: {row.agentName} | Target: {row.target} | {row.timestamp}
                              </Typography>
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                borderBottom: '1px solid', 
                                borderColor: 'divider', 
                                py: 1.25,
                              }}
                            >
                              <Box 
                                sx={{ 
                                  bgcolor: cellBg,
                                  color: cellColor,
                                  borderRadius: 1.5,
                                  py: 0.5,
                                  px: 1,
                                  fontWeight: 800,
                                  fontSize: '0.725rem',
                                  textAlign: 'center',
                                  display: 'inline-block',
                                  minWidth: 65,
                                  boxSizing: 'border-box',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.025em',
                                }}
                              >
                                {row.status}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Showing top 10 items
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconMessage size={14} />
                  <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)' }}>
                    Total: {history.length} logs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity} 
          sx={{ width: '100%', borderRadius: 2.5 }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IntegrationMessaging;
