import { create } from 'zustand';

export type CryptoCurrency = 'BTC' | 'ETH' | 'BNB' | 'USDT' | 'KES';

interface CurrencyState {
  selectedCurrency: CryptoCurrency;
  kshRate: number;
  setSelectedCurrency: (currency: CryptoCurrency) => void;
  fetchKshRate: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  selectedCurrency: 'BTC',
  kshRate: 129.30,
  setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
  fetchKshRate: async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates && data.rates.KES) {
        set({ kshRate: data.rates.KES });
      }
    } catch (error) {
      console.error('Failed to fetch KES rate', error);
    }
  }
}));
