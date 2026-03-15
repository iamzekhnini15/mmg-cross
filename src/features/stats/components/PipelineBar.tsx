import { Text, View } from 'react-native';

interface PipelineBarProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export function PipelineBar({ label, count, percentage, color }: PipelineBarProps) {
  return (
    <View className="mb-2.5">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <Text className="text-text-secondary text-xs">{label}</Text>
        </View>
        <Text className="text-text-primary text-xs font-semibold">{count}</Text>
      </View>
      <View className="h-2 bg-surface-light rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: `${Math.max(percentage, 2)}%`,
          }}
        />
      </View>
    </View>
  );
}
