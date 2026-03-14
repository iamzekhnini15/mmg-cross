import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import { VEHICLE_STATUSES } from '@/lib/constants';
import { useMemo } from 'react';
import { buildExpenseMap, useAllExpenses } from './useAllExpenses';
import { useAllSales } from './useAllSales';

export interface DashboardStats {
  stockCount: number;
  totalRevenue: number;
  averageMargin: number;
  averagePrepCost: number;
  averageRotationDays: number;
  soldCount: number;
  totalVehicles: number;
}

export function useStats() {
  const vehiclesQuery = useVehicles();
  const expensesQuery = useAllExpenses();
  const salesQuery = useAllSales();

  const isLoading = vehiclesQuery.isLoading || expensesQuery.isLoading || salesQuery.isLoading;

  const stats = useMemo((): DashboardStats | null => {
    const vehicles = vehiclesQuery.data;
    const allExpenses = expensesQuery.data;
    const allSales = salesQuery.data;

    if (!vehicles || !allExpenses || !allSales) return null;

    const expenseMap = buildExpenseMap(allExpenses);
    const saleMap = new Map(allSales.map((s) => [s.vehicle_id, s]));

    // 1. Stock actuel
    const stockCount = vehicles.filter((v) => v.status !== VEHICLE_STATUSES.SOLD).length;

    // 2. CA realise
    const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.sale_price), 0);

    // 3. Marge moyenne
    const soldVehicles = vehicles.filter((v) => v.status === VEHICLE_STATUSES.SOLD);
    let totalMargin = 0;
    let marginCount = 0;
    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (sale) {
        const costPrice = Number(v.purchase_price) + (expenseMap.get(v.id) ?? 0);
        totalMargin += Number(sale.sale_price) - costPrice;
        marginCount++;
      }
    }
    const averageMargin = marginCount > 0 ? totalMargin / marginCount : 0;

    // 4. Cout moyen de preparation
    let totalPrepCost = 0;
    for (const amount of expenseMap.values()) {
      totalPrepCost += amount;
    }
    const vehiclesWithExpenses = [...expenseMap.keys()].length;
    const averagePrepCost = vehiclesWithExpenses > 0 ? totalPrepCost / vehiclesWithExpenses : 0;

    // 5. Rotation du stock (jours moyens achat → vente)
    let totalDays = 0;
    let rotationCount = 0;
    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (sale) {
        const purchaseMs = new Date(v.purchase_date).getTime();
        const saleMs = new Date(sale.sale_date).getTime();
        const diffDays = Math.floor((saleMs - purchaseMs) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          totalDays += diffDays;
          rotationCount++;
        }
      }
    }
    const averageRotationDays = rotationCount > 0 ? Math.round(totalDays / rotationCount) : 0;

    return {
      stockCount,
      totalRevenue,
      averageMargin,
      averagePrepCost,
      averageRotationDays,
      soldCount: soldVehicles.length,
      totalVehicles: vehicles.length,
    };
  }, [vehiclesQuery.data, expensesQuery.data, salesQuery.data]);

  return {
    stats,
    isLoading,
    isRefetching:
      vehiclesQuery.isRefetching || expensesQuery.isRefetching || salesQuery.isRefetching,
    error: vehiclesQuery.error || expensesQuery.error || salesQuery.error,
    refetch: () => {
      vehiclesQuery.refetch();
      expensesQuery.refetch();
      salesQuery.refetch();
    },
  };
}
