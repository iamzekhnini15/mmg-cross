import { STATUS_LABELS, VEHICLE_STATUSES, VEHICLE_STATUS_ORDER } from '@/lib/constants';
import { useMemo } from 'react';
import type { StatsData, StockKPIs } from '../types';

const STATUS_HEX_COLORS: Record<string, string> = {
  [VEHICLE_STATUSES.PURCHASED]: '#6B7280',
  [VEHICLE_STATUSES.TECHNICAL_CONTROL]: '#F97316',
  [VEHICLE_STATUSES.BODYWORK]: '#8B5CF6',
  [VEHICLE_STATUSES.MECHANIC]: '#EF4444',
  [VEHICLE_STATUSES.CLEANING]: '#06B6D4',
  [VEHICLE_STATUSES.READY_FOR_SALE]: '#22C55E',
};

export function useStockKPIs(data: StatsData | null): StockKPIs | null {
  return useMemo(() => {
    if (!data) return null;

    const { unsoldVehicles, expenseTotalMap } = data;

    const stockCount = unsoldVehicles.length;

    // Stock value at cost (purchase + expenses)
    let stockValueAtCost = 0;
    for (const v of unsoldVehicles) {
      stockValueAtCost += Number(v.purchase_price) + (expenseTotalMap.get(v.id) ?? 0);
    }

    // Average stock age
    const now = Date.now();
    let totalAgeDays = 0;
    let vehiclesOver60 = 0;
    let vehiclesOver90 = 0;

    for (const v of unsoldVehicles) {
      const ageDays = Math.floor(
        (now - new Date(v.purchase_date).getTime()) / (1000 * 60 * 60 * 24),
      );
      totalAgeDays += ageDays;
      if (ageDays > 60) vehiclesOver60++;
      if (ageDays > 90) vehiclesOver90++;
    }

    const averageStockAgeDays = stockCount > 0 ? Math.round(totalAgeDays / stockCount) : 0;

    // Pipeline distribution (exclude 'sold')
    const statusCounts = new Map<string, number>();
    for (const v of unsoldVehicles) {
      statusCounts.set(v.status, (statusCounts.get(v.status) ?? 0) + 1);
    }

    const pipelineDistribution = VEHICLE_STATUS_ORDER.filter(
      (s) => s !== VEHICLE_STATUSES.SOLD,
    ).map((status) => {
      const count = statusCounts.get(status) ?? 0;
      return {
        status,
        label: STATUS_LABELS[status],
        count,
        color: STATUS_HEX_COLORS[status] ?? '#6B7280',
        percentage: stockCount > 0 ? (count / stockCount) * 100 : 0,
      };
    });

    return {
      stockCount,
      stockValueAtCost,
      averageStockAgeDays,
      vehiclesOver60Days: vehiclesOver60,
      vehiclesOver90Days: vehiclesOver90,
      pipelineDistribution,
    };
  }, [data]);
}
