import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../utils/axios'; // 🔜 Uncomment when backend is ready
import type { AgentItem } from './useAgents';

// ── Types ──────────────────────────────────────────────────────────

export interface HistoryItem {
  id: string;
  message: string;
  agentName: string;
  target: string;
  status: 'Sent' | 'Pending' | 'Failed';
  timestamp: string;
}

export interface SendMessagePayload {
  message: string;
  target: string;
  agentIds: string[];
  agentNames: string[]; // resolved names for display
  integrationId: string;
}
export interface MessagePayload {
  agentId: string;
  phone: string;
  message: string;
  
}

// ── API Endpoints (for when backend is ready) ──────────────────────
const MESSAGE_API_URL = '/api/messages/send';

// ── Mock Helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'messageHistory';

const DEFAULT_HISTORY: HistoryItem[] = [
  { id: 'h-1', message: 'Hello! Your monthly service billing statement is now available.', agentName: 'WA Support Bot', target: '+6281234567890', status: 'Sent', timestamp: '14:32' },
  { id: 'h-2', message: 'Warning: High CPU load detected on Node-A.', agentName: 'Security Inspector', target: '+628111222333', status: 'Sent', timestamp: '14:28' },
  { id: 'h-3', message: 'Sync connection lost with Postgres database endpoint.', agentName: 'Data Sync Orchestrator', target: '+6289876543210', status: 'Failed', timestamp: '14:15' },
  { id: 'h-4', message: 'Daily pipeline test executed successfully.', agentName: 'Data Sync Orchestrator', target: '+6281234567890', status: 'Sent', timestamp: '13:50' },
  { id: 'h-5', message: 'New customer registration confirmation code: 8491.', agentName: 'WA Support Bot', target: '+628555666777', status: 'Sent', timestamp: '13:10' },
];

function getStoredHistory(): HistoryItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HISTORY));
  return DEFAULT_HISTORY;
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hooks ──────────────────────────────────────────────────────────

// ✅ Get message history (last 10 items)
export function useMessageHistory(_integrationId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['message-history', _integrationId],
    queryFn: async () => {
      await delay(100);
      return getStoredHistory().slice(0, 10);
    },
    enabled,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
  });
}

// ✅ Send a message (creates pending items, then resolves after delay)
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MessagePayload) => {
      // Resolve agent name for local history logs
      const agents = queryClient.getQueryData<AgentItem[]>(['agent-list']) || [];
      const agent = agents.find(a => a.id === payload.agentId);
      const agentName = agent ? agent.name : payload.agentId;

      const logId = `msg-${Date.now()}`;
      const newLog: HistoryItem = {
        id: logId,
        message: payload.message,
        agentName,
        target: payload.phone,
        status: 'Pending' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Save pending log
      const existing = getStoredHistory();
      saveHistory([newLog, ...existing].slice(0, 10));
      queryClient.invalidateQueries({ queryKey: ['message-history'] });

      try {
        await axiosServices.post(MESSAGE_API_URL, payload);
        
        // Update local history to Sent
        const current = getStoredHistory();
        const resolved = current.map(item =>
          item.id === logId ? { ...item, status: 'Sent' as const } : item
        );
        saveHistory(resolved);
      } catch (error) {
        // Update local history to Failed
        const current = getStoredHistory();
        const resolved = current.map(item =>
          item.id === logId ? { ...item, status: 'Failed' as const } : item
        );
        saveHistory(resolved);
        throw error;
      } finally {
        queryClient.invalidateQueries({ queryKey: ['message-history'] });
      }

      return newLog;
    },
  });
}
