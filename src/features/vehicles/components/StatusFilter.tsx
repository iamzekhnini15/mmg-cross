import { STATUS_LABELS, VEHICLE_STATUS_ORDER, type VehicleStatus } from '@/lib/constants';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface StatusFilterProps {
  selected: VehicleStatus | null;
  onSelect: (status: VehicleStatus | null) => void;
  counts?: Record<string, number>;
}

const STATUS_HEX: Record<VehicleStatus, string> = {
  purchased: '#6B7280',
  technical_control: '#F97316',
  bodywork: '#8B5CF6',
  mechanic: '#EF4444',
  cleaning: '#06B6D4',
  ready_for_sale: '#22C55E',
  sold: '#10B981',
};

export function StatusFilter({ selected, onSelect, counts }: StatusFilterProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      style={{ flexGrow: 0 }}
    >
      {/* Bouton "Tous" */}
      <Pressable
        onPress={() => onSelect(null)}
        accessibilityLabel="Tous les statuts"
        accessibilityRole="radio"
        accessibilityState={{ selected: selected === null }}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 999,
          borderWidth: 1.5,
          borderColor: selected === null ? '#3B82F6' : '#2D2D2F',
          backgroundColor: selected === null ? '#3B82F621' : 'transparent',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#9CA3AF',
          }}
        >
          Tous{totalCount !== null ? ` (${totalCount})` : ''}
        </Text>
      </Pressable>

      {/* Boutons par statut */}
      {VEHICLE_STATUS_ORDER.map((status) => {
        const isSelected = selected === status;
        const color = STATUS_HEX[status];
        return (
          <Pressable
            key={status}
            onPress={() => onSelect(isSelected ? null : status)}
            accessibilityLabel={STATUS_LABELS[status]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: isSelected ? color : '#2D2D2F',
              backgroundColor: isSelected ? `${color}21` : 'transparent',
            }}
          >
            {/* Point de couleur */}
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: color,
                opacity: isSelected ? 1 : 0.5,
              }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: '#9CA3AF',
              }}
            >
              {STATUS_LABELS[status]}
              {counts?.[status] !== undefined ? ` (${counts[status]})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
