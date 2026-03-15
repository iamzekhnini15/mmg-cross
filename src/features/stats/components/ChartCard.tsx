import { Card } from '@/components/ui';
import { Text, View } from 'react-native';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card>
      <View className="mb-3">
        <Text className="text-text-primary text-base font-semibold">{title}</Text>
        {subtitle ? <Text className="text-text-muted text-xs mt-0.5">{subtitle}</Text> : null}
      </View>
      {children}
    </Card>
  );
}
