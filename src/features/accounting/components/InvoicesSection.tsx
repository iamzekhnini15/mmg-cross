import { formatDate, formatPrice } from '@/lib/formatters';
import { generateInvoiceHtml } from '@/lib/pdf/invoiceTemplate';
import { useGarageStore } from '@/stores/garageStore';
import type { Sale, Vehicle } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import type { SaleFormData } from '@/features/sales/schemas/saleForm';
import { Platform, Alert, Pressable, Text, View } from 'react-native';

interface InvoicesSectionProps {
  sales: Sale[];
  vehicleMap: Map<string, Vehicle>;
}

function vehicleLabel(v: Vehicle): string {
  return [v.brand, v.model, v.version, v.year].filter(Boolean).join(' ');
}

export function InvoicesSection({ sales, vehicleMap }: InvoicesSectionProps) {
  const handleView = async (sale: Sale) => {
    const vehicle = vehicleMap.get(sale.vehicle_id);
    if (!vehicle) return;

    const html = generateInvoiceHtml({
      invoiceNumber: sale.invoice_number,
      vehicle,
      sale: sale as unknown as SaleFormData,
      costPrice: 0,
      garage: useGarageStore.getState().currentGarage,
    });

    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
      } else {
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'afficher la facture.");
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
          return (
            <View key={sale.id} className="border-b border-border pb-3 mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                  <Text className="text-text-primary text-sm font-medium">
                    {sale.invoice_number}
                  </Text>
                  <Text className="text-text-muted text-xs mt-0.5">
                    {formatDate(sale.sale_date, 'short')}
                    {' · '}
                    {vehicle ? vehicleLabel(vehicle) : '—'}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {sale.company_name ? `${sale.company_name} · ` : ''}
                    {clientName}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-text-primary text-sm font-semibold">
                    {formatPrice(sale.sale_price)}
                  </Text>
                  <Pressable
                    onPress={() => handleView(sale)}
                    className="p-1.5"
                    accessibilityLabel={`Voir la facture ${sale.invoice_number}`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="eye-outline" size={18} color="#3B82F6" />
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
