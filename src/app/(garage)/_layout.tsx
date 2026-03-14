import { LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGarageStore } from '@/stores/garageStore';
import { Redirect, Stack } from 'expo-router';

export default function GarageLayout() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGarageLoading = useGarageStore((state) => state.isGarageLoading);
  const hasActiveGarage = useGarageStore((state) => state.hasActiveGarage);

  if (isLoading || isGarageLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (hasActiveGarage) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F10' },
        animation: 'fade',
      }}
    />
  );
}
