import { Pressable, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  last?: boolean;
}

export function SettingsRow({
  icon,
  iconColor = '#3B82F6',
  label,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
  destructive = false,
  disabled = false,
  last = false,
}: SettingsRowProps) {
  const iconBgColor = destructive ? 'rgba(239, 68, 68, 0.15)' : `${iconColor}20`;
  const resolvedIconColor = destructive ? '#EF4444' : iconColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row items-center py-3 ${disabled ? 'opacity-40' : ''} ${!last ? 'border-b border-border' : ''}`}
    >
      <View
        className="w-8 h-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={16} color={resolvedIconColor} />
      </View>

      <View className="flex-1 ml-3">
        <Text
          className={`text-sm font-medium ${destructive ? 'text-red-500' : 'text-text-primary'}`}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-text-muted text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ??
        (showChevron && onPress ? (
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        ) : null)}
    </Pressable>
  );
}
