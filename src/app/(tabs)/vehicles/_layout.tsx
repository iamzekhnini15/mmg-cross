import { Stack } from 'expo-router';

export default function VehiclesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F0F10' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#0F0F10' },
      }}
    />
  );
}
