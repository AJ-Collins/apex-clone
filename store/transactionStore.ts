import { create } from 'zustand';
import { api } from '../lib/api';

interface TransactionState {
  transactions: any[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  fetchTransactions: async () => {
    set({ loading: true });
    const response = await api.get('/api/marketer/transactions');
    if (response.success) {
      set({ transactions: response.data.transactions, loading: false });
    } else {
      set({ loading: false });
    }
  },
}));
