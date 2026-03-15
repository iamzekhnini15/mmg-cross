import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import { useMutation } from '@tanstack/react-query';

export function useLeaveGarage() {
  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase.from('garage_members').delete().eq('id', membershipId);
      if (error) throw error;
      useGarageStore.getState().clearGarage();
    },
  });
}
