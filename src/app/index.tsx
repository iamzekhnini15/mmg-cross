import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui';

export default function Index() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
