import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types/database';
import { useQuery } from '@tanstack/react-query';

export const ALL_EXPENSES_FULL_KEY = ['expenses', 'all', 'full'] as const;

export function useAllExpensesFull() {
  return useQuery({
    queryKey: ALL_EXPENSES_FULL_KEY,
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });
}
