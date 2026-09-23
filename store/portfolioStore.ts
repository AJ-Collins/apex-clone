import { create } from 'zustand';
import { api } from '../lib/api';

export interface AssetBalance {
  symbol: string;      // 'BNB', 'OG', etc.
  name: string;
  amount: number;
  usdValue: number;
  avgPrice?: number;
  todayPnlValue?: number;
  todayPnlPercent?: number;
}

interface PortfolioState {
  balances: any[];
  displayBalances: any[];
  globalBalance: number;
  loading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchDisplayBalances: () => Promise<void>;
  fetchGlobalBalance: () => Promise<void>;
  updateGlobalBalance: (amount?: number, notificationAmount?: number) => Promise<void>;
}

function extractBalance(res: any): number | undefined {
  const candidates = [
    res?.totalWithdrawals,
    res?.totalBalance,
    res?.balance,
    res?.amount,
    res?.data?.totalWithdrawals,
    res?.data?.totalBalance,
    res?.data?.balance,
    res?.data?.amount,
    res?.data?.data?.totalWithdrawals,
    res?.data?.data?.totalBalance,
    res?.data?.data?.balance,
    res?.data?.user?.balance,
    res?.user?.balance,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '' && !isNaN(Number(c))) {
      return Number(c);
    }
  }
  return undefined;
}

function extractAccounts(res: any): any[] | undefined {
  const candidates = [
    res?.accounts,
    res?.user?.accounts,
    res?.data?.accounts,
    res?.data?.user?.accounts,
    res?.data?.data?.accounts,
    res?.data?.data?.user?.accounts,
    res?.balances,
    res?.data?.balances,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return undefined;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  balances: [],
  displayBalances: [],
  globalBalance: 0,
  loading: false,
  fetchPortfolio: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/marketer/profile');
      const accounts = extractAccounts(response);
      if (accounts) {
        set({ balances: accounts });
      }
      // Profile may also carry the balance — pick it up so pull-to-refresh
      // reflects set-balance even if the withdrawals endpoint lags.
      const bal = extractBalance(response);
      if (bal !== undefined) {
        set({ globalBalance: bal });
      }
    } finally {
      set({ loading: false });
    }
  },
  fetchDisplayBalances: async () => {
    const response = await api.get('/marketer/profile');
    const accounts = extractAccounts(response);
    if (accounts) {
      set({ displayBalances: accounts });
    }
  },
  fetchGlobalBalance: async () => {
    try {
      const response = await api.get('/marketer/external-withdrawals');
      const bal = extractBalance(response);
      if (bal !== undefined) {
        set({ globalBalance: bal });
        return;
      }
      // Fallback: profile may hold the canonical balance written by set-balance.
      const profile = await api.get('/marketer/profile');
      const fallback = extractBalance(profile);
      if (fallback !== undefined) {
        set({ globalBalance: fallback });
      }
    } catch (e) {
      console.error('fetchGlobalBalance error:', e);
    }
  },
  updateGlobalBalance: async (amount?: number, notificationAmount?: number) => {
    set({ loading: true });
    try {
      const body: Record<string, number> = {};
      if (amount !== undefined && !isNaN(Number(amount))) {
        body.amount = Number(amount);
      }
      if (notificationAmount !== undefined && !isNaN(Number(notificationAmount))) {
        body.notificationAmount = Number(notificationAmount);
      }
      await api.post('/marketer/set-balance', body);
      // Intentionally do NOT fetch or set globalBalance here.
      // UI updates only on manual pull-to-refresh (fetchGlobalBalance).
    } finally {
      set({ loading: false });
    }
  },
}));
