import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const ALL_EXPENSES_KEY = ['expenses', 'all'] as const;

interface ExpenseAggregate {
  vehicle_id: string;
  amount_ttc: number;
}

export function useAllExpenses() {
  return useQuery({
    queryKey: ALL_EXPENSES_KEY,
    queryFn: async (): Promise<ExpenseAggregate[]> => {
      const { data, error } = await supabase.from('expenses').select('vehicle_id, amount_ttc');

      if (error) throw error;
      return (data ?? []) as ExpenseAggregate[];
    },
  });
}

export function buildExpenseMap(expenses: ExpenseAggregate[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const exp of expenses) {
    map.set(exp.vehicle_id, (map.get(exp.vehicle_id) ?? 0) + Number(exp.amount_ttc));
  }
  return map;
}
