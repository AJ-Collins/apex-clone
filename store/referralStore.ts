import { create } from 'zustand';
import { api } from '../lib/api';

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  referrals: {
    id: string;
    name: string;
    joinedAt: string;
    depositCount: number;
    depositsByCurrency: Record<string, number>;
  }[];
}

interface ReferralState {
  data: ReferralData | null;
  loading: boolean;
  error: string | null;
  fetchReferrals: () => Promise<void>;
}

export const useReferralStore = create<ReferralState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchReferrals: async () => {
    set({ loading: true, error: null });
    const res = await api.get('/api/special/referral');
    if (res.success) {
      set({ data: res.data, loading: false });
    } else {
      set({ error: res.error || 'Failed to fetch referrals', loading: false });
    }
  },
}));
