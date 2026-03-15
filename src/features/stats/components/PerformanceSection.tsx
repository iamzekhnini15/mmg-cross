import { Card } from '@/components/ui';
import { formatDays, formatPercentage, formatPrice } from '@/lib/formatters';
import { LineChart } from 'react-native-gifted-charts';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VehicleKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { SectionHeader } from './SectionHeader';

interface PerformanceSectionProps {
  data: VehicleKPIs;
}

export function PerformanceSection({ data }: PerformanceSectionProps) {
  const { averageRotationDays, rotationTrend, bestPerformers, worstPerformers } = data;

  const lineData = rotationTrend.map((d) => ({
    value: d.value,
    label: d.label,
    labelTextStyle: { color: '#6B7280', fontSize: 9 },
  }));

  return (
    <View>
      <SectionHeader icon="trophy-outline" title="Performance" color="#06B6D4" />

      {lineData.length > 1 ? (
        <ChartCard
          title="Rotation du stock"
          subtitle={`Moyenne : ${formatDays(averageRotationDays)}`}
        >
          <View style={{ marginLeft: -10 }}>
            <LineChart
              data={lineData}
              height={140}
              color="#06B6D4"
              thickness={2}
              curved
              areaChart
              startFillColor="#06B6D420"
              endFillColor="#06B6D400"
              dataPointsColor="#06B6D4"
              dataPointsRadius={4}
              noOfSections={4}
              yAxisTextStyle={{ color: '#6B7280', fontSize: 9 }}
              xAxisColor="#2D2D2F"
              yAxisColor="#2D2D2F"
              rulesColor="#2D2D2F"
              rulesType="dashed"
              backgroundColor="#1A1A1B"
              isAnimated
              animationDuration={400}
            />
          </View>
        </ChartCard>
      ) : null}

      {bestPerformers.length > 0 && (
        <Card className="mt-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="arrow-up-circle-outline" size={16} color="#22C55E" />
            <Text className="text-green-400 text-sm font-semibold">Top 3 marges</Text>
          </View>
          {bestPerformers.map((v, i) => (
            <View
              key={v.id}
              className="flex-row items-center justify-between py-2 border-b border-border"
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-text-muted text-xs w-5">{i + 1}.</Text>
                <Text className="text-text-primary text-sm flex-1" numberOfLines={1}>
                  {v.label}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-green-400 text-sm font-bold">{formatPrice(v.margin)}</Text>
                <Text className="text-text-muted text-xs">
                  {formatPercentage(v.marginRate)} · {formatDays(v.rotationDays)}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {worstPerformers.length > 0 && (
        <Card className="mt-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="arrow-down-circle-outline" size={16} color="#EF4444" />
            <Text className="text-red-400 text-sm font-semibold">Flop 3 marges</Text>
          </View>
          {worstPerformers.map((v, i) => (
            <View
              key={v.id}
              className="flex-row items-center justify-between py-2 border-b border-border"
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-text-muted text-xs w-5">{i + 1}.</Text>
                <Text className="text-text-primary text-sm flex-1" numberOfLines={1}>
                  {v.label}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-sm font-bold ${v.margin < 0 ? 'text-red-400' : 'text-orange-400'}`}
                >
                  {formatPrice(v.margin)}
                </Text>
                <Text className="text-text-muted text-xs">
                  {formatPercentage(v.marginRate)} · {formatDays(v.rotationDays)}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
