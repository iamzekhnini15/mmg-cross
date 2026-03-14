import { create } from 'zustand';
import type { Garage, GarageMember } from '@/types/database';

interface GarageState {
  currentGarage: Garage | null;
  currentMembership: GarageMember | null;
  isGarageLoading: boolean;
  hasActiveGarage: boolean;
  isPending: boolean;
  setGarage: (garage: Garage | null, membership: GarageMember | null) => void;
  setGarageLoading: (isLoading: boolean) => void;
  clearGarage: () => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  currentGarage: null,
  currentMembership: null,
  isGarageLoading: true,
  hasActiveGarage: false,
  isPending: false,
  setGarage: (garage, membership) =>
    set({
      currentGarage: garage,
      currentMembership: membership,
      hasActiveGarage: !!garage && membership?.status === 'active',
      isPending: !!membership && membership.status === 'pending',
    }),
  setGarageLoading: (isGarageLoading) => set({ isGarageLoading }),
  clearGarage: () =>
    set({
      currentGarage: null,
      currentMembership: null,
      hasActiveGarage: false,
      isPending: false,
      isGarageLoading: true,
    }),
}));
