import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface MiniKPICardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  subtitle?: string;
}

export function MiniKPICard({ icon, iconColor, label, value, subtitle }: MiniKPICardProps) {
  return (
    <View className="flex-1 bg-surface rounded-xl p-3 border border-border min-w-0">
      <View className="flex-row items-center gap-2 mb-1.5">
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <Text className="text-text-muted text-xs flex-1" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text className="text-text-primary text-lg font-bold" numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text className="text-text-muted text-xs mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
