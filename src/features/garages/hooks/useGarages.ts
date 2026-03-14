import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import type { Garage, GarageInsert, GarageMember, GarageUpdate } from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const GARAGES_KEY = ['garages'] as const;

// ─── Create Garage ──────────────────────────────────

export function useCreateGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (garage: GarageInsert): Promise<Garage> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Create the garage
      const { data, error } = await supabase
        .from('garages')
        .insert({ ...garage, created_by: user.id } as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      const created = data as Garage;

      // Create owner membership (active)
      const { data: membership, error: memberError } = await supabase
        .from('garage_members')
        .insert({
          garage_id: created.id,
          user_id: user.id,
          user_email: user.email,
          role: 'owner',
          status: 'active',
        } as Record<string, unknown>)
        .select()
        .single();

      if (memberError) throw memberError;

      // Update garage store
      useGarageStore.getState().setGarage(created, membership as GarageMember);

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GARAGES_KEY });
    },
  });
}

// ─── Join Garage by Invite Code ─────────────────────

export function useJoinGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string): Promise<GarageMember> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Lookup garage by invite code
      const { data: garage, error: lookupError } = await supabase
        .from('garages')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase().trim())
        .single();

      if (lookupError || !garage) throw new Error("Code d'invitation invalide");
      const foundGarage = garage as Garage;

      // Insert pending membership
      const { data: membership, error: memberError } = await supabase
        .from('garage_members')
        .insert({
          garage_id: foundGarage.id,
          user_id: user.id,
          user_email: user.email,
          role: 'member',
          status: 'pending',
        } as Record<string, unknown>)
        .select()
        .single();

      if (memberError) throw memberError;
      const created = membership as GarageMember;

      // Update garage store
      useGarageStore.getState().setGarage(foundGarage, created);

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GARAGES_KEY });
    },
  });
}

// ─── Current Garage Details ─────────────────────────

export function useCurrentGarageDetails() {
  const garageId = useGarageStore((state) => state.currentGarage?.id);

  return useQuery({
    queryKey: [...GARAGES_KEY, garageId],
    queryFn: async (): Promise<Garage> => {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .eq('id', garageId!)
        .single();

      if (error) throw error;
      return data as Garage;
    },
    enabled: !!garageId,
  });
}

// ─── Update Garage ──────────────────────────────────

export function useUpdateGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GarageUpdate }): Promise<Garage> => {
      const { data, error } = await supabase
        .from('garages')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const updated = data as Garage;

      // Update store if it's the current garage
      const { currentGarage, currentMembership } = useGarageStore.getState();
      if (currentGarage?.id === id) {
        useGarageStore.getState().setGarage(updated, currentMembership);
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GARAGES_KEY });
    },
  });
}

// ─── Regenerate Invite Code ─────────────────────────

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (garageId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('regenerate_invite_code', {
        p_garage_id: garageId,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GARAGES_KEY });
    },
  });
}
