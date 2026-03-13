import { Text, View, Pressable } from 'react-native';
import {
  VEHICLE_STATUS_ORDER,
  STATUS_LABELS,
  STATUS_COLORS,
  type VehicleStatus,
} from '@/lib/constants';

interface StatusStepperProps {
  currentStatus: VehicleStatus;
  onChangeStatus: (newStatus: VehicleStatus) => void;
  disabled?: boolean;
}

export function StatusStepper({ currentStatus, onChangeStatus, disabled }: StatusStepperProps) {
  const currentIndex = VEHICLE_STATUS_ORDER.indexOf(currentStatus);

  return (
    <View className="flex-row flex-wrap gap-2">
      {VEHICLE_STATUS_ORDER.map((status, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = status === currentStatus;

        return (
          <Pressable
            key={status}
            className={`px-3 py-2 rounded-xl border ${
              isCurrent
                ? `${STATUS_COLORS[status]} border-transparent`
                : isActive
                  ? 'bg-surface-light border-border'
                  : 'bg-surface border-border opacity-50'
            }`}
            onPress={() => {
              if (!disabled && status !== currentStatus) {
                onChangeStatus(status);
              }
            }}
            disabled={disabled}
            accessibilityLabel={`Changer le statut en ${STATUS_LABELS[status]}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isCurrent, disabled }}
          >
            <Text
              className={`text-xs font-semibold ${
                isCurrent ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {STATUS_LABELS[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
