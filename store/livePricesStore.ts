import { useEffect } from 'react';
import { create } from 'zustand';

export interface LivePriceInfo {
  price: number;
  changePercent: number;
}

interface LivePricesState {
  prices: Record<string, LivePriceInfo>;
  isConnected: boolean;
  _socket: WebSocket | null;
  _subscriberCount: number;
  connect: (symbols?: string[]) => void;
  disconnect: () => void;
}

const DEFAULT_STREAMS = ['btcusdt', 'ethusdt', 'bnbusdt', 'ogusdt'];

export const useLivePricesStore = create<LivePricesState>((set, get) => ({
  prices: {},
  isConnected: false,
  _socket: null,
  _subscriberCount: 0,

  connect: (symbols = DEFAULT_STREAMS) => {
    set((state) => ({ _subscriberCount: state._subscriberCount + 1 }));

    if (get()._socket) return;

    const streamPath = symbols.map((s) => `${s}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamPath}`);

    ws.onopen = () => set({ isConnected: true });
    ws.onclose = () => set({ isConnected: false, _socket: null });
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const symbol = (data.s as string)?.toLowerCase();
        if (!symbol) return;

        const price = parseFloat(data.c);
        const changePercent = parseFloat(data.P);
        if (Number.isNaN(price) || Number.isNaN(changePercent)) return;

        set((state) => ({
          prices: { ...state.prices, [symbol]: { price, changePercent } },
        }));
      } catch {}
    };

    set({ _socket: ws });
  },

  disconnect: () => {
    set((state) => {
      const nextCount = Math.max(0, state._subscriberCount - 1);
      if (nextCount === 0 && state._socket) {
        state._socket.close();
        return { _subscriberCount: nextCount, _socket: null, isConnected: false };
      }
      return { _subscriberCount: nextCount };
    });
  },
}));

export function useLivePriceConnection(symbols?: string[]) {
  const connect = useLivePricesStore((s) => s.connect);
  const disconnect = useLivePricesStore((s) => s.disconnect);

  useEffect(() => {
    connect(symbols);
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}