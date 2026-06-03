import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axiosServices from '../utils/axios'; // 🔜 Uncomment when backend is ready

// ── Types ──────────────────────────────────────────────────────────

export interface IntegrationItem {
  id: string;
  name: string;
  agents: string[]; // list of agent IDs
}

// ── API Endpoints (for when backend is ready) ──────────────────────
// const INTEGRATION_API_URL = '/api/Integration/';

// ── Mock Helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'registeredIntegrations';

const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { id: 'integration-1', name: 'Customer Support Pipeline', agents: ['agent-1', 'agent-3'] },
  { id: 'integration-2', name: 'Production Data Sync', agents: ['agent-2'] },
];

function getStoredIntegrations(): IntegrationItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INTEGRATIONS));
  return DEFAULT_INTEGRATIONS;
}

function saveIntegrations(items: IntegrationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hooks ──────────────────────────────────────────────────────────

// ✅ Get all integrations
export function useIntegrationList(enabled: boolean = true) {
  return useQuery({
    queryKey: ['integration-list'],
    queryFn: async () => {
      await delay(100);
      return getStoredIntegrations();
    },
    enabled,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
  });
}

// ✅ Add a new integration
export function useAddIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; agents: string[] }) => {
      await delay(150);
      const items = getStoredIntegrations();
      const newItem: IntegrationItem = {
        id: `integration-${Date.now()}`,
        name: payload.name,
        agents: payload.agents,
      };
      items.push(newItem);
      saveIntegrations(items);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-list'] });
    },
  });
}

// ✅ Edit existing integration
export function useEditIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<IntegrationItem> & { id: string }) => {
      await delay(100);
      const items = getStoredIntegrations();
      const idx = items.findIndex(i => i.id === payload.id);
      if (idx === -1) throw new Error('Integration not found');
      items[idx] = { ...items[idx], ...payload };
      saveIntegrations(items);
      return items[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-list'] });
    },
  });
}

// ✅ Delete an integration
export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await delay(100);
      const items = getStoredIntegrations().filter(i => i.id !== id);
      saveIntegrations(items);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-list'] });
    },
  });
}
