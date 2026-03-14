import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

export default function GarageChoiceScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="business-outline" size={64} color="#3B82F6" />
      <Text className="text-text-primary text-2xl font-bold mt-6 mb-2">Bienvenue sur MMG</Text>
      <Text className="text-text-muted text-center mb-10">
        Pour commencer, creez votre garage ou rejoignez un garage existant.
      </Text>

      <View className="w-full gap-4">
        <Pressable
          onPress={() => router.push('/(garage)/create')}
          className="bg-blue-500 rounded-xl py-4 items-center"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text className="text-white text-base font-semibold">Creer un garage</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(garage)/join')}
          className="bg-surface-light border border-border rounded-xl py-4 items-center"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="enter-outline" size={22} color="#9CA3AF" />
            <Text className="text-text-primary text-base font-semibold">Rejoindre un garage</Text>
          </View>
        </Pressable>

        <Pressable onPress={signOut} className="mt-4 py-3 items-center">
          <Text className="text-text-muted text-sm">Se deconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}
