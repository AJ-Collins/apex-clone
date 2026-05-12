import { create } from 'zustand';
import { api } from '../lib/api';

export interface DepositAddress {
  address: string;
  network: string;
  qrData: string;
}

export interface DepositRecord {
  id: string;
  currency: string;
  amount: number;
  network: string;
  txHash?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
}

interface DepositState {
  address: DepositAddress | null;
  history: DepositRecord[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  getAddress: (currency: string) => Promise<void>;
  confirmDeposit: (payload: { currency: string; amount: number; txHash: string; network: string }) => Promise<{ success: boolean; error?: string }>;
  fetchHistory: () => Promise<void>;
  reset: () => void;
}

export const useDepositStore = create<DepositState>((set) => ({
  address: null,
  history: [],
  loading: false,
  submitting: false,
  error: null,

  getAddress: async (currency: string) => {
    set({ loading: true, error: null, address: null });
    const res = await api.post('/api/special/deposit/initiate', { currency });
    if (res.success) {
      set({ address: res.data, loading: false });
    } else {
      set({ error: res.error || 'Failed to get deposit address', loading: false });
    }
  },

  confirmDeposit: async (payload) => {
    set({ submitting: true, error: null });
    const res = await api.post('/api/special/deposit/confirm', payload);
    set({ submitting: false });
    if (!res.success) {
      set({ error: res.error || 'Failed to submit deposit' });
      return { success: false, error: res.error };
    }
    return { success: true };
  },

  fetchHistory: async () => {
    set({ loading: true });
    const res = await api.get('/api/special/deposit/history');
    if (res.success) {
      set({ history: res.data?.deposits || [], loading: false });
    } else {
      set({ loading: false });
    }
  },

  reset: () => set({ address: null, error: null }),
}));
