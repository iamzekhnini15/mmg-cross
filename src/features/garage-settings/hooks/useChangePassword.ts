import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
  });
}
