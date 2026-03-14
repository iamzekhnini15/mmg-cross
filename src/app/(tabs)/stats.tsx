import { ScrollView, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/ui';
import { useStats } from '@/features/dashboard/hooks/useStats';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { formatPrice, formatDays } from '@/lib/formatters';

export default function StatsScreen() {
  const { stats, isLoading, isRefetching, error, refetch } = useStats();

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
        <Text className="text-text-muted text-center">Impossible de charger les statistiques.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 py-4 gap-4 pb-10"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <StatCard
        icon="car-outline"
        iconColor="#3B82F6"
        label="Stock actuel"
        value={String(stats?.stockCount ?? 0)}
        subtitle={`sur ${stats?.totalVehicles ?? 0} vehicule(s) au total`}
      />

      <StatCard
        icon="cash-outline"
        iconColor="#22C55E"
        label="Chiffre d'affaires"
        value={formatPrice(stats?.totalRevenue ?? 0)}
        subtitle={`${stats?.soldCount ?? 0} vente(s)`}
      />

      <StatCard
        icon="trending-up-outline"
        iconColor="#10B981"
        label="Marge moyenne"
        value={formatPrice(stats?.averageMargin ?? 0)}
        subtitle={stats?.soldCount ? `sur ${stats.soldCount} vente(s)` : 'Aucune vente'}
      />

      <StatCard
        icon="construct-outline"
        iconColor="#F97316"
        label="Cout moyen de preparation"
        value={formatPrice(stats?.averagePrepCost ?? 0)}
      />

      <StatCard
        icon="time-outline"
        iconColor="#06B6D4"
        label="Rotation du stock"
        value={stats?.averageRotationDays ? formatDays(stats.averageRotationDays) : 'N/A'}
        subtitle="duree moyenne achat → vente"
      />
    </ScrollView>
  );
}
