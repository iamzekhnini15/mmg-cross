import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { STATUS_LABELS, type VehicleStatus } from '@/lib/constants';
import { useVehicleStatusHistory } from '@/features/vehicles/hooks/useVehicles';

interface StatusHistoryProps {
  vehicleId: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StatusHistory({ vehicleId }: StatusHistoryProps) {
  const { data: history, isLoading } = useVehicleStatusHistory(vehicleId);

  if (isLoading) {
    return null;
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <Text className="text-text-primary text-lg font-semibold mb-4">Historique des statuts</Text>

      {history.map((entry, index) => {
        const isLast = index === history.length - 1;

        return (
          <View key={entry.id} className="flex-row mb-0">
            {/* Timeline line + dot */}
            <View className="items-center mr-3 w-5">
              <View className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-accent' : 'bg-border'}`} />
              {!isLast ? <View className="w-0.5 flex-1 bg-border mt-1" /> : null}
            </View>

            {/* Content */}
            <View className={`flex-1 ${!isLast ? 'pb-4' : ''}`}>
              <View className="flex-row items-center flex-wrap gap-1">
                {entry.from_status ? (
                  <>
                    <Text className="text-text-muted text-sm">
                      {STATUS_LABELS[entry.from_status as VehicleStatus] ?? entry.from_status}
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color="#6B7280" />
                  </>
                ) : null}
                <Text className="text-text-primary text-sm font-semibold">
                  {STATUS_LABELS[entry.to_status as VehicleStatus] ?? entry.to_status}
                </Text>
              </View>
              <Text className="text-text-muted text-xs mt-0.5">{formatDate(entry.changed_at)}</Text>
              {entry.changed_by_email ? (
                <Text className="text-text-muted text-xs mt-0.5">par {entry.changed_by_email}</Text>
              ) : null}
              {entry.notes ? (
                <Text className="text-text-secondary text-xs mt-1">{entry.notes}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}
