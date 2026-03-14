import { useState } from 'react';
import { Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui';
import { garageFormSchema, type GarageFormData } from '@/features/garages/schemas/garageForm';
import { useCreateGarage } from '@/features/garages/hooks/useGarages';

export default function CreateGarageScreen() {
  const router = useRouter();
  const createGarage = useCreateGarage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GarageFormData>({
    resolver: zodResolver(garageFormSchema),
    defaultValues: {
      name: '',
      address: '',
      siret: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: GarageFormData) => {
    setIsSubmitting(true);
    try {
      await createGarage.mutateAsync({
        name: data.name,
        address: data.address || null,
        siret: data.siret || null,
        phone: data.phone || null,
        email: data.email || null,
      });
      router.replace('/(tabs)' as never);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24 }}>
      <Pressable onPress={() => router.back()} className="mb-6">
        <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
      </Pressable>

      <Ionicons name="business-outline" size={48} color="#3B82F6" />
      <Text className="text-text-primary text-2xl font-bold mt-4 mb-2">Creer un garage</Text>
      <Text className="text-text-muted mb-8">Renseignez les informations de votre garage.</Text>

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nom du garage *"
              placeholder="Ex: Garage Dupont"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
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
              placeholder="Adresse du garage"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="siret"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="SIRET"
              placeholder="Numero SIRET"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Telephone"
              placeholder="Telephone du garage"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
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
              placeholder="Email du garage"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`rounded-xl py-4 items-center mt-4 ${isSubmitting ? 'bg-blue-500/50' : 'bg-blue-500'}`}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? 'Creation...' : 'Creer le garage'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
