import { STATUS_LABELS, VEHICLE_STATUS_ORDER, type VehicleStatus } from '@/lib/constants';
import { Pressable, Text, View } from 'react-native';

interface StatusFilterProps {
  selected: VehicleStatus | null;
  onSelect: (status: VehicleStatus | null) => void;
  counts?: Record<string, number>;
}

export function StatusFilter({ selected, onSelect, counts }: StatusFilterProps) {
  return (
    <View className="flex-row flex-wrap px-4 py-3 gap-2">
      <Pressable
        className={`px-4 py-2 rounded-full ${selected === null ? 'bg-accent' : 'bg-surface-light'}`}
        onPress={() => onSelect(null)}
        accessibilityLabel="Tous les statuts"
        accessibilityRole="radio"
        accessibilityState={{ selected: selected === null }}
      >
        <Text
          className={`text-sm font-medium ${
            selected === null ? 'text-white' : 'text-text-secondary'
          }`}
        >
          Tous{counts ? ` (${Object.values(counts).reduce((a, b) => a + b, 0)})` : ''}
        </Text>
      </Pressable>

      {VEHICLE_STATUS_ORDER.map((status) => (
        <Pressable
          key={status}
          className={`px-4 py-2 rounded-full ${
            selected === status ? 'bg-accent' : 'bg-surface-light'
          }`}
          onPress={() => onSelect(selected === status ? null : status)}
          accessibilityLabel={STATUS_LABELS[status]}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === status }}
        >
          <Text
            className={`text-sm font-medium ${
              selected === status ? 'text-white' : 'text-text-secondary'
            }`}
          >
            {STATUS_LABELS[status]}
            {counts?.[status] !== undefined ? ` (${counts[status]})` : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
