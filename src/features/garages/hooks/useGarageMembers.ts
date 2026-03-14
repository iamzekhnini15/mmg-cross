import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import type { GarageMember } from '@/types/database';

const MEMBERS_KEY = ['garage-members'] as const;

// ─── List Garage Members ────────────────────────────

export function useGarageMembers() {
  const garageId = useGarageStore((state) => state.currentGarage?.id);

  return useQuery({
    queryKey: [...MEMBERS_KEY, garageId],
    queryFn: async (): Promise<GarageMember[]> => {
      const { data, error } = await supabase
        .from('garage_members')
        .select('*')
        .eq('garage_id', garageId!)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as GarageMember[];
    },
    enabled: !!garageId,
  });
}

// ─── Update Member Status ───────────────────────────

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      status,
    }: {
      memberId: string;
      status: 'active' | 'rejected';
    }): Promise<GarageMember> => {
      const { data, error } = await supabase
        .from('garage_members')
        .update({ status } as Record<string, unknown>)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data as GarageMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
    },
  });
}

// ─── Update Member Role ─────────────────────────────

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: 'admin' | 'member';
    }): Promise<GarageMember> => {
      const { data, error } = await supabase
        .from('garage_members')
        .update({ role } as Record<string, unknown>)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data as GarageMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
    },
  });
}

// ─── Remove Member ──────────────────────────────────

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('garage_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });
    },
  });
}
