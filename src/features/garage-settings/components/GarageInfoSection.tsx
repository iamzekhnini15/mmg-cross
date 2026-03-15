import { Pressable, Text, View } from 'react-native';

import type { Garage } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';

interface GarageInfoSectionProps {
  garage: Garage;
  isAdmin: boolean;
  onEdit: () => void;
}

export function GarageInfoSection({ garage, isAdmin, onEdit }: GarageInfoSectionProps) {
  return (
    <View className="bg-surface-light border border-border rounded-xl p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
          <Ionicons name="business" size={24} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-lg font-bold">{garage.name}</Text>
          {garage.address && <Text className="text-text-muted text-sm">{garage.address}</Text>}
        </View>
        {isAdmin && (
          <Pressable
            onPress={onEdit}
            className="w-9 h-9 rounded-lg bg-blue-500/15 items-center justify-center"
          >
            <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
          </Pressable>
        )}
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
  );
}
