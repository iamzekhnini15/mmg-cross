import { Card } from '@/components/ui';
import { formatDays, formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StockKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { PipelineBar } from './PipelineBar';
import { SectionHeader } from './SectionHeader';

interface StockSectionProps {
  data: StockKPIs;
}

export function StockSection({ data }: StockSectionProps) {
  const {
    pipelineDistribution,
    stockCount,
    stockValueAtCost,
    averageStockAgeDays,
    vehiclesOver60Days,
    vehiclesOver90Days,
  } = data;

  return (
    <View>
      <SectionHeader icon="layers-outline" title="Gestion du stock" color="#3B82F6" />

      <View className="flex-row gap-3 mb-3">
        <Card className="flex-1">
          <Text className="text-text-muted text-xs">Valeur du stock</Text>
          <Text className="text-text-primary text-lg font-bold mt-1">
            {formatPrice(stockValueAtCost)}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">au cout de revient</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-text-muted text-xs">Age moyen</Text>
          <Text className="text-text-primary text-lg font-bold mt-1">
            {formatDays(averageStockAgeDays)}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">{stockCount} vehicule(s)</Text>
        </Card>
      </View>

      {(vehiclesOver60Days > 0 || vehiclesOver90Days > 0) && (
        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="warning-outline" size={16} color="#F97316" />
            <Text className="text-orange-400 text-sm font-semibold">Alertes stock</Text>
          </View>
          {vehiclesOver90Days > 0 && (
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-red-400 text-sm">Plus de 90 jours</Text>
              <Text className="text-red-400 text-sm font-bold">{vehiclesOver90Days}</Text>
            </View>
          )}
          {vehiclesOver60Days > 0 && (
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-orange-400 text-sm">Plus de 60 jours</Text>
              <Text className="text-orange-400 text-sm font-bold">{vehiclesOver60Days}</Text>
            </View>
          )}
        </Card>
      )}

      <ChartCard title="Pipeline" subtitle={`${stockCount} vehicule(s) en stock`}>
        {pipelineDistribution.map((item) => (
          <PipelineBar
            key={item.status}
            label={item.label}
            count={item.count}
            percentage={item.percentage}
            color={item.color}
          />
        ))}
      </ChartCard>
    </View>
  );
}
