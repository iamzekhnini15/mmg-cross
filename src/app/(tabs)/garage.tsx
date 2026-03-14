import { Text, View, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useGarageStore } from '@/stores/garageStore';
import { useCurrentGarageDetails } from '@/features/garages/hooks/useGarages';
import {
  useGarageMembers,
  useUpdateMemberStatus,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/features/garages/hooks/useGarageMembers';
import { MemberCard } from '@/features/garages/components/MemberCard';
import { InviteCodeCard } from '@/features/garages/components/InviteCodeCard';
import { LoadingSpinner } from '@/components/ui';

export default function GarageScreen() {
  const { user } = useAuth();
  const currentMembership = useGarageStore((state) => state.currentMembership);
  const {
    data: garage,
    isLoading: garageLoading,
    refetch: refetchGarage,
  } = useCurrentGarageDetails();
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useGarageMembers();
  const updateStatus = useUpdateMemberStatus();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const isAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';

  const handleRefresh = () => {
    refetchGarage();
    refetchMembers();
  };

  if (garageLoading || membersLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!garage) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-muted">Aucun garage</Text>
      </View>
    );
  }

  const pendingMembers = members?.filter((m) => m.status === 'pending') ?? [];
  const activeMembers = members?.filter((m) => m.status === 'active') ?? [];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Garage Info */}
      <View className="bg-surface-light border border-border rounded-xl p-4 mb-4">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
            <Ionicons name="business" size={24} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary text-lg font-bold">{garage.name}</Text>
            {garage.address && <Text className="text-text-muted text-sm">{garage.address}</Text>}
          </View>
        </View>

        {(garage.siret || garage.phone || garage.email) && (
          <View className="border-t border-border pt-3 gap-1">
            {garage.siret && (
              <View className="flex-row items-center gap-2">
                <Ionicons name="document-text-outline" size={14} color="#6B7280" />
                <Text className="text-text-muted text-sm">SIRET : {garage.siret}</Text>
              </View>
            )}
            {garage.phone && (
              <View className="flex-row items-center gap-2">
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text className="text-text-muted text-sm">{garage.phone}</Text>
              </View>
            )}
            {garage.email && (
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text className="text-text-muted text-sm">{garage.email}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Invite Code */}
      <View className="mb-4">
        <InviteCodeCard
          inviteCode={garage.invite_code}
          garageId={garage.id}
          isAdmin={isAdmin}
          onCodeRegenerated={() => refetchGarage()}
        />
      </View>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <View className="mb-4">
          <Text className="text-text-primary text-base font-semibold mb-3">
            Demandes en attente ({pendingMembers.length})
          </Text>
          {pendingMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              onAccept={(id) => updateStatus.mutate({ memberId: id, status: 'active' })}
              onReject={(id) => updateStatus.mutate({ memberId: id, status: 'rejected' })}
            />
          ))}
        </View>
      )}

      {/* Active Members */}
      <View className="mb-4">
        <Text className="text-text-primary text-base font-semibold mb-3">
          Membres ({activeMembers.length})
        </Text>
        {activeMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onChangeRole={(id, role) => updateRole.mutate({ memberId: id, role })}
            onRemove={(id) => removeMember.mutate(id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
