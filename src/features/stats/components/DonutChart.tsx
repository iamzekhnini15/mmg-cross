import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { DonutSegment } from '../types';
import { LegendItem } from './LegendItem';

interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerSubLabel?: string;
  size?: number;
}

export function DonutChart({ data, centerLabel, centerSubLabel, size = 140 }: DonutChartProps) {
  const radius = size / 2;
  const innerRadius = radius * 0.6;

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <View className="items-center py-6">
        <Text className="text-text-muted text-sm">Aucune donnee</Text>
      </View>
    );
  }

  const pieData = data.map((d) => ({
    value: d.value,
    color: d.color,
    text: '',
  }));

  return (
    <View className="items-center">
      <PieChart
        data={pieData}
        donut
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor="#1A1A1B"
        centerLabelComponent={() => (
          <View className="items-center justify-center">
            {centerLabel ? (
              <Text className="text-text-primary text-lg font-bold">{centerLabel}</Text>
            ) : null}
            {centerSubLabel ? (
              <Text className="text-text-muted text-xs">{centerSubLabel}</Text>
            ) : null}
          </View>
        )}
      />
      <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((d) => (
          <LegendItem key={d.label} color={d.color} label={d.label} value={d.value} />
        ))}
      </View>
    </View>
  );
}
