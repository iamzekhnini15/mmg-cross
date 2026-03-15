import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import { useMutation } from '@tanstack/react-query';

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const membership = useGarageStore.getState().currentMembership;
      if (membership) {
        await supabase.from('garage_members').delete().eq('id', membership.id);
      }
      await supabase.auth.signOut();
      useGarageStore.getState().clearGarage();
    },
  });
}
