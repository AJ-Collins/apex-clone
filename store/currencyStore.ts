import { create } from 'zustand';

export type CryptoCurrency = 'BTC' | 'ETH' | 'BNB' | 'USDT';

interface CurrencyState {
  selectedCurrency: CryptoCurrency;
  setSelectedCurrency: (currency: CryptoCurrency) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  selectedCurrency: 'BTC',
  setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
}));
