import { formatDays, formatPrice } from '@/lib/formatters';
import { View } from 'react-native';
import type { FinancialKPIs, SalesKPIs, StockKPIs, VehicleKPIs } from '../types';
import { MiniKPICard } from './MiniKPICard';

interface KPISummaryGridProps {
  financial: FinancialKPIs | null;
  stock: StockKPIs | null;
  sales: SalesKPIs | null;
  vehicle: VehicleKPIs | null;
}

export function KPISummaryGrid({ financial, stock, sales, vehicle }: KPISummaryGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <MiniKPICard
          icon="cash-outline"
          iconColor="#22C55E"
          label="CA realise"
          value={formatPrice(financial?.totalRevenue ?? 0)}
          subtitle={`${sales?.salesCount ?? 0} vente(s)`}
        />
        <MiniKPICard
          icon="trending-up-outline"
          iconColor="#10B981"
          label="Marge brute"
          value={formatPrice(financial?.totalMargin ?? 0)}
          subtitle={`Moy. ${formatPrice(financial?.averageMargin ?? 0)}`}
        />
      </View>
      <View className="flex-row gap-3">
        <MiniKPICard
          icon="car-outline"
          iconColor="#3B82F6"
          label="En stock"
          value={String(stock?.stockCount ?? 0)}
          subtitle={formatPrice(stock?.stockValueAtCost ?? 0)}
        />
        <MiniKPICard
          icon="time-outline"
          iconColor="#06B6D4"
          label="Rotation"
          value={vehicle?.averageRotationDays ? formatDays(vehicle.averageRotationDays) : 'N/A'}
          subtitle="achat → vente"
        />
      </View>
    </View>
  );
}
