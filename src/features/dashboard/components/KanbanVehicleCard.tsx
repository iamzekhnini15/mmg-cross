import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '@/lib/formatters';
import type { KanbanVehicle } from '@/features/dashboard/hooks/useDashboardData';

interface KanbanVehicleCardProps {
  data: KanbanVehicle;
  onPress: (vehicleId: string) => void;
}

export function KanbanVehicleCard({ data, onPress }: KanbanVehicleCardProps) {
  const { vehicle, costPrice, margin, thumbnailUrl } = data;

  return (
    <Pressable
      className="bg-surface-light rounded-xl p-3 mb-2 border border-border active:opacity-80"
      onPress={() => onPress(vehicle.id)}
      accessibilityLabel={`${vehicle.brand} ${vehicle.model}`}
      accessibilityRole="button"
    >
      <View className="flex-row gap-3">
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-16 h-12 rounded-lg"
            contentFit="cover"
          />
        ) : (
          <View className="w-16 h-12 rounded-lg bg-surface items-center justify-center">
            <Ionicons name="car-outline" size={20} color="#6B7280" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 justify-center">
          <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
            {vehicle.brand} {vehicle.model}
          </Text>
          {vehicle.version ? (
            <Text className="text-text-muted text-xs" numberOfLines={1}>
              {vehicle.version}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Prices */}
      <View className="flex-row mt-2 gap-3">
        <View className="flex-1">
          <Text className="text-text-muted text-[10px]">Achat</Text>
          <Text className="text-text-secondary text-xs font-medium">
            {formatPrice(Number(vehicle.purchase_price))}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-text-muted text-[10px]">Revient</Text>
          <Text className="text-text-secondary text-xs font-medium">{formatPrice(costPrice)}</Text>
        </View>
        {margin !== null ? (
          <View className="flex-1">
            <Text className="text-text-muted text-[10px]">Marge</Text>
            <Text
              className={`text-xs font-bold ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatPrice(margin)}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
