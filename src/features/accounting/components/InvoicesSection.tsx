import { formatDate, formatPrice } from '@/lib/formatters';
import type { Sale, Vehicle } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, Text, View } from 'react-native';

interface InvoicesSectionProps {
  sales: Sale[];
  vehicleMap: Map<string, Vehicle>;
}

function vehicleLabel(v: Vehicle): string {
  return [v.brand, v.model, v.version, v.year].filter(Boolean).join(' ');
}

export function InvoicesSection({ sales, vehicleMap }: InvoicesSectionProps) {
  const handleShare = async (sale: Sale) => {
    if (!sale.invoice_pdf_path) {
      Alert.alert('PDF indisponible', "Aucun fichier PDF n'est associé à cette facture.");
      return;
    }

    try {
      const info = Paths.info(sale.invoice_pdf_path);
      if (!info.exists) {
        Alert.alert('PDF introuvable', 'Le fichier PDF a été supprimé ou déplacé.');
        return;
      }
      await Sharing.shareAsync(sale.invoice_pdf_path, {
        mimeType: 'application/pdf',
        dialogTitle: `Facture ${sale.invoice_number}`,
      });
    } catch {
      Alert.alert('Erreur', 'Impossible de partager le fichier.');
    }
  };

  return (
    <View className="bg-surface rounded-xl px-4 pt-3 pb-2 mb-4">
      <Text className="text-text-primary text-base font-semibold mb-3">
        Factures de vente ({sales.length})
      </Text>

      {sales.length === 0 ? (
        <Text className="text-text-secondary text-sm pb-3">Aucune facture ce trimestre.</Text>
      ) : (
        sales.map((sale) => {
          const vehicle = vehicleMap.get(sale.vehicle_id);
          const clientName = [sale.client_firstname, sale.client_lastname]
            .filter(Boolean)
            .join(' ');
          const hasPdf = !!sale.invoice_pdf_path;

          return (
            <View key={sale.id} className="border-b border-border pb-3 mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                  <Text className="text-text-primary text-sm font-medium">
                    {sale.invoice_number}
                  </Text>
                  <Text className="text-text-tertiary text-xs mt-0.5">
                    {formatDate(sale.sale_date, 'short')}
                    {' · '}
                    {vehicle ? vehicleLabel(vehicle) : '—'}
                  </Text>
                  <Text className="text-text-tertiary text-xs">
                    {sale.company_name ? `${sale.company_name} · ` : ''}
                    {clientName}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-text-primary text-sm font-semibold">
                    {formatPrice(sale.sale_price)}
                  </Text>
                  <Pressable
                    onPress={() => handleShare(sale)}
                    disabled={!hasPdf}
                    className="p-1.5"
                    style={{ opacity: hasPdf ? 1 : 0.3 }}
                    accessibilityLabel={`Partager la facture ${sale.invoice_number}`}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="share-outline"
                      size={18}
                      color={hasPdf ? '#3B82F6' : '#6B7280'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
