import { ALL_EXPENSES_KEY } from '@/features/dashboard/hooks/useAllExpenses';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function expensesKey(vehicleId: string) {
  return ['expenses', vehicleId] as const;
}

// ─── Fetch expenses for a vehicle ───────────────────

export function useExpenses(vehicleId: string) {
  return useQuery({
    queryKey: expensesKey(vehicleId),
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Expense[];
    },
    enabled: !!vehicleId && vehicleId !== 'undefined',
  });
}

// ─── Create expense ─────────────────────────────────

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert): Promise<Expense> => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expensesKey(variables.vehicle_id) });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.vehicle_id] });
      queryClient.invalidateQueries({ queryKey: ALL_EXPENSES_KEY });
    },
  });
}

// ─── Update expense ─────────────────────────────────

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      vehicleId: _vehicleId,
      updates,
    }: {
      id: string;
      vehicleId: string;
      updates: ExpenseUpdate;
    }): Promise<Expense> => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expensesKey(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ALL_EXPENSES_KEY });
    },
  });
}

// ─── Delete expense ─────────────────────────────────

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vehicleId: _vehicleId }: { id: string; vehicleId: string }) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expensesKey(variables.vehicleId) });
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ALL_EXPENSES_KEY });
    },
  });
}

// ─── Expenses summary ───────────────────────────────

interface ExpensesSummary {
  totalHT: number;
  totalTTC: number;
  byCategory: Record<string, number>;
  countPending: number;
  countPaid: number;
}

export function useExpensesSummary(vehicleId: string) {
  const { data: expenses, ...rest } = useExpenses(vehicleId);

  const summary: ExpensesSummary = {
    totalHT: 0,
    totalTTC: 0,
    byCategory: {},
    countPending: 0,
    countPaid: 0,
  };

  if (expenses) {
    for (const expense of expenses) {
      summary.totalHT += Number(expense.amount_ht);
      summary.totalTTC += Number(expense.amount_ttc);
      summary.byCategory[expense.category] =
        (summary.byCategory[expense.category] ?? 0) + Number(expense.amount_ttc);
      if (expense.payment_status === 'pending') {
        summary.countPending++;
      } else {
        summary.countPaid++;
      }
    }
  }

  return { ...rest, data: expenses, summary };
}
