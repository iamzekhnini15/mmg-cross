import { Text, View } from 'react-native';
import { Card } from '@/components/ui';

export default function StatsScreen() {
  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <Card>
        <Text className="text-text-primary text-lg font-semibold mb-2">Statistiques</Text>
        <Text className="text-text-muted text-sm">
          Les statistiques (stock, CA, marge, rotation) seront disponibles en Phase 5.
        </Text>
      </Card>
    </View>
  );
}
