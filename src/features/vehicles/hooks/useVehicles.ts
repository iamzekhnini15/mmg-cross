import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Vehicle, VehicleInsert, VehicleUpdate, VehicleStatusHistory } from '@/types/database';
import type { VehicleStatus } from '@/lib/constants';

const VEHICLES_KEY = ['vehicles'] as const;

function vehicleKey(id: string) {
  return ['vehicles', id] as const;
}

function vehicleHistoryKey(id: string) {
  return ['vehicles', id, 'history'] as const;
}

// ─── Fetch all vehicles ──────────────────────────────

interface UseVehiclesOptions {
  status?: VehicleStatus;
  search?: string;
}

export function useVehicles(options?: UseVehiclesOptions) {
  return useQuery({
    queryKey: [...VEHICLES_KEY, options],
    queryFn: async (): Promise<Vehicle[]> => {
      let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.search) {
        const term = `%${options.search}%`;
        query = query.or(
          `brand.ilike.${term},model.ilike.${term},license_plate.ilike.${term},vin.ilike.${term}`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data ?? []) as Vehicle[];
    },
  });
}

// ─── Fetch single vehicle ────────────────────────────

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKey(id),
    queryFn: async (): Promise<Vehicle> => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();

      if (error) throw error;
      return data as Vehicle;
    },
    enabled: !!id,
  });
}

// ─── Fetch vehicle with total expenses ───────────────

interface VehicleWithExpenses {
  vehicle: Vehicle;
  totalExpenses: number;
  costPrice: number;
}

export function useVehicleWithExpenses(id: string) {
  return useQuery({
    queryKey: [...vehicleKey(id), 'with-expenses'],
    queryFn: async (): Promise<VehicleWithExpenses> => {
      const [vehicleResult, expensesResult] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', id).single(),
        supabase.from('expenses').select('amount_ttc').eq('vehicle_id', id),
      ]);

      if (vehicleResult.error) throw vehicleResult.error;
      if (expensesResult.error) throw expensesResult.error;

      const expenses = (expensesResult.data ?? []) as Array<{ amount_ttc: number }>;
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount_ttc), 0);
      const vehicle = vehicleResult.data as Vehicle;

      return {
        vehicle,
        totalExpenses,
        costPrice: Number(vehicle.purchase_price) + totalExpenses,
      };
    },
    enabled: !!id,
  });
}

// ─── Create vehicle ──────────────────────────────────

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicle: VehicleInsert): Promise<Vehicle> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...vehicle, user_id: user.id } as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;

      const created = data as Vehicle;

      // Créer l'entrée historique initiale
      await supabase.from('vehicle_status_history').insert({
        vehicle_id: created.id,
        from_status: null,
        to_status: vehicle.status ?? 'purchased',
      } as Record<string, unknown>);

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
    },
  });
}

// ─── Update vehicle ──────────────────────────────────

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: VehicleUpdate;
    }): Promise<Vehicle> => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      queryClient.invalidateQueries({ queryKey: vehicleKey(data.id) });
    },
  });
}

// ─── Delete vehicle ──────────────────────────────────

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
    },
  });
}

// ─── Change vehicle status (optimistic) ──────────────

export function useChangeVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      fromStatus,
      toStatus,
      notes,
    }: {
      id: string;
      fromStatus: VehicleStatus;
      toStatus: VehicleStatus;
      notes?: string;
    }): Promise<Vehicle> => {
      const [vehicleResult, historyResult] = await Promise.all([
        supabase
          .from('vehicles')
          .update({ status: toStatus } as Record<string, unknown>)
          .eq('id', id)
          .select()
          .single(),
        supabase.from('vehicle_status_history').insert({
          vehicle_id: id,
          from_status: fromStatus,
          to_status: toStatus,
          notes: notes ?? null,
        } as Record<string, unknown>),
      ]);

      if (vehicleResult.error) throw vehicleResult.error;
      if (historyResult.error) throw historyResult.error;

      return vehicleResult.data as Vehicle;
    },
    // Optimistic update
    onMutate: async ({ id, toStatus }) => {
      await queryClient.cancelQueries({ queryKey: vehicleKey(id) });

      const previousVehicle = queryClient.getQueryData<Vehicle>(vehicleKey(id));

      if (previousVehicle) {
        queryClient.setQueryData<Vehicle>(vehicleKey(id), {
          ...previousVehicle,
          status: toStatus,
        });
      }

      return { previousVehicle };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousVehicle) {
        queryClient.setQueryData(vehicleKey(id), context.previousVehicle);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      queryClient.invalidateQueries({ queryKey: vehicleKey(id) });
      queryClient.invalidateQueries({ queryKey: vehicleHistoryKey(id) });
    },
  });
}

// ─── Fetch vehicle status history ────────────────────

export function useVehicleStatusHistory(vehicleId: string) {
  return useQuery({
    queryKey: vehicleHistoryKey(vehicleId),
    queryFn: async (): Promise<VehicleStatusHistory[]> => {
      const { data, error } = await supabase
        .from('vehicle_status_history')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as VehicleStatusHistory[];
    },
    enabled: !!vehicleId,
  });
}
