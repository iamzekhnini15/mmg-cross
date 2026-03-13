import { Text, View } from 'react-native';
import { STATUS_LABELS, STATUS_COLORS, type VehicleStatus } from '@/lib/constants';

interface StatusBadgeProps {
  status: VehicleStatus;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 rounded-md',
  md: 'px-3 py-1 rounded-lg',
};

const sizeTextClasses = {
  sm: 'text-xs',
  md: 'text-sm',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <View className={`self-start flex-row items-center ${sizeClasses[size]}`}>
      <View className={`w-2 h-2 rounded-full mr-2 ${STATUS_COLORS[status]}`} />
      <Text className={`font-medium text-text-primary ${sizeTextClasses[size]}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
