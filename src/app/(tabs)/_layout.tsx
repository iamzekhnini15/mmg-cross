import { LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useGarageStore } from '@/stores/garageStore';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

export default function TabsLayout() {
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

  if (!hasActiveGarage) {
    return <Redirect href={'/(garage)' as never} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0F0F10' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#0F0F10',
          borderTopColor: '#2D2D2F',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Véhicules',
          headerShown: false,
          tabBarLabel: 'Véhicules',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Véhicules',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Statistiques',
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garage',
          tabBarLabel: 'Garage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Garage',
        }}
      />
    </Tabs>
  );
}
