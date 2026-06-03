import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axiosServices from '../utils/axios'; // 🔜 Uncomment when backend is ready

// ── Types ──────────────────────────────────────────────────────────

export interface ContactItem {
  id: string;
  name: string;
  whatsapp: string; // full number e.g. "6281234567890"
}

// ── API Endpoints (for when backend is ready) ──────────────────────
// const CONTACT_API_URL = '/api/Contact/';

// ── Mock Helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'registeredContacts';

const DEFAULT_CONTACTS: ContactItem[] = [
  { id: 'c-1', name: 'John Doe', whatsapp: '6281234567890' },
  { id: 'c-2', name: 'Jane Smith', whatsapp: '6289876543210' },
  { id: 'c-3', name: 'Bob Johnson', whatsapp: '628111222333' },
  { id: 'c-4', name: 'Alice Williams', whatsapp: '628555666777' },
];

function getStoredContacts(): ContactItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
  return DEFAULT_CONTACTS;
}

function saveContacts(items: ContactItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Hooks ──────────────────────────────────────────────────────────

// ✅ Get all contacts
export function useContactList(enabled: boolean = true) {
  return useQuery({
    queryKey: ['contact-list'],
    queryFn: async () => {
      await delay(100);
      return getStoredContacts();
    },
    enabled,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
  });
}

// ✅ Add a new contact
export function useAddContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; whatsapp: string }) => {
      await delay(150);
      const items = getStoredContacts();
      const newItem: ContactItem = {
        id: `contact-${Date.now()}`,
        name: payload.name,
        whatsapp: payload.whatsapp,
      };
      items.push(newItem);
      saveContacts(items);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list'] });
    },
  });
}

// ✅ Edit existing contact
export function useEditContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<ContactItem> & { id: string }) => {
      await delay(100);
      const items = getStoredContacts();
      const idx = items.findIndex(c => c.id === payload.id);
      if (idx === -1) throw new Error('Contact not found');
      items[idx] = { ...items[idx], ...payload };
      saveContacts(items);
      return items[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list'] });
    },
  });
}

// ✅ Delete a contact
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await delay(100);
      const items = getStoredContacts().filter(c => c.id !== id);
      saveContacts(items);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list'] });
    },
  });
}
