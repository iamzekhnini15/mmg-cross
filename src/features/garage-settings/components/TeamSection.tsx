import { useState } from 'react';
import { Text, View } from 'react-native';

import { ConfirmModal } from '@/components/ui';
import { InviteCodeCard } from '@/features/garages/components/InviteCodeCard';
import { MemberCard } from '@/features/garages/components/MemberCard';
import {
  useGarageMembers,
  useRemoveMember,
  useUpdateMemberRole,
  useUpdateMemberStatus,
} from '@/features/garages/hooks/useGarageMembers';
import type { Garage } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';

interface TeamSectionProps {
  garage: Garage;
  isAdmin: boolean;
  currentUserId?: string;
  onRefresh: () => void;
}

export function TeamSection({ garage, isAdmin, currentUserId, onRefresh }: TeamSectionProps) {
  const { data: members } = useGarageMembers();
  const updateStatus = useUpdateMemberStatus();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const pendingMembers = members?.filter((m) => m.status === 'pending') ?? [];
  const activeMembers = members?.filter((m) => m.status === 'active') ?? [];

  return (
    <View>
      {/* Invite Code */}
      <View className="mb-4">
        <InviteCodeCard
          inviteCode={garage.invite_code}
          garageId={garage.id}
          isAdmin={isAdmin}
          onCodeRegenerated={onRefresh}
        />
      </View>

      {/* Pending Members */}
      {pendingMembers.length > 0 && (
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text className="text-text-primary text-sm font-semibold">
              Demandes en attente ({pendingMembers.length})
            </Text>
          </View>
          {pendingMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onAccept={(id) => updateStatus.mutate({ memberId: id, status: 'active' })}
              onReject={(id) => updateStatus.mutate({ memberId: id, status: 'rejected' })}
            />
          ))}
        </View>
      )}

      {/* Active Members */}
      <View className="mb-2">
        <View className="flex-row items-center gap-2 mb-3">
          <Ionicons name="people-outline" size={16} color="#3B82F6" />
          <Text className="text-text-primary text-sm font-semibold">
            Membres ({activeMembers.length})
          </Text>
        </View>
        {activeMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onChangeRole={(id, role) => updateRole.mutate({ memberId: id, role })}
            onRemove={(id) => setRemoveMemberId(id)}
          />
        ))}
      </View>

      <ConfirmModal
        visible={removeMemberId !== null}
        title="Retirer ce membre"
        message="Voulez-vous vraiment retirer ce membre du garage ?"
        confirmLabel="Retirer"
        onConfirm={() => {
          if (removeMemberId) removeMember.mutate(removeMemberId);
          setRemoveMemberId(null);
        }}
        onCancel={() => setRemoveMemberId(null)}
      />
    </View>
  );
}
