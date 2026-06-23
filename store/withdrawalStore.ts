import { create } from 'zustand';
import { api } from '../lib/api';

export interface WithdrawalRequest {
  id: string;
  currency: string;
  amount: number;
  destinationAddress: string;
  network: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  txHash?: string;
  createdAt: string;
  processedAt?: string;
}

interface WithdrawalState {
  history: WithdrawalRequest[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  requestWithdrawal: (payload: {
    amount: number;
    currency: string;
    destinationAddress: string;
    network: string;
  }) => Promise<{ success: boolean; error?: string }>;
  fetchHistory: () => Promise<void>;
}

export const useWithdrawalStore = create<WithdrawalState>((set) => ({
  history: [],
  loading: false,
  submitting: false,
  error: null,

  requestWithdrawal: async (payload) => {
    set({ submitting: true, error: null });
    const res = await api.post('/api/marketer/withdrawal/request', payload);
    set({ submitting: false });
    if (!res.success) {
      set({ error: res.error || 'Withdrawal request failed' });
      return { success: false, error: res.error };
    }
    return { success: true };
  },

  fetchHistory: async () => {
    set({ loading: true });
    const res = await api.get('/api/marketer/withdrawal/history');
    if (res.success) {
      set({ history: res.data?.withdrawals || [], loading: false });
    } else {
      set({ loading: false });
    }
  },
}));
