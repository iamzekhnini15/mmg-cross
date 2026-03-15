import { forwardRef, useCallback, useMemo } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import { useUpdateGarage } from '@/features/garages/hooks/useGarages';
import { garageFormSchema, type GarageFormData } from '@/features/garages/schemas/garageForm';
import type { Garage } from '@/types/database';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

interface EditGarageSheetProps {
  garage: Garage;
  onSuccess: () => void;
}

export const EditGarageSheet = forwardRef<BottomSheet, EditGarageSheetProps>(
  function EditGarageSheet({ garage, onSuccess }, ref) {
    const updateGarage = useUpdateGarage();
    const snapPoints = useMemo(() => ['80%'], []);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<GarageFormData>({
      resolver: zodResolver(garageFormSchema),
      defaultValues: {
        name: garage.name,
        address: garage.address ?? '',
        siret: garage.siret ?? '',
        phone: garage.phone ?? '',
        email: garage.email ?? '',
      },
    });

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    }, [ref]);

    const onSubmit = async (data: GarageFormData) => {
      try {
        await updateGarage.mutateAsync({
          id: garage.id,
          updates: {
            name: data.name,
            address: data.address || null,
            siret: data.siret || null,
            phone: data.phone || null,
            email: data.email || null,
          },
        });
        onSuccess();
        handleClose();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue';
        Alert.alert('Erreur', message);
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={() =>
          reset({
            name: garage.name,
            address: garage.address ?? '',
            siret: garage.siret ?? '',
            phone: garage.phone ?? '',
            email: garage.email ?? '',
          })
        }
        backgroundStyle={{ backgroundColor: '#1A1A1B' }}
        handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-text-primary text-xl font-bold mb-2">Modifier le garage</Text>
          <Text className="text-text-muted text-sm mb-6">
            Mettez a jour les informations de votre garage.
          </Text>

          <View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nom du garage *"
                  placeholder="Mon Garage"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Adresse"
                  placeholder="Rue, ville, code postal"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.address?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="siret"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="SIRET / BCE"
                  placeholder="Numero d'entreprise"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.siret?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Telephone"
                  placeholder="+32 ..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="contact@garage.be"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Button onPress={handleSubmit(onSubmit)} loading={updateGarage.isPending}>
              Enregistrer
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);
