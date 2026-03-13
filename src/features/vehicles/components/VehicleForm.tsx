import { useState } from 'react';
import { Text, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Card } from '@/components/ui';
import { useCreateVehicle } from '@/features/vehicles/hooks/useVehicles';
import { vehicleFormSchema, type VehicleFormData } from '@/features/vehicles/schemas/vehicleForm';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, SELLER_TYPE_LABELS } from '@/lib/constants';

const fuelOptions = Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const transmissionOptions = Object.entries(TRANSMISSION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const sellerTypeOptions = Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

export function VehicleForm() {
  const router = useRouter();
  const createVehicle = useCreateVehicle();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      version: '',
      year: new Date().getFullYear(),
      mileage: 0,
      vin: '',
      license_plate: '',
      fuel_type: '' as VehicleFormData['fuel_type'],
      transmission: '' as VehicleFormData['transmission'],
      color: '',
      doors: undefined,
      purchase_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      seller_type: '' as VehicleFormData['seller_type'],
      seller_name: '',
      seller_phone: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitError(null);
      await createVehicle.mutateAsync({
        brand: data.brand,
        model: data.model,
        version: data.version || null,
        year: data.year,
        mileage: data.mileage,
        vin: data.vin || null,
        license_plate: data.license_plate || null,
        fuel_type: data.fuel_type,
        transmission: data.transmission,
        color: data.color || null,
        doors: data.doors ?? null,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        seller_type: data.seller_type,
        seller_name: data.seller_name || null,
        seller_phone: data.seller_phone || null,
        notes: data.notes || null,
        status: data.status,
      });
      Alert.alert('Succès', 'Le véhicule a été ajouté avec succès.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/vehicles') },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'ajout du véhicule";
      setSubmitError(message);
      Alert.alert('Erreur', message);
    }
  });

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 py-4 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Informations principales ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-4">
            Informations du véhicule
          </Text>

          <Controller
            control={control}
            name="brand"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Marque *"
                placeholder="Ex: Renault"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.brand?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="model"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Modèle *"
                placeholder="Ex: Clio"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.model?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="version"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Version / Finition"
                placeholder="Ex: RS Line TCe 140"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.version?.message}
              />
            )}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="year"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Année *"
                    placeholder="2024"
                    value={value ? String(value) : ''}
                    onChangeText={(text) => onChange(parseNumber(text))}
                    onBlur={onBlur}
                    error={errors.year?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="mileage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Kilométrage *"
                    placeholder="50000"
                    value={value ? String(value) : ''}
                    onChangeText={(text) => onChange(parseNumber(text))}
                    onBlur={onBlur}
                    error={errors.mileage?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>
        </Card>

        {/* ── Identification ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-4">Identification</Text>

          <Controller
            control={control}
            name="vin"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Numéro de châssis (VIN)"
                placeholder="17 caractères"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                error={errors.vin?.message}
                autoCapitalize="characters"
                maxLength={17}
              />
            )}
          />

          <Controller
            control={control}
            name="license_plate"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Immatriculation"
                placeholder="AA-123-BB"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                error={errors.license_plate?.message}
                autoCapitalize="characters"
              />
            )}
          />
        </Card>

        {/* ── Caractéristiques ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-4">Caractéristiques</Text>

          <Controller
            control={control}
            name="fuel_type"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Carburant *"
                options={fuelOptions}
                value={value}
                onChange={onChange}
                placeholder="Sélectionner le carburant"
                error={errors.fuel_type?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="transmission"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Boîte de vitesses *"
                options={transmissionOptions}
                value={value}
                onChange={onChange}
                placeholder="Sélectionner la boîte"
                error={errors.transmission?.message}
              />
            )}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="color"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Couleur"
                    placeholder="Noir"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.color?.message}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="doors"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Portes"
                    placeholder="5"
                    value={value !== undefined ? String(value) : ''}
                    onChangeText={(text) => onChange(parseNumber(text))}
                    onBlur={onBlur}
                    error={errors.doors?.message}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>
        </Card>

        {/* ── Achat ── */}
        <Card className="mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-4">
            Informations d{"'"}achat
          </Text>

          <Controller
            control={control}
            name="purchase_price"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Prix d'achat (€) *"
                placeholder="15000"
                value={value ? String(value) : ''}
                onChangeText={(text) => onChange(parseNumber(text))}
                onBlur={onBlur}
                error={errors.purchase_price?.message}
                keyboardType="decimal-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="purchase_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Date d'achat *"
                placeholder="AAAA-MM-JJ"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.purchase_date?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="seller_type"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Type de vendeur *"
                options={sellerTypeOptions}
                value={value}
                onChange={onChange}
                placeholder="Sélectionner le type"
                error={errors.seller_type?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="seller_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nom du vendeur"
                placeholder="Nom ou raison sociale"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.seller_name?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="seller_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Téléphone du vendeur"
                placeholder="06 12 34 56 78"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.seller_phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />
        </Card>

        {/* ── Notes ── */}
        <Card className="mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-4">Notes</Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notes internes"
                placeholder="Observations, défauts, historique..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.notes?.message}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </Card>

        {submitError ? <Text className="text-red-500 text-center mb-4">{submitError}</Text> : null}

        <Button
          onPress={onSubmit}
          loading={createVehicle.isPending}
          accessibilityLabel="Enregistrer le véhicule"
        >
          Enregistrer le véhicule
        </Button>

        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
