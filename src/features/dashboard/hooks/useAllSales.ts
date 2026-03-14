import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Sale } from '@/types/database';

export const ALL_SALES_KEY = ['sales', 'all'] as const;

export function useAllSales() {
  return useQuery({
    queryKey: ALL_SALES_KEY,
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Sale[];
    },
  });
}
