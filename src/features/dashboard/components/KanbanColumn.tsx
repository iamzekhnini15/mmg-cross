import { ScrollView, Text, View } from 'react-native';
import { STATUS_COLORS } from '@/lib/constants';
import { KanbanVehicleCard } from './KanbanVehicleCard';
import type { KanbanColumn as KanbanColumnType } from '@/features/dashboard/hooks/useDashboardData';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onVehiclePress: (vehicleId: string) => void;
  width: number;
}

export function KanbanColumn({ column, onVehiclePress, width }: KanbanColumnProps) {
  const bgColor = STATUS_COLORS[column.status] ?? 'bg-gray-500/20';

  return (
    <View style={{ width }}>
      {/* Header */}
      <View className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${bgColor}`}>
        <Text className="text-sm font-semibold flex-1 text-white">{column.label}</Text>
        <View className="bg-white/20 rounded-full px-2.5 py-0.5">
          <Text className="text-xs font-bold text-white">{column.count}</Text>
        </View>
      </View>

      {/* Vehicle cards */}
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-4"
      >
        {column.vehicles.length > 0 ? (
          column.vehicles.map((item) => (
            <KanbanVehicleCard key={item.vehicle.id} data={item} onPress={onVehiclePress} />
          ))
        ) : (
          <View className="items-center py-8 px-4">
            <Text className="text-text-muted text-xs text-center">Aucun vehicule</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
