import { useState } from 'react';
import { View } from 'react-native';

import { Card, ConfirmModal } from '@/components/ui';
import { useDeleteAccount } from '@/features/garage-settings/hooks/useDeleteAccount';
import { useLeaveGarage } from '@/features/garage-settings/hooks/useLeaveGarage';
import { useAuth } from '@/hooks/useAuth';
import type { GarageMember } from '@/types/database';
import { SettingsRow } from './SettingsRow';

interface DangerZoneSectionProps {
  membership: GarageMember | null;
}

export function DangerZoneSection({ membership }: DangerZoneSectionProps) {
  const { signOut } = useAuth();
  const leaveGarage = useLeaveGarage();
  const deleteAccount = useDeleteAccount();
  const [showLogout, setShowLogout] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isOwner = membership?.role === 'owner';

  return (
    <View>
      <Card>
        <SettingsRow
          icon="log-out-outline"
          iconColor="#F59E0B"
          label="Se deconnecter"
          onPress={() => setShowLogout(true)}
          destructive={false}
        />
        <SettingsRow
          icon="exit-outline"
          iconColor="#EF4444"
          label="Quitter le garage"
          subtitle={isOwner ? "Transferez la propriete d'abord" : undefined}
          onPress={isOwner ? undefined : () => setShowLeave(true)}
          disabled={isOwner}
          destructive={!isOwner}
        />
        <SettingsRow
          icon="trash-outline"
          iconColor="#EF4444"
          label="Supprimer mon compte"
          onPress={() => setShowDelete(true)}
          destructive
          last
        />
      </Card>

      <ConfirmModal
        visible={showLogout}
        title="Se deconnecter"
        message="Voulez-vous vraiment vous deconnecter ?"
        confirmLabel="Deconnecter"
        onConfirm={() => {
          signOut();
          setShowLogout(false);
        }}
        onCancel={() => setShowLogout(false)}
      />

      <ConfirmModal
        visible={showLeave}
        title="Quitter le garage"
        message="Voulez-vous vraiment quitter ce garage ? Vous devrez etre re-invite pour y acceder."
        confirmLabel="Quitter"
        onConfirm={() => {
          if (membership) leaveGarage.mutate(membership.id);
          setShowLeave(false);
        }}
        onCancel={() => setShowLeave(false)}
      />

      <ConfirmModal
        visible={showDelete}
        title="Supprimer mon compte"
        message="Cette action est irreversible. Toutes vos donnees seront supprimees et vous serez deconnecte."
        confirmLabel="Supprimer"
        onConfirm={() => {
          deleteAccount.mutate();
          setShowDelete(false);
        }}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
