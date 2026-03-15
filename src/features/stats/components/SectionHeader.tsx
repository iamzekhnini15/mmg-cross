import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
}

export function SectionHeader({ icon, title, color = '#3B82F6' }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-2">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-text-primary text-lg font-bold">{title}</Text>
    </View>
  );
}
