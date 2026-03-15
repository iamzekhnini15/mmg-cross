import { useState } from 'react';
import { Switch } from 'react-native';

import { Card } from '@/components/ui';
import { SettingsRow } from './SettingsRow';

export function AppSettingsSection() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <Card>
      <SettingsRow
        icon="notifications-outline"
        iconColor="#F59E0B"
        label="Notifications"
        subtitle={notificationsEnabled ? 'Activees' : 'Desactivees'}
        showChevron={false}
        rightElement={
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#2D2D2F', true: '#3B82F680' }}
            thumbColor={notificationsEnabled ? '#3B82F6' : '#6B7280'}
          />
        }
      />
      <SettingsRow
        icon="cash-outline"
        iconColor="#22C55E"
        label="Devise"
        subtitle="EUR (€)"
        showChevron={false}
      />
      <SettingsRow
        icon="language-outline"
        iconColor="#3B82F6"
        label="Langue"
        subtitle="Francais"
        showChevron={false}
        last
      />
    </Card>
  );
}
