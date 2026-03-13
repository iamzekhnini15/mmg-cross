import { useState, useMemo, useCallback } from 'react';
import { Text, View, TextInput, Pressable, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/ui';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { StatusFilter } from '@/features/vehicles/components/StatusFilter';
import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import type { VehicleStatus } from '@/lib/constants';
import type { Vehicle } from '@/types/database';

export function VehicleList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);

  const {
    data: vehicles,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useVehicles({
    status: selectedStatus ?? undefined,
    search: searchQuery || undefined,
  });

  // Fetch all vehicles (no filter) for global status counts
  const allVehiclesQuery = useVehicles();
  const globalCounts = useMemo(() => {
    const source = allVehiclesQuery.data;
    if (!source) return undefined;
    const counts: Record<string, number> = {};
    source.forEach((v) => {
      counts[v.status] = (counts[v.status] ?? 0) + 1;
    });
    return counts;
  }, [allVehiclesQuery.data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: Vehicle }) => {
    return <VehicleCard vehicle={item} />;
  }, []);

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
        <Text className="text-text-muted text-center mb-4">{error.message}</Text>
        <Pressable
          onPress={handleRefresh}
          className="bg-accent px-6 py-3 rounded-xl"
          accessibilityLabel="Réessayer"
        >
          <Text className="text-white font-semibold">Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Barre de recherche */}
      <View className="px-4 pt-4">
        <View className="bg-surface border border-border rounded-xl flex-row items-center px-4">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-3 text-text-primary text-base"
            placeholder="Rechercher par marque, modèle, plaque..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#3B82F6"
            accessibilityLabel="Rechercher un véhicule"
            returnKeyType="search"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} accessibilityLabel="Effacer la recherche">
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filtre par statut */}
      <StatusFilter selected={selectedStatus} onSelect={setSelectedStatus} counts={globalCounts} />

      {/* Liste */}
      <FlashList
        data={vehicles ?? []}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="car-outline" size={64} color="#2D2D2F" />
            <Text className="text-text-muted text-lg mt-4 mb-2">
              {searchQuery || selectedStatus ? 'Aucun résultat' : 'Aucun véhicule'}
            </Text>
            <Text className="text-text-muted text-sm text-center mb-6">
              {searchQuery || selectedStatus
                ? 'Essayez de modifier vos filtres'
                : 'Ajoutez votre premier véhicule pour commencer'}
            </Text>
            {!searchQuery && !selectedStatus ? (
              <Link href="/(tabs)/vehicles/new" asChild>
                <Pressable
                  className="bg-accent px-6 py-3 rounded-xl flex-row items-center"
                  accessibilityLabel="Ajouter un véhicule"
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">Ajouter un véhicule</Text>
                </Pressable>
              </Link>
            ) : null}
          </View>
        }
      />

      {/* FAB Ajouter */}
      {(vehicles?.length ?? 0) > 0 ? (
        <Link href="/(tabs)/vehicles/new" asChild>
          <Pressable
            className="absolute bottom-6 right-6 bg-accent w-14 h-14 rounded-full items-center justify-center shadow-lg"
            accessibilityLabel="Ajouter un véhicule"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
