import { useCallback } from 'react';
import { Text, View, ScrollView, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge, LoadingSpinner, Button } from '@/components/ui';
import { StatusStepper } from '@/features/vehicles/components/StatusStepper';
import { StatusHistory } from '@/features/vehicles/components/StatusHistory';
import { ExpenseList } from '@/features/expenses/components/ExpenseList';
import { PhotoGallery } from '@/features/media/components/PhotoGallery';
import { DocumentList } from '@/features/media/components/DocumentList';
import {
  useVehicleWithExpenses,
  useChangeVehicleStatus,
  useDeleteVehicle,
} from '@/features/vehicles/hooks/useVehicles';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  SELLER_TYPE_LABELS,
  STATUS_LABELS,
  type VehicleStatus,
  type FuelType,
  type TransmissionType,
  type SellerType,
} from '@/lib/constants';

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <View className="flex-row items-start py-2 border-b border-border/50">
      <Text className="text-text-muted text-sm w-40">{label}</Text>
      <Text className="text-text-primary text-sm flex-1 font-medium">{value}</Text>
    </View>
  );
}

export function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useVehicleWithExpenses(id);
  const changeStatus = useChangeVehicleStatus();
  const deleteVehicle = useDeleteVehicle();

  const vehicle = data?.vehicle;
  const totalExpenses = data?.totalExpenses ?? 0;
  const costPrice = data?.costPrice ?? 0;

  const handleStatusChange = useCallback(
    (newStatus: VehicleStatus) => {
      if (!vehicle) return;

      const currentLabel = STATUS_LABELS[vehicle.status as VehicleStatus];
      const newLabel = STATUS_LABELS[newStatus];

      Alert.alert('Changer le statut', `Passer de "${currentLabel}" à "${newLabel}" ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            changeStatus.mutate({
              id: vehicle.id,
              fromStatus: vehicle.status as VehicleStatus,
              toStatus: newStatus,
            });
          },
        },
      ]);
    },
    [vehicle, changeStatus],
  );

  const handleDelete = useCallback(() => {
    if (!vehicle) return;

    Alert.alert(
      'Supprimer le véhicule',
      `Voulez-vous vraiment supprimer ${vehicle.brand} ${vehicle.model} ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle.mutateAsync(vehicle.id);
              router.back();
            } catch (err) {
              Alert.alert(
                'Erreur',
                err instanceof Error ? err.message : 'Impossible de supprimer le véhicule',
              );
            }
          },
        },
      ],
    );
  }, [vehicle, deleteVehicle, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !vehicle) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-text-primary text-lg font-semibold mt-4 mb-2">
          Véhicule introuvable
        </Text>
        <Text className="text-text-muted text-center mb-4">
          {error?.message ?? "Ce véhicule n'existe pas ou a été supprimé."}
        </Text>
        <Button onPress={() => router.back()} variant="secondary" accessibilityLabel="Retour">
          Retour
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${vehicle.brand} ${vehicle.model}`,
          headerRight: () => (
            <Pressable
              onPress={handleDelete}
              className="mr-2"
              accessibilityLabel="Supprimer le véhicule"
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background" contentContainerClassName="px-4 py-4 pb-10">
        {/* ── En-tête ── */}
        <Card className="mb-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-text-primary text-2xl font-bold">
                {vehicle.brand} {vehicle.model}
              </Text>
              {vehicle.version ? (
                <Text className="text-text-muted text-base mt-1">{vehicle.version}</Text>
              ) : null}
            </View>
            <StatusBadge status={vehicle.status as VehicleStatus} />
          </View>

          {vehicle.license_plate ? (
            <View className="bg-surface-light self-start rounded-lg px-4 py-2 mb-4">
              <Text className="text-text-primary text-lg font-bold tracking-wider">
                {vehicle.license_plate}
              </Text>
            </View>
          ) : null}

          {/* Résumé financier */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface-light rounded-xl p-3">
              <Text className="text-text-muted text-xs mb-1">Prix d{"'"}achat</Text>
              <Text className="text-text-primary text-lg font-bold">
                {formatPrice(Number(vehicle.purchase_price))}
              </Text>
            </View>
            <View className="flex-1 bg-surface-light rounded-xl p-3">
              <Text className="text-text-muted text-xs mb-1">Frais</Text>
              <Text className="text-orange-400 text-lg font-bold">
                {formatPrice(totalExpenses)}
              </Text>
            </View>
            <View className="flex-1 bg-surface-light rounded-xl p-3">
              <Text className="text-text-muted text-xs mb-1">Coût de revient</Text>
              <Text className="text-accent text-lg font-bold">{formatPrice(costPrice)}</Text>
            </View>
          </View>
        </Card>

        {/* ── Pipeline de statut ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Statut de préparation
          </Text>
          <StatusStepper
            currentStatus={vehicle.status as VehicleStatus}
            onChangeStatus={handleStatusChange}
            disabled={changeStatus.isPending}
          />
        </Card>

        {/* ── Caractéristiques ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-3">Caractéristiques</Text>
          <InfoRow label="Année" value={String(vehicle.year)} />
          <InfoRow label="Kilométrage" value={formatMileage(vehicle.mileage)} />
          <InfoRow
            label="Carburant"
            value={FUEL_TYPE_LABELS[vehicle.fuel_type as FuelType] ?? vehicle.fuel_type}
          />
          <InfoRow
            label="Boîte de vitesses"
            value={
              TRANSMISSION_LABELS[vehicle.transmission as TransmissionType] ?? vehicle.transmission
            }
          />
          <InfoRow label="Couleur" value={vehicle.color} />
          <InfoRow label="Portes" value={vehicle.doors ? String(vehicle.doors) : null} />
          <InfoRow label="VIN" value={vehicle.vin} />
        </Card>

        {/* ── Informations d'achat ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Informations d{"'"}achat
          </Text>
          <InfoRow label="Prix d'achat" value={formatPrice(Number(vehicle.purchase_price))} />
          <InfoRow label="Date d'achat" value={formatDate(vehicle.purchase_date)} />
          <InfoRow
            label="Type de vendeur"
            value={SELLER_TYPE_LABELS[vehicle.seller_type as SellerType] ?? vehicle.seller_type}
          />
          <InfoRow label="Nom du vendeur" value={vehicle.seller_name} />
          <InfoRow label="Téléphone vendeur" value={vehicle.seller_phone} />
        </Card>

        {/* ── Notes ── */}
        {vehicle.notes ? (
          <Card className="mb-4">
            <Text className="text-text-primary text-lg font-semibold mb-3">Notes</Text>
            <Text className="text-text-secondary text-sm leading-5">{vehicle.notes}</Text>
          </Card>
        ) : null}

        {/* ── Frais de préparation ── */}
        <ExpenseList vehicleId={vehicle.id} />

        {/* ── Photos ── */}
        <PhotoGallery vehicleId={vehicle.id} />

        {/* ── Documents ── */}
        <DocumentList vehicleId={vehicle.id} />

        {/* ── Historique des statuts ── */}
        <StatusHistory vehicleId={vehicle.id} />
      </ScrollView>
    </>
  );
}
