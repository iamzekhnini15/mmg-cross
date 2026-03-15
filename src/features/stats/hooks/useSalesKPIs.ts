import {
  CLIENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type ClientType,
  type PaymentMethod,
} from '@/lib/constants';
import { formatMonthShort } from '@/lib/formatters';
import { useMemo } from 'react';
import type { DonutSegment, SalesKPIs, StatsData } from '../types';

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  transfer: '#3B82F6',
  check: '#8B5CF6',
  cash: '#22C55E',
  financing: '#F97316',
};

const CLIENT_TYPE_COLORS: Record<string, string> = {
  particular: '#3B82F6',
  professional: '#F97316',
};

export function useSalesKPIs(data: StatsData | null): SalesKPIs | null {
  return useMemo(() => {
    if (!data) return null;

    const { filteredSales } = data;
    const salesCount = filteredSales.length;
    const averageSalePrice =
      salesCount > 0
        ? filteredSales.reduce((sum, s) => sum + Number(s.sale_price), 0) / salesCount
        : 0;

    // Sales by month
    const monthMap = new Map<string, number>();
    for (const s of filteredSales) {
      const key = s.sale_date.slice(0, 7);
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
    const sortedMonths = [...monthMap.keys()].sort();
    const salesByMonth = sortedMonths.map((month) => ({
      month,
      label: formatMonthShort(month),
      value: monthMap.get(month) ?? 0,
    }));

    // Best month
    let bestMonth: { label: string; count: number } | null = null;
    for (const dp of salesByMonth) {
      if (!bestMonth || dp.value > bestMonth.count) {
        bestMonth = { label: dp.label, count: dp.value };
      }
    }

    // Payment method distribution
    const pmCounts = new Map<string, number>();
    for (const s of filteredSales) {
      pmCounts.set(s.payment_method, (pmCounts.get(s.payment_method) ?? 0) + 1);
    }
    const paymentMethodDistribution: DonutSegment[] = [...pmCounts.entries()].map(
      ([method, count]) => ({
        value: count,
        color: PAYMENT_METHOD_COLORS[method] ?? '#6B7280',
        label: PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method,
      }),
    );

    // Client type distribution
    const ctCounts = new Map<string, number>();
    for (const s of filteredSales) {
      ctCounts.set(s.client_type, (ctCounts.get(s.client_type) ?? 0) + 1);
    }
    const clientTypeDistribution: DonutSegment[] = [...ctCounts.entries()].map(([type, count]) => ({
      value: count,
      color: CLIENT_TYPE_COLORS[type] ?? '#6B7280',
      label: CLIENT_TYPE_LABELS[type as ClientType] ?? type,
    }));

    return {
      salesCount,
      averageSalePrice,
      salesByMonth,
      bestMonth,
      paymentMethodDistribution,
      clientTypeDistribution,
    };
  }, [data]);
}
