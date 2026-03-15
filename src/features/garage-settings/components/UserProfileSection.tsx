import { Text, View } from 'react-native';

import { GARAGE_ROLE_LABELS, type GarageRole } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import type { GarageMember } from '@/types/database';
import type { User } from '@supabase/supabase-js';

interface UserProfileSectionProps {
  user: User | null;
  membership: GarageMember | null;
}

export function UserProfileSection({ user, membership }: UserProfileSectionProps) {
  if (!user) return null;

  const initial = (user.email ?? '?')[0].toUpperCase();
  const roleLabel = membership?.role
    ? (GARAGE_ROLE_LABELS[membership.role as GarageRole] ?? membership.role)
    : null;

  const roleColor =
    membership?.role === 'owner' ? '#F59E0B' : membership?.role === 'admin' ? '#3B82F6' : '#6B7280';

  return (
    <View className="bg-surface-light border border-border rounded-xl p-4 items-center">
      {/* Avatar */}
      <View className="w-16 h-16 rounded-full bg-accent items-center justify-center mb-3">
        <Text className="text-white text-2xl font-bold">{initial}</Text>
      </View>

      {/* Email */}
      <Text className="text-text-primary text-base font-semibold">{user.email}</Text>

      {/* Role badge */}
      {roleLabel && (
        <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${roleColor}20` }}>
          <Text className="text-xs font-semibold" style={{ color: roleColor }}>
            {roleLabel}
          </Text>
        </View>
      )}

      {/* Dates */}
      <View className="flex-row gap-4 mt-3">
        {user.created_at && (
          <View className="items-center">
            <Text className="text-text-muted text-xs">Inscrit le</Text>
            <Text className="text-text-secondary text-xs font-medium">
              {formatDate(user.created_at, 'short')}
            </Text>
          </View>
        )}
        {membership?.created_at && (
          <View className="items-center">
            <Text className="text-text-muted text-xs">Membre depuis</Text>
            <Text className="text-text-secondary text-xs font-medium">
              {formatDate(membership.created_at, 'short')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
