import { LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGarageStore } from '@/stores/garageStore';
import { Redirect } from 'expo-router';

export default function Index() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGarageLoading = useGarageStore((state) => state.isGarageLoading);
  const hasActiveGarage = useGarageStore((state) => state.hasActiveGarage);
  const isPending = useGarageStore((state) => state.isPending);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isGarageLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isPending) {
    return <Redirect href={'/(garage)/pending' as never} />;
  }

  if (!hasActiveGarage) {
    return <Redirect href={'/(garage)' as never} />;
  }

  return <Redirect href="/(tabs)" />;
}
