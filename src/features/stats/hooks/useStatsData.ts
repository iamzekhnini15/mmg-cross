import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import { VEHICLE_STATUSES } from '@/lib/constants';
import type { Sale } from '@/types/database';
import { useMemo } from 'react';
import { useAllSales } from '@/features/dashboard/hooks/useAllSales';
import type { PeriodFilter, StatsData } from '../types';
import { useAllExpensesFull } from './useAllExpensesFull';

export function useStatsData(periodFilter: PeriodFilter) {
  const vehiclesQuery = useVehicles();
  const salesQuery = useAllSales();
  const expensesQuery = useAllExpensesFull();

  const isLoading = vehiclesQuery.isLoading || salesQuery.isLoading || expensesQuery.isLoading;

  const data = useMemo((): StatsData | null => {
    const vehicles = vehiclesQuery.data;
    const allSales = salesQuery.data;
    const allExpenses = expensesQuery.data;

    if (!vehicles || !allSales || !allExpenses) return null;

    const { startDate, endDate } = periodFilter;
    const inPeriod = (dateStr: string) =>
      periodFilter.type === 'all' || (dateStr >= startDate && dateStr <= endDate);

    // Build sale map (all sales)
    const saleMap = new Map<string, Sale>(allSales.map((s) => [s.vehicle_id, s]));

    // Build expense total map (all expenses)
    const expenseTotalMap = new Map<string, number>();
    for (const exp of allExpenses) {
      expenseTotalMap.set(
        exp.vehicle_id,
        (expenseTotalMap.get(exp.vehicle_id) ?? 0) + Number(exp.amount_ttc),
      );
    }

    // Filter sales by period
    const filteredSales = allSales.filter((s) => inPeriod(s.sale_date));
    const filteredSaleVehicleIds = new Set(filteredSales.map((s) => s.vehicle_id));

    // Sold vehicles (within period)
    const soldVehicles = vehicles.filter((v) => filteredSaleVehicleIds.has(v.id));

    // Unsold vehicles (current state, always real-time)
    const unsoldVehicles = vehicles.filter((v) => v.status !== VEHICLE_STATUSES.SOLD);

    // Purchased vehicles within period
    const purchasedVehicles = vehicles.filter((v) => inPeriod(v.purchase_date));

    // Expenses within period
    const filteredExpenses = allExpenses.filter((e) => inPeriod(e.expense_date));

    return {
      allVehicles: vehicles,
      soldVehicles,
      unsoldVehicles,
      purchasedVehicles,
      filteredSales,
      filteredExpenses,
      saleMap,
      expenseTotalMap,
    };
  }, [vehiclesQuery.data, salesQuery.data, expensesQuery.data, periodFilter]);

  return {
    data,
    isLoading,
    isRefetching:
      vehiclesQuery.isRefetching || salesQuery.isRefetching || expensesQuery.isRefetching,
    error: vehiclesQuery.error || salesQuery.error || expensesQuery.error,
    refetch: () => {
      vehiclesQuery.refetch();
      salesQuery.refetch();
      expensesQuery.refetch();
    },
  };
}
