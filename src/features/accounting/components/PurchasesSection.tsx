import type { PurchaseSummaryRow } from '@/features/accounting/types';
import { VAT_REGIME_LABELS } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';

interface PurchasesSectionProps {
  rows: PurchaseSummaryRow[];
}

export function PurchasesSection({ rows }: PurchasesSectionProps) {
  return (
    <View className="bg-surface rounded-xl px-4 pt-3 pb-2 mb-4">
      <Text className="text-text-primary text-base font-semibold mb-3">
        Achats véhicules ({rows.length})
      </Text>

      {rows.length === 0 ? (
        <Text className="text-text-secondary text-sm pb-3">Aucun achat ce trimestre.</Text>
      ) : (
        rows.map((row) => (
          <View key={row.vehicleId} className="border-b border-border pb-3 mb-3">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-2">
                <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
                  {row.vehicleLabel}
                </Text>
                <Text className="text-text-tertiary text-xs mt-0.5">
                  {formatDate(row.purchaseDate, 'short')}
                  {row.sellerName ? ` · ${row.sellerName}` : ''}
                  {row.sellerVatNumber ? ` · TVA: ${row.sellerVatNumber}` : ''}
                </Text>
              </View>
              <View
                className={`px-2 py-0.5 rounded-full ${
                  row.vatRegime === 'normal' ? 'bg-purple-900/50' : 'bg-orange-900/50'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    row.vatRegime === 'normal' ? 'text-purple-300' : 'text-orange-300'
                  }`}
                >
                  {VAT_REGIME_LABELS[row.vatRegime]}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-text-tertiary text-xs">Prix d{"'"}achat</Text>
                <Text className="text-text-primary text-sm font-medium">
                  {formatPrice(row.purchasePrice)}
                </Text>
              </View>
              <View>
                <Text className="text-text-tertiary text-xs">TVA déductible (59)</Text>
                <Text
                  className={`text-sm font-medium ${
                    row.deductibleVat > 0 ? 'text-green-400' : 'text-text-secondary'
                  }`}
                >
                  {row.deductibleVat > 0 ? formatPrice(row.deductibleVat) : '—'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
