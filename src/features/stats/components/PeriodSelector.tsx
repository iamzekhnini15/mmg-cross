import { Pressable, ScrollView, Text } from 'react-native';
import type { PeriodType } from '../types';

interface PeriodSelectorProps {
  activeType: PeriodType;
  onChange: (type: PeriodType) => void;
}

const PERIODS: { type: PeriodType; label: string }[] = [
  { type: 'month', label: 'Ce mois' },
  { type: 'quarter', label: 'Trimestre' },
  { type: 'year', label: 'Annee' },
  { type: 'all', label: 'Tout' },
];

export function PeriodSelector({ activeType, onChange }: PeriodSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {PERIODS.map(({ type, label }) => {
        const isActive = activeType === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: isActive ? '#3B82F6' : '#2D2D2F',
              backgroundColor: isActive ? '#3B82F621' : 'transparent',
            }}
          >
            <Text
              className={`text-sm font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
