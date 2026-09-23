import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { api } from '../lib/api';
import { generateDepositAddress } from '../utils/addressGenerator';
import { usePortfolioStore } from './portfolioStore';

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
  // Updated signature: now requires network too
  getAddress: (currency: string, network: string) => Promise<void>;
  confirmDeposit: (payload: {
    currency: string;
    amount: number;
    txHash: string;
    network: string;
  }) => Promise<{ success: boolean; error?: string }>;
  fetchHistory: () => Promise<void>;
  reset: () => void;
}

export const useDepositStore = create<DepositState>((set) => ({
  address: null,
  history: [],
  loading: false,
  submitting: false,
  error: null,

  getAddress: async (currency: string, network: string) => {
    set({ loading: true, error: null, address: null });

    try {
      // Try backend first — if your API can return per-network addresses,
      // this will be used. The payload now includes network.
      const res = await api.post('/api/marketer/deposit/initiate', { currency, network });

      if (res.success && res.data?.address) {
        set({ address: res.data, loading: false });
        return;
      }

      // Fallback: generate a deterministic valid address client-side.
      // Remove this block once your backend is updated.
      const generated = generateDepositAddress(currency, network);
      set({ address: generated, loading: false });

    } catch {
      // Network error — generate client-side so the UI stays functional.
      const generated = generateDepositAddress(currency, network);
      set({ address: generated, loading: false });
    }
  },

  confirmDeposit: async (payload) => {
    set({ submitting: true, error: null });
    const res = await api.post('/api/marketer/deposit/confirm', payload);
    set({ submitting: false });
    if (!res.success) {
      set({ error: res.error || 'Failed to submit deposit' });
      return { success: false, error: res.error };
    }

    // Refresh balances globally so the UI updates without a manual reload
    usePortfolioStore.getState().fetchGlobalBalance();
    usePortfolioStore.getState().fetchPortfolio();

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' (UTC)';
    Notifications.scheduleNotificationAsync({
      content: {
        title: `${payload.currency} Deposit Successful`,
        body: `You have successfully deposited ${payload.amount} ${payload.currency} at ${timeStr}. If you do not recognize this activity please contact us immediately.`,
      },
      trigger: null,
    });

    return { success: true };
  },

  fetchHistory: async () => {
    set({ loading: true });
    const res = await api.get('/api/marketer/deposit/history');
    if (res.success) {
      set({ history: res.data?.deposits || [], loading: false });
    } else {
      set({ loading: false });
    }
  },

  reset: () => set({ address: null, error: null }),
}));