import type { ExpenseSummaryRow } from '@/features/accounting/types';
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';

interface ExpensesSectionProps {
  rows: ExpenseSummaryRow[];
}

export function ExpensesSection({ rows }: ExpensesSectionProps) {
  const totalDeductible = rows.reduce((s, r) => s + r.deductibleVat, 0);

  return (
    <View className="bg-surface rounded-xl px-4 pt-3 pb-2 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-text-primary text-base font-semibold">Frais ({rows.length})</Text>
        {rows.length > 0 && (
          <Text className="text-text-secondary text-xs">
            TVA déd.: {formatPrice(totalDeductible)}
          </Text>
        )}
      </View>

      {rows.length === 0 ? (
        <Text className="text-text-secondary text-sm pb-3">Aucun frais ce trimestre.</Text>
      ) : (
        rows.map((row) => (
          <View key={row.id} className="border-b border-border pb-3 mb-3">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-2">
                <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
                  {row.vehicleLabel}
                </Text>
                <Text className="text-text-muted text-xs mt-0.5">
                  {EXPENSE_CATEGORY_LABELS[row.category as ExpenseCategory] ?? row.category}
                  {row.provider ? ` · ${row.provider}` : ''}
                </Text>
                <Text className="text-text-muted text-xs">
                  {formatDate(row.expenseDate, 'short')}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-text-primary text-sm font-medium">
                  {formatPrice(row.amountTTC)}
                </Text>
                <Text className="text-text-muted text-xs">
                  HT: {formatPrice(row.amountHT)} · TVA {row.vatRate}%
                </Text>
                <Text className="text-green-400 text-xs font-medium">
                  Déd.: {formatPrice(row.deductibleVat)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
