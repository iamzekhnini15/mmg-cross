import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import type { Expense, Sale, Vehicle } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getQuarterRange } from '../types';

// ─── Fetch all vehicles for a garage ─────────────────

function useAllVehicles(garageId: string | undefined) {
  return useQuery({
    queryKey: ['vehicles', 'all', garageId],
    queryFn: async (): Promise<Vehicle[]> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('purchase_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vehicle[];
    },
    enabled: !!garageId,
  });
}

// ─── Fetch all sales for a garage ────────────────────

function useAllSalesAccounting(garageId: string | undefined) {
  return useQuery({
    queryKey: ['sales', 'accounting', 'all', garageId],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Sale[];
    },
    enabled: !!garageId,
  });
}

// ─── Fetch all expenses for a garage ─────────────────

function useAllExpensesAccounting(garageId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', 'accounting', 'all', garageId],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
    enabled: !!garageId,
  });
}

// ─── Main hook: data filtered by quarter ─────────────

export interface QuarterlyData {
  /** Vehicles whose sale_date falls within the quarter */
  soldVehicles: Vehicle[];
  /** All vehicles purchased within the quarter */
  purchasedVehicles: Vehicle[];
  /** Expenses with expense_date within the quarter */
  quarterExpenses: Expense[];
  /** Sales within the quarter */
  quarterSales: Sale[];
  /** Map vehicleId → sale */
  saleMap: Map<string, Sale>;
  /** Map vehicleId → expenses[] */
  expenseMap: Map<string, Expense[]>;
  /** Map vehicleId → vehicle */
  vehicleMap: Map<string, Vehicle>;
}

export function useQuarterlyData(year: number, quarter: 1 | 2 | 3 | 4) {
  const garageId = useGarageStore((s) => s.currentGarage?.id);
  const vehiclesQuery = useAllVehicles(garageId);
  const salesQuery = useAllSalesAccounting(garageId);
  const expensesQuery = useAllExpensesAccounting(garageId);

  const isLoading = vehiclesQuery.isLoading || salesQuery.isLoading || expensesQuery.isLoading;

  const data = useMemo((): QuarterlyData | null => {
    const vehicles = vehiclesQuery.data;
    const sales = salesQuery.data;
    const expenses = expensesQuery.data;

    if (!vehicles || !sales || !expenses) return null;

    const { start, end } = getQuarterRange(year, quarter);

    const inPeriod = (dateStr: string) => dateStr >= start && dateStr <= end;

    // Quarter sales
    const quarterSales = sales.filter((s) => inPeriod(s.sale_date));
    const saleMap = new Map(sales.map((s) => [s.vehicle_id, s]));

    // Vehicles sold this quarter
    const soldVehicleIds = new Set(quarterSales.map((s) => s.vehicle_id));
    const soldVehicles = vehicles.filter((v) => soldVehicleIds.has(v.id));

    // Vehicles purchased this quarter
    const purchasedVehicles = vehicles.filter((v) => inPeriod(v.purchase_date));

    // Expenses for this quarter
    const quarterExpenses = expenses.filter((e) => inPeriod(e.expense_date));

    // Expense map (all, not just quarter – needed for TVA on sold vehicles)
    const expenseMap = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const arr = expenseMap.get(exp.vehicle_id) ?? [];
      arr.push(exp);
      expenseMap.set(exp.vehicle_id, arr);
    }

    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    return {
      soldVehicles,
      purchasedVehicles,
      quarterExpenses,
      quarterSales,
      saleMap,
      expenseMap,
      vehicleMap,
    };
  }, [vehiclesQuery.data, salesQuery.data, expensesQuery.data, year, quarter]);

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
