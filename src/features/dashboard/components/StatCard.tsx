import { Card } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  subtitle?: string;
}

export function StatCard({ icon, iconColor, label, value, subtitle }: StatCardProps) {
  return (
    <Card className="flex-row items-center gap-4">
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-text-muted text-sm mb-0.5">{label}</Text>
        <Text className="text-text-primary text-2xl font-bold">{value}</Text>
        {subtitle ? <Text className="text-text-secondary text-xs mt-0.5">{subtitle}</Text> : null}
      </View>
    </Card>
  );
}
