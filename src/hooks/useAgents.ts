import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axiosServices from '../utils/axios'; // 🔜 Uncomment when backend is ready

// ── Types ──────────────────────────────────────────────────────────

export interface AgentItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'STOPPED' | 'LOGGED_OUT';
}

// ── API Endpoints (for when backend is ready) ──────────────────────
// const AGENT_API_URL = '/api/Agent/';

// ── Mock Helpers (replace with axios calls when backend is ready) ──

const STORAGE_KEY = 'registeredAgents';

const DEFAULT_AGENTS: AgentItem[] = [
  { id: 'agent-1', name: 'WA Support Bot', status: 'ACTIVE' },
  { id: 'agent-2', name: 'Data Sync Orchestrator', status: 'ACTIVE' },
  { id: 'agent-3', name: 'Security Inspector', status: 'STOPPED' },
];

function getStoredAgents(): AgentItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AGENTS));
  return DEFAULT_AGENTS;
}

function saveAgents(agents: AgentItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hooks ──────────────────────────────────────────────────────────

// ✅ Get all agents
export function useAgentList(enabled: boolean = true) {
  return useQuery({
    queryKey: ['agent-list'],
    queryFn: async () => {
      await delay(100); // simulate network
      // 🔜 const res = await axiosServices.get(AGENT_API_URL);
      // 🔜 return res.data.data as AgentItem[];
      return getStoredAgents();
    },
    enabled,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
  });
}

// ✅ Add a new agent
export function useAddAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      await delay(150);
      // 🔜 const res = await axiosServices.post(AGENT_API_URL, payload);
      // 🔜 return res.data;
      const agents = getStoredAgents();
      const newAgent: AgentItem = {
        id: `agent-${Date.now()}`,
        name: payload.name,
        status: 'ACTIVE',
      };
      agents.push(newAgent);
      saveAgents(agents);
      return newAgent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-list'] });
    },
  });
}

// ✅ Edit existing agent (status changes, name changes, etc.)
export function useEditAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<AgentItem> & { id: string }) => {
      await delay(100);
      // 🔜 const { id, ...body } = payload;
      // 🔜 const res = await axiosServices.put(`${AGENT_API_URL}${id}`, body);
      // 🔜 return res.data;
      const agents = getStoredAgents();
      const idx = agents.findIndex(a => a.id === payload.id);
      if (idx === -1) throw new Error('Agent not found');
      agents[idx] = { ...agents[idx], ...payload };
      saveAgents(agents);
      return agents[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-list'] });
    },
  });
}

// ✅ Delete an agent
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await delay(100);
      // 🔜 await axiosServices.delete(`${AGENT_API_URL}${id}`);
      const agents = getStoredAgents().filter(a => a.id !== id);
      saveAgents(agents);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-list'] });
    },
  });
}
