import { Text, View } from 'react-native';

interface StatRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function StatRow({ label, value, valueColor }: StatRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-border">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text className="text-sm font-semibold" style={{ color: valueColor ?? '#FFFFFF' }}>
        {value}
      </Text>
    </View>
  );
}
