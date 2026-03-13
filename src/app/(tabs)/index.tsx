import { Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card } from '@/components/ui';

export default function DashboardScreen() {
  const { signOut, user } = useAuth();

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <Card>
        <Text className="text-text-primary text-lg font-semibold mb-2">
          Bienvenue sur ManageMyGarage
        </Text>
        <Text className="text-text-secondary text-sm mb-1">
          Connecté en tant que : {user?.email ?? 'N/A'}
        </Text>
        <Text className="text-text-muted text-xs mb-4">
          Le dashboard avec vue Kanban sera disponible en Phase 5.
        </Text>
        <Button variant="destructive" onPress={signOut} accessibilityLabel="Se déconnecter">
          Se déconnecter
        </Button>
      </Card>
    </View>
  );
}
