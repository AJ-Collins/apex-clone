import { create } from 'zustand';
import { api } from '../lib/api';

interface PortfolioState {
  balances: any[];
  displayBalances: any[];
  globalBalance: number;
  loading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchDisplayBalances: () => Promise<void>;
  fetchGlobalBalance: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  balances: [],
  displayBalances: [],
  globalBalance: 0,
  loading: false,
  fetchPortfolio: async () => {
    set({ loading: true });
    const response = await api.get('/marketer/profile');
    // Handle both direct profile response and wrapped user response
    const accounts = response.accounts || response.user?.accounts;
    if (accounts) {
      set({ balances: accounts, loading: false });
    } else {
      set({ loading: false });
    }
  },
  fetchDisplayBalances: async () => {
    const response = await api.get('/marketer/profile');
    const accounts = response.accounts || response.user?.accounts;
    if (accounts) {
      set({ displayBalances: accounts });
    }
  },
  fetchGlobalBalance: async () => {
    const response = await api.get('/marketer/external-withdrawals');
    // If the endpoint is successful, we expect `totalWithdrawals` in the response
    if (response.totalWithdrawals !== undefined) {
      set({ globalBalance: Number(response.totalWithdrawals) });
    } else if (response.data?.totalWithdrawals !== undefined) {
      set({ globalBalance: Number(response.data.totalWithdrawals) });
    }
  },
}));
