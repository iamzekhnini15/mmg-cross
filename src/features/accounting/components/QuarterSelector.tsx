import { quarterLabel } from '@/features/accounting/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface QuarterSelectorProps {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

export function QuarterSelector({
  year,
  quarter,
  onPrev,
  onNext,
  disableNext = false,
}: QuarterSelectorProps) {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 mb-4">
      <Pressable
        onPress={onPrev}
        className="p-1"
        accessibilityLabel="Trimestre précédent"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color="#3B82F6" />
      </Pressable>

      <Text className="text-text-primary text-lg font-semibold">{quarterLabel(year, quarter)}</Text>

      <Pressable
        onPress={disableNext ? undefined : onNext}
        className="p-1"
        style={{ opacity: disableNext ? 0.3 : 1 }}
        accessibilityLabel="Trimestre suivant"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-forward" size={22} color="#3B82F6" />
      </Pressable>
    </View>
  );
}
