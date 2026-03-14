import { useState } from 'react';
import { Text, View, Pressable, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRegenerateInviteCode } from '@/features/garages/hooks/useGarages';

interface InviteCodeCardProps {
  inviteCode: string;
  garageId: string;
  isAdmin: boolean;
  onCodeRegenerated?: (newCode: string) => void;
}

export function InviteCodeCard({
  inviteCode,
  garageId,
  isAdmin,
  onCodeRegenerated,
}: InviteCodeCardProps) {
  const regenerateCode = useRegenerateInviteCode();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    try {
      const newCode = await regenerateCode.mutateAsync(garageId);
      onCodeRegenerated?.(newCode);
      Alert.alert('Succes', "Le code d'invitation a ete regenere.");
    } catch {
      Alert.alert('Erreur', 'Impossible de regenerer le code.');
    }
  };

  const confirmRegenerate = () => {
    if (Platform.OS === 'web') {
      handleRegenerate();
      return;
    }
    Alert.alert('Regenerer le code', "L'ancien code ne fonctionnera plus. Continuer ?", [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Regenerer', style: 'destructive', onPress: handleRegenerate },
    ]);
  };

  return (
    <View className="bg-surface-light border border-border rounded-xl p-4">
      <Text className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
        Code d&apos;invitation
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-text-primary text-2xl font-bold tracking-widest">{inviteCode}</Text>

        <View className="flex-row gap-2">
          <Pressable
            onPress={handleCopy}
            className="bg-blue-500/20 rounded-lg px-3 py-2 flex-row items-center gap-1"
          >
            <Ionicons
              name={copied ? 'checkmark-outline' : 'copy-outline'}
              size={16}
              color="#3B82F6"
            />
            <Text className="text-blue-400 text-sm font-medium">
              {copied ? 'Copie !' : 'Copier'}
            </Text>
          </Pressable>

          {isAdmin && (
            <Pressable
              onPress={confirmRegenerate}
              disabled={regenerateCode.isPending}
              className="bg-surface-light border border-border rounded-lg px-3 py-2"
            >
              <Ionicons name="refresh-outline" size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      <Text className="text-text-muted text-xs mt-2">
        Partagez ce code pour inviter des membres.
      </Text>
    </View>
  );
}
