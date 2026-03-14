import { LoadingSpinner } from '@/components/ui';
import { KanbanBoard } from '@/features/dashboard/components/KanbanBoard';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useGarageStore } from '@/stores/garageStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const garageName = useGarageStore((state) => state.currentGarage?.name);
  const router = useRouter();
  const { columns, isLoading, isRefetching, error, refetch } = useDashboardData();

  const handleVehiclePress = (vehicleId: string) => {
    router.push(`/(tabs)/vehicles/${vehicleId}`);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-text-primary text-lg font-semibold mt-4 mb-2">
          Erreur de chargement
        </Text>
        <Text className="text-text-muted text-center">
          Impossible de charger le tableau de bord.
        </Text>
      </View>
    );
  }

  const totalStock = columns.reduce((sum, col) => sum + col.count, 0);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View>
          <Text className="text-text-primary text-lg font-bold">Tableau de bord</Text>
          <Text className="text-text-muted text-xs">
            {totalStock} vehicule(s) · {garageName ?? ''}
          </Text>
        </View>
        <Pressable
          onPress={signOut}
          accessibilityLabel="Se deconnecter"
          accessibilityRole="button"
          className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-border"
        >
          <Ionicons name="log-out-outline" size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Kanban Board */}
      <KanbanBoard
        columns={columns}
        onVehiclePress={handleVehiclePress}
        isRefetching={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}
