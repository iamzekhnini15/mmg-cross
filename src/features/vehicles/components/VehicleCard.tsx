import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, StatusBadge } from '@/components/ui';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/lib/constants';
import type { Vehicle } from '@/types/database';
import type { VehicleStatus, FuelType, TransmissionType } from '@/lib/constants';

interface VehicleCardProps {
  vehicle: Vehicle;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/vehicles/${vehicle.id}`)}
      accessibilityLabel={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
      accessibilityRole="button"
    >
      <Card className="mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-text-primary text-lg font-bold" numberOfLines={1}>
              {vehicle.brand} {vehicle.model}
            </Text>
            {vehicle.version ? (
              <Text className="text-text-muted text-sm" numberOfLines={1}>
                {vehicle.version}
              </Text>
            ) : null}
          </View>
          <StatusBadge status={vehicle.status as VehicleStatus} size="sm" />
        </View>

        <View className="flex-row flex-wrap gap-x-4 gap-y-1 mb-3">
          <Text className="text-text-secondary text-sm">{vehicle.year}</Text>
          <Text className="text-text-secondary text-sm">{formatMileage(vehicle.mileage)}</Text>
          <Text className="text-text-secondary text-sm">
            {FUEL_TYPE_LABELS[vehicle.fuel_type as FuelType] ?? vehicle.fuel_type}
          </Text>
          <Text className="text-text-secondary text-sm">
            {TRANSMISSION_LABELS[vehicle.transmission as TransmissionType] ?? vehicle.transmission}
          </Text>
          {vehicle.color ? (
            <Text className="text-text-secondary text-sm">{vehicle.color}</Text>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-text-muted text-xs">Prix d{"'"}achat</Text>
            <Text className="text-text-primary text-base font-semibold">
              {formatPrice(Number(vehicle.purchase_price))}
            </Text>
          </View>
          {vehicle.license_plate ? (
            <View className="bg-surface-light rounded-lg px-3 py-1.5">
              <Text className="text-text-primary text-sm font-mono font-semibold">
                {vehicle.license_plate}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
