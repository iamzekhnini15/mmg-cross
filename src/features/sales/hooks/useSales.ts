import { ALL_SALES_KEY } from '@/features/dashboard/hooks/useAllSales';
import { supabase } from '@/lib/supabase';
import type { Sale, SaleInsert } from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function saleKey(vehicleId: string) {
  return ['sales', vehicleId] as const;
}

// ─── Fetch sale for a vehicle ───────────────────────

export function useSale(vehicleId: string) {
  return useQuery({
    queryKey: saleKey(vehicleId),
    queryFn: async (): Promise<Sale | null> => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

      if (error) throw error;
      return (data as Sale) ?? null;
    },
    enabled: !!vehicleId && vehicleId !== 'undefined',
  });
}

// ─── Generate next invoice number ───────────────────

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  const { data, error } = await supabase
    .from('sales')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].invoice_number.replace(prefix, '');
    nextNumber = parseInt(lastNumber, 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ─── Create sale ────────────────────────────────────

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: SaleInsert): Promise<Sale> => {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;

      // Pass vehicle to "sold" status
      const { error: statusError } = await supabase
        .from('vehicles')
        .update({ status: 'sold' } as Record<string, unknown>)
        .eq('id', sale.vehicle_id);

      if (statusError) throw statusError;

      // Insert status history
      await supabase.from('vehicle_status_history').insert({
        vehicle_id: sale.vehicle_id,
        from_status: null,
        to_status: 'sold',
        notes: `Vente enregistrée - Facture ${sale.invoice_number}`,
      } as Record<string, unknown>);

      return data as Sale;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKey(variables.vehicle_id) });
      queryClient.invalidateQueries({ queryKey: ALL_SALES_KEY });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.vehicle_id] });
    },
  });
}
