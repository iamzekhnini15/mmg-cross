import type { SaleSummaryRow } from '@/features/accounting/types';
import { VAT_REGIME_LABELS } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';

interface SalesSectionProps {
  rows: SaleSummaryRow[];
}

export function SalesSection({ rows }: SalesSectionProps) {
  return (
    <View className="bg-surface rounded-xl px-4 pt-3 pb-2 mb-4">
      <Text className="text-text-primary text-base font-semibold mb-3">Ventes ({rows.length})</Text>

      {rows.length === 0 ? (
        <Text className="text-text-secondary text-sm pb-3">Aucune vente ce trimestre.</Text>
      ) : (
        rows.map((row) => (
          <View key={row.vehicleId} className="border-b border-border pb-3 mb-3">
            {/* Header row */}
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-2">
                <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
                  {row.vehicleLabel}
                </Text>
                <Text className="text-text-tertiary text-xs mt-0.5">
                  {row.invoiceNumber} · {formatDate(row.saleDate, 'short')}
                </Text>
                <Text className="text-text-tertiary text-xs">
                  {row.clientName}
                  {row.clientVatNumber ? ` · TVA: ${row.clientVatNumber}` : ''}
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

            {/* Amounts */}
            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-text-tertiary text-xs">Prix de vente</Text>
                <Text className="text-text-primary text-sm font-medium">
                  {formatPrice(row.salePrice)}
                </Text>
              </View>
              {row.vatRegime === 'margin' && (
                <View>
                  <Text className="text-text-tertiary text-xs">Marge</Text>
                  <Text
                    className={`text-sm font-medium ${
                      row.margin >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {formatPrice(row.margin)}
                  </Text>
                </View>
              )}
              <View>
                <Text className="text-text-tertiary text-xs">Base grille 03</Text>
                <Text className="text-text-primary text-sm font-medium">
                  {formatPrice(row.baseHT)}
                </Text>
              </View>
              <View>
                <Text className="text-text-tertiary text-xs">TVA grille 54</Text>
                <Text className="text-blue-400 text-sm font-medium">
                  {formatPrice(row.vatCollected)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
