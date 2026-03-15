import { Text, View } from 'react-native';

interface LegendItemProps {
  color: string;
  label: string;
  value?: number;
}

export function LegendItem({ color, label, value }: LegendItemProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-text-secondary text-xs">
        {label}
        {value !== undefined ? ` (${value})` : ''}
      </Text>
    </View>
  );
}
