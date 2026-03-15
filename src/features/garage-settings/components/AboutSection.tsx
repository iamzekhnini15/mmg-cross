import { Linking } from 'react-native';

import { Card } from '@/components/ui';
import Constants from 'expo-constants';
import { SettingsRow } from './SettingsRow';

interface AboutSectionProps {
  onOpenTerms: () => void;
  onOpenLegal: () => void;
  onOpenPrivacy: () => void;
}

export function AboutSection({ onOpenTerms, onOpenLegal, onOpenPrivacy }: AboutSectionProps) {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Card>
      <SettingsRow
        icon="information-circle-outline"
        iconColor="#3B82F6"
        label="Version de l'app"
        subtitle={`v${appVersion}`}
        showChevron={false}
      />
      <SettingsRow
        icon="chatbubble-ellipses-outline"
        iconColor="#22C55E"
        label="Contacter le support"
        subtitle="support@managemygarage.com"
        onPress={() => Linking.openURL('mailto:support@managemygarage.com')}
      />
      <SettingsRow
        icon="shield-checkmark-outline"
        iconColor="#8B5CF6"
        label="Politique de confidentialite"
        onPress={onOpenPrivacy}
      />
      <SettingsRow
        icon="document-text-outline"
        iconColor="#6B7280"
        label="Mentions legales"
        onPress={onOpenLegal}
      />
      <SettingsRow
        icon="reader-outline"
        iconColor="#6B7280"
        label="Conditions d'utilisation"
        onPress={onOpenTerms}
        last
      />
    </Card>
  );
}
