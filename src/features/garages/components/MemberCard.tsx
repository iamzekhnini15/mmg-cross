import {
  GARAGE_ROLE_LABELS,
  MEMBER_STATUS_LABELS,
  type GarageRole,
  type MemberStatus,
} from '@/lib/constants';
import type { GarageMember } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface MemberCardProps {
  member: GarageMember;
  isAdmin: boolean;
  currentUserId: string | undefined;
  onAccept?: (memberId: string) => void;
  onReject?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: 'admin' | 'member') => void;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-yellow-500/20 text-yellow-400',
  admin: 'bg-blue-500/20 text-blue-400',
  member: 'bg-gray-500/20 text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export function MemberCard({
  member,
  isAdmin,
  currentUserId,
  onAccept,
  onReject,
  onRemove,
  onChangeRole,
}: MemberCardProps) {
  const isCurrentUser = member.user_id === currentUserId;
  const isPending = member.status === 'pending';
  const isOwner = member.role === 'owner';
  const roleLabel = GARAGE_ROLE_LABELS[member.role as GarageRole] ?? member.role;
  const statusLabel = MEMBER_STATUS_LABELS[member.status as MemberStatus] ?? member.status;

  return (
    <View className="bg-surface-light border border-border rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-text-primary font-semibold" numberOfLines={1}>
            {member.user_email ?? 'Utilisateur'}
            {isCurrentUser ? ' (vous)' : ''}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <View
            className={`px-2 py-1 rounded-full ${ROLE_COLORS[member.role] ?? ROLE_COLORS.member}`}
          >
            <Text
              className={`text-xs font-medium ${ROLE_COLORS[member.role]?.split(' ')[1] ?? 'text-gray-400'}`}
            >
              {roleLabel}
            </Text>
          </View>
          {isPending && (
            <View className={`px-2 py-1 rounded-full ${STATUS_COLORS[member.status]}`}>
              <Text
                className={`text-xs font-medium ${STATUS_COLORS[member.status]?.split(' ')[1]}`}
              >
                {statusLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isAdmin && !isCurrentUser && !isOwner && (
        <View className="flex-row gap-2 mt-2">
          {isPending && onAccept && (
            <Pressable
              onPress={() => onAccept(member.id)}
              className="flex-1 bg-green-500/20 rounded-lg py-2 items-center flex-row justify-center gap-1"
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#22C55E" />
              <Text className="text-green-400 text-sm font-medium">Accepter</Text>
            </Pressable>
          )}
          {isPending && onReject && (
            <Pressable
              onPress={() => onReject(member.id)}
              className="flex-1 bg-red-500/20 rounded-lg py-2 items-center flex-row justify-center gap-1"
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text className="text-red-400 text-sm font-medium">Refuser</Text>
            </Pressable>
          )}
          {!isPending && onChangeRole && member.role !== 'owner' && (
            <Pressable
              onPress={() => onChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
              className="flex-1 bg-blue-500/20 rounded-lg py-2 items-center"
            >
              <Text className="text-blue-400 text-sm font-medium">
                {member.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
              </Text>
            </Pressable>
          )}
          {!isPending && onRemove && (
            <Pressable
              onPress={() => onRemove(member.id)}
              className="bg-red-500/20 rounded-lg py-2 px-3 items-center"
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
