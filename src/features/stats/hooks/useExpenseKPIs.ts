import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@/lib/constants';
import { useMemo } from 'react';
import type { DonutSegment, ExpenseKPIs, StatsData } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  bodywork: '#8B5CF6',
  mechanic: '#EF4444',
  technical_control: '#F97316',
  cleaning: '#06B6D4',
  administrative: '#3B82F6',
  other: '#6B7280',
};

export function useExpenseKPIs(data: StatsData | null): ExpenseKPIs | null {
  return useMemo(() => {
    if (!data) return null;

    const { filteredExpenses, expenseTotalMap } = data;

    const totalExpensesTTC = filteredExpenses.reduce((sum, e) => sum + Number(e.amount_ttc), 0);

    // Average prep cost per vehicle (using all vehicles that have expenses)
    const vehicleCount = expenseTotalMap.size;
    const totalAllExpenses = [...expenseTotalMap.values()].reduce((s, v) => s + v, 0);
    const averagePrepCost = vehicleCount > 0 ? totalAllExpenses / vehicleCount : 0;

    // Category breakdown
    const catMap = new Map<string, number>();
    for (const e of filteredExpenses) {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount_ttc));
    }
    const categoryBreakdown: DonutSegment[] = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => ({
        value: amount,
        color: CATEGORY_COLORS[cat] ?? '#6B7280',
        label: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat,
      }));

    // Pending invoices
    const pending = filteredExpenses.filter((e) => e.payment_status === 'pending');
    const pendingCount = pending.length;
    const pendingAmount = pending.reduce((sum, e) => sum + Number(e.amount_ttc), 0);

    return {
      totalExpensesTTC,
      averagePrepCost,
      categoryBreakdown,
      pendingCount,
      pendingAmount,
    };
  }, [data]);
}
