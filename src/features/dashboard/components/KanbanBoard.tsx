import { RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { KanbanColumn } from './KanbanColumn';
import type { KanbanColumn as KanbanColumnType } from '@/features/dashboard/hooks/useDashboardData';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  onVehiclePress: (vehicleId: string) => void;
  isRefetching: boolean;
  onRefresh: () => void;
}

export function KanbanBoard({
  columns,
  onVehiclePress,
  isRefetching,
  onRefresh,
}: KanbanBoardProps) {
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const PADDING = 32; // 16px de chaque côté
  const GAP = 12;
  const totalGap = GAP * (columns.length - 1);

  const colWidth = isMobile
    ? width - PADDING
    : Math.floor((width - PADDING - totalGap) / columns.length);

  return (
    <View className="flex-1">
      <ScrollView
        horizontal={false} // jamais de scroll horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          isMobile
            ? { paddingHorizontal: 16, paddingVertical: 8, gap: GAP }
            : {
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                gap: GAP,
              }
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            column={column}
            onVehiclePress={onVehiclePress}
            width={colWidth}
          />
        ))}
      </ScrollView>
    </View>
  );
}
