import { useRef } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { LoadingSpinner } from '@/components/ui';
import { AboutSection } from '@/features/garage-settings/components/AboutSection';
import { AppSettingsSection } from '@/features/garage-settings/components/AppSettingsSection';
import { ChangePasswordSheet } from '@/features/garage-settings/components/ChangePasswordSheet';
import { DangerZoneSection } from '@/features/garage-settings/components/DangerZoneSection';
import { EditGarageSheet } from '@/features/garage-settings/components/EditGarageSheet';
import { GarageInfoSection } from '@/features/garage-settings/components/GarageInfoSection';
import { LegalDocumentSheet } from '@/features/garage-settings/components/LegalDocumentSheet';
import { SecuritySection } from '@/features/garage-settings/components/SecuritySection';
import { SettingsSectionHeader } from '@/features/garage-settings/components/SettingsSectionHeader';
import { TeamSection } from '@/features/garage-settings/components/TeamSection';
import { UserProfileSection } from '@/features/garage-settings/components/UserProfileSection';
import { LEGAL_NOTICE } from '@/features/garage-settings/legal/legalNotice';
import { PRIVACY_POLICY } from '@/features/garage-settings/legal/privacyPolicy';
import { TERMS_OF_SERVICE } from '@/features/garage-settings/legal/termsOfService';
import { useGarageMembers } from '@/features/garages/hooks/useGarageMembers';
import { useCurrentGarageDetails } from '@/features/garages/hooks/useGarages';
import { useAuth } from '@/hooks/useAuth';
import { useGarageStore } from '@/stores/garageStore';
import BottomSheet from '@gorhom/bottom-sheet';

export default function GarageScreen() {
  const { user } = useAuth();
  const currentMembership = useGarageStore((state) => state.currentMembership);
  const {
    data: garage,
    isLoading: garageLoading,
    refetch: refetchGarage,
  } = useCurrentGarageDetails();
  const { isLoading: membersLoading, refetch: refetchMembers } = useGarageMembers();

  const isAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';

  const editGarageRef = useRef<BottomSheet>(null);
  const changePasswordRef = useRef<BottomSheet>(null);
  const termsRef = useRef<BottomSheet>(null);
  const legalRef = useRef<BottomSheet>(null);
  const privacyRef = useRef<BottomSheet>(null);

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

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
      >
        {/* User Profile */}
        <UserProfileSection user={user} membership={currentMembership} />

        {/* Garage Info */}
        <SettingsSectionHeader title="Garage" />
        <GarageInfoSection
          garage={garage}
          isAdmin={isAdmin}
          onEdit={() => editGarageRef.current?.expand()}
        />

        {/* Team */}
        <SettingsSectionHeader title="Equipe" />
        <TeamSection
          garage={garage}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onRefresh={handleRefresh}
        />

        {/* Security */}
        <SettingsSectionHeader title="Securite" />
        <SecuritySection user={user} onChangePassword={() => changePasswordRef.current?.expand()} />

        {/* Preferences */}
        <SettingsSectionHeader title="Preferences" />
        <AppSettingsSection />

        {/* About */}
        <SettingsSectionHeader title="Informations" />
        <AboutSection
          onOpenTerms={() => termsRef.current?.expand()}
          onOpenLegal={() => legalRef.current?.expand()}
          onOpenPrivacy={() => privacyRef.current?.expand()}
        />

        {/* Danger Zone */}
        <SettingsSectionHeader title="Zone dangereuse" />
        <DangerZoneSection membership={currentMembership} />
      </ScrollView>

      {/* Bottom Sheets */}
      <EditGarageSheet ref={editGarageRef} garage={garage} onSuccess={() => refetchGarage()} />
      <ChangePasswordSheet ref={changePasswordRef} />
      <LegalDocumentSheet
        ref={termsRef}
        title="Conditions d'utilisation"
        content={TERMS_OF_SERVICE}
      />
      <LegalDocumentSheet ref={legalRef} title="Mentions legales" content={LEGAL_NOTICE} />
      <LegalDocumentSheet
        ref={privacyRef}
        title="Politique de confidentialite"
        content={PRIVACY_POLICY}
      />
    </View>
  );
}
