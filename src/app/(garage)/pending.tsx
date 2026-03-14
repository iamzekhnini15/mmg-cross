import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import type { Garage, GarageMember } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export default function PendingScreen() {
  const { signOut, user } = useAuth();
  const currentGarage = useGarageStore((state) => state.currentGarage);
  const setGarage = useGarageStore((state) => state.setGarage);

  const handleRefresh = async () => {
    if (!user) return;

    const { data: memberships } = await supabase
      .from('garage_members')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending'])
      .order('status', { ascending: true });

    if (!memberships || memberships.length === 0) {
      setGarage(null, null);
      return;
    }

    const membership =
      (memberships as GarageMember[]).find((m) => m.status === 'active') ??
      (memberships[0] as GarageMember);

    if (membership.status === 'active') {
      const { data: garage } = await supabase
        .from('garages')
        .select('*')
        .eq('id', membership.garage_id)
        .single();

      if (garage) {
        setGarage(garage as Garage, membership);
      }
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="time-outline" size={64} color="#F59E0B" />
      <Text className="text-text-primary text-2xl font-bold mt-6 mb-2">Demande en attente</Text>
      <Text className="text-text-muted text-center mb-2">
        Votre demande pour rejoindre{' '}
        <Text className="text-text-primary font-semibold">
          {currentGarage?.name ?? 'le garage'}
        </Text>{' '}
        est en attente d&apos;approbation.
      </Text>
      <Text className="text-text-muted text-center text-sm mb-10">
        Un administrateur doit accepter votre demande.
      </Text>

      <View className="w-full gap-4">
        <Pressable
          onPress={handleRefresh}
          className="bg-surface-light border border-border rounded-xl py-4 items-center"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="refresh-outline" size={20} color="#9CA3AF" />
            <Text className="text-text-primary text-base font-semibold">Rafraichir</Text>
          </View>
        </Pressable>

        <Pressable onPress={signOut} className="py-3 items-center">
          <Text className="text-text-muted text-sm">Se deconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}
