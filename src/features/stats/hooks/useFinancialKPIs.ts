import { formatMonthShort } from '@/lib/formatters';
import { useMemo } from 'react';
import type { FinancialKPIs, StatsData } from '../types';

export function useFinancialKPIs(data: StatsData | null): FinancialKPIs | null {
  return useMemo(() => {
    if (!data) return null;

    const { soldVehicles, filteredSales, saleMap, expenseTotalMap } = data;

    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.sale_price), 0);

    // Compute margins for each sold vehicle
    const margins: number[] = [];
    const rois: number[] = [];
    const marginRates: number[] = [];

    for (const v of soldVehicles) {
      const sale = saleMap.get(v.id);
      if (!sale) continue;
      const costPrice = Number(v.purchase_price) + (expenseTotalMap.get(v.id) ?? 0);
      const margin = Number(sale.sale_price) - costPrice;
      margins.push(margin);
      if (costPrice > 0) rois.push((margin / costPrice) * 100);
      if (Number(sale.sale_price) > 0) marginRates.push((margin / Number(sale.sale_price)) * 100);
    }

    const totalMargin = margins.reduce((s, m) => s + m, 0);
    const averageMargin = margins.length > 0 ? totalMargin / margins.length : 0;
    const minMargin = margins.length > 0 ? Math.min(...margins) : 0;
    const maxMargin = margins.length > 0 ? Math.max(...margins) : 0;
    const marginRate =
      marginRates.length > 0 ? marginRates.reduce((s, r) => s + r, 0) / marginRates.length : 0;
    const averageROI = rois.length > 0 ? rois.reduce((s, r) => s + r, 0) / rois.length : 0;

    // Monthly revenue & margin
    const monthlyRevenueMap = new Map<string, number>();
    const monthlyMarginMap = new Map<string, number>();

    for (const sale of filteredSales) {
      const monthKey = sale.sale_date.slice(0, 7); // "YYYY-MM"
      monthlyRevenueMap.set(
        monthKey,
        (monthlyRevenueMap.get(monthKey) ?? 0) + Number(sale.sale_price),
      );

      const vehicle = soldVehicles.find((v) => v.id === sale.vehicle_id);
      if (vehicle) {
        const costPrice = Number(vehicle.purchase_price) + (expenseTotalMap.get(vehicle.id) ?? 0);
        const margin = Number(sale.sale_price) - costPrice;
        monthlyMarginMap.set(monthKey, (monthlyMarginMap.get(monthKey) ?? 0) + margin);
      }
    }

    const sortedMonths = [
      ...new Set([...monthlyRevenueMap.keys(), ...monthlyMarginMap.keys()]),
    ].sort();

    const monthlyRevenue = sortedMonths.map((month) => ({
      month,
      label: formatMonthShort(month),
      value: monthlyRevenueMap.get(month) ?? 0,
    }));

    const monthlyMargin = sortedMonths.map((month) => ({
      month,
      label: formatMonthShort(month),
      value: monthlyMarginMap.get(month) ?? 0,
    }));

    return {
      totalRevenue,
      totalMargin,
      averageMargin,
      minMargin,
      maxMargin,
      marginRate,
      averageROI,
      monthlyRevenue,
      monthlyMargin,
    };
  }, [data]);
}
