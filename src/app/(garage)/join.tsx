import { useState } from 'react';
import { Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui';
import { useJoinGarage } from '@/features/garages/hooks/useGarages';

export default function JoinGarageScreen() {
  const router = useRouter();
  const joinGarage = useJoinGarage();
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Erreur', "Veuillez entrer un code d'invitation.");
      return;
    }

    setIsSubmitting(true);
    try {
      await joinGarage.mutateAsync(inviteCode);
      router.replace('/(garage)/pending' as never);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Code invalide ou erreur';
      Alert.alert('Erreur', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Pressable onPress={() => router.back()} className="absolute top-14 left-6">
        <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
      </Pressable>

      <Ionicons name="enter-outline" size={64} color="#3B82F6" />
      <Text className="text-text-primary text-2xl font-bold mt-6 mb-2">Rejoindre un garage</Text>
      <Text className="text-text-muted text-center mb-8">
        Entrez le code d&apos;invitation fourni par le proprietaire du garage.
      </Text>

      <View className="w-full gap-4">
        <Input
          label="Code d'invitation"
          placeholder="Code d'invitation (6 caracteres)"
          value={inviteCode}
          onChangeText={(text) => setInviteCode(text.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
        />

        <Pressable
          onPress={handleJoin}
          disabled={isSubmitting || inviteCode.length < 6}
          className={`rounded-xl py-4 items-center ${
            isSubmitting || inviteCode.length < 6 ? 'bg-blue-500/50' : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? 'Envoi...' : 'Rejoindre'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
