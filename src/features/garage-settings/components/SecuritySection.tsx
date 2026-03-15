import { Card } from '@/components/ui';
import type { User } from '@supabase/supabase-js';
import { SettingsRow } from './SettingsRow';

interface SecuritySectionProps {
  user: User | null;
  onChangePassword: () => void;
}

function getAuthProvider(user: User | null): string {
  if (!user) return 'Inconnu';
  const provider = user.app_metadata?.provider;
  if (provider === 'google') return 'Google';
  if (provider === 'apple') return 'Apple';
  return 'Email';
}

export function SecuritySection({ user, onChangePassword }: SecuritySectionProps) {
  const provider = getAuthProvider(user);
  const isEmailAuth = provider === 'Email';

  return (
    <Card>
      <SettingsRow
        icon="lock-closed-outline"
        iconColor="#22C55E"
        label="Changer le mot de passe"
        subtitle={isEmailAuth ? undefined : `Indisponible avec ${provider}`}
        onPress={isEmailAuth ? onChangePassword : undefined}
        disabled={!isEmailAuth}
      />
      <SettingsRow
        icon="mail-outline"
        iconColor="#3B82F6"
        label="Email de connexion"
        subtitle={user?.email ?? 'Non defini'}
        showChevron={false}
      />
      <SettingsRow
        icon="shield-checkmark-outline"
        iconColor="#8B5CF6"
        label="Methode de connexion"
        subtitle={provider}
        showChevron={false}
        last
      />
    </Card>
  );
}
