import { FUEL_TYPE_LABELS, type FuelType } from '@/lib/constants';
import { formatMonthShort } from '@/lib/formatters';
import { useMemo } from 'react';
import type { DonutSegment, StatsData, VehicleKPIs, VehiclePerformance } from '../types';

const FUEL_COLORS: Record<string, string> = {
  essence: '#F97316',
  diesel: '#6B7280',
  hybrid: '#22C55E',
  electric: '#3B82F6',
};

export function useVehicleKPIs(data: StatsData | null): VehicleKPIs | null {
  return useMemo(() => {
    if (!data) return null;

    const { allVehicles, soldVehicles, saleMap, expenseTotalMap } = data;

    // Top brands by average margin
    const brandMargins = new Map<string, number[]>();
    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (!sale) continue;
      const costPrice = Number(v.purchase_price) + (expenseTotalMap.get(v.id) ?? 0);
      const margin = Number(sale.sale_price) - costPrice;
      const arr = brandMargins.get(v.brand) ?? [];
      arr.push(margin);
      brandMargins.set(v.brand, arr);
    }
    const topBrandsByMargin = [...brandMargins.entries()]
      .map(([brand, margins]) => ({
        brand,
        avgMargin: margins.reduce((s, m) => s + m, 0) / margins.length,
      }))
      .sort((a, b) => b.avgMargin - a.avgMargin)
      .slice(0, 5);

    // Fuel distribution (all vehicles)
    const fuelCounts = new Map<string, number>();
    for (const v of allVehicles) {
      fuelCounts.set(v.fuel_type, (fuelCounts.get(v.fuel_type) ?? 0) + 1);
    }
    const fuelDistribution: DonutSegment[] = [...fuelCounts.entries()].map(([fuel, count]) => ({
      value: count,
      color: FUEL_COLORS[fuel] ?? '#6B7280',
      label: FUEL_TYPE_LABELS[fuel as FuelType] ?? fuel,
    }));

    // Average rotation & trend
    const rotationData: { days: number; monthKey: string }[] = [];
    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (!sale) continue;
      const purchaseMs = new Date(v.purchase_date).getTime();
      const saleMs = new Date(sale.sale_date).getTime();
      const days = Math.floor((saleMs - purchaseMs) / (1000 * 60 * 60 * 24));
      if (days >= 0) {
        rotationData.push({ days, monthKey: sale.sale_date.slice(0, 7) });
      }
    }

    const averageRotationDays =
      rotationData.length > 0
        ? Math.round(rotationData.reduce((s, r) => s + r.days, 0) / rotationData.length)
        : 0;

    // Monthly rotation trend
    const monthRotation = new Map<string, number[]>();
    for (const r of rotationData) {
      const arr = monthRotation.get(r.monthKey) ?? [];
      arr.push(r.days);
      monthRotation.set(r.monthKey, arr);
    }
    const rotationTrend = [...monthRotation.keys()].sort().map((month) => {
      const days = monthRotation.get(month) ?? [];
      return {
        month,
        label: formatMonthShort(month),
        value: Math.round(days.reduce((s, d) => s + d, 0) / days.length),
      };
    });

    // Best & worst performers
    const performers: VehiclePerformance[] = [];
    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (!sale) continue;
      const costPrice = Number(v.purchase_price) + (expenseTotalMap.get(v.id) ?? 0);
      const margin = Number(sale.sale_price) - costPrice;
      const purchaseMs = new Date(v.purchase_date).getTime();
      const saleMs = new Date(sale.sale_date).getTime();
      const rotationDays = Math.max(0, Math.floor((saleMs - purchaseMs) / (1000 * 60 * 60 * 24)));

      performers.push({
        id: v.id,
        label: `${v.brand} ${v.model} ${v.year}`,
        margin,
        marginRate: costPrice > 0 ? (margin / costPrice) * 100 : 0,
        rotationDays,
      });
    }

    performers.sort((a, b) => b.margin - a.margin);
    const bestPerformers = performers.slice(0, 3);
    const worstPerformers = performers.slice(-3).reverse();

    return {
      topBrandsByMargin,
      fuelDistribution,
      averageRotationDays,
      rotationTrend,
      bestPerformers,
      worstPerformers,
    };
  }, [data]);
}
