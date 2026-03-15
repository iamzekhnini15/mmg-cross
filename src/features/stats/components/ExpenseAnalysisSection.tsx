import { Card } from '@/components/ui';
import { formatPrice } from '@/lib/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { ExpenseKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { DonutChart } from './DonutChart';
import { SectionHeader } from './SectionHeader';
import { StatRow } from './StatRow';

interface ExpenseAnalysisSectionProps {
  data: ExpenseKPIs;
}

export function ExpenseAnalysisSection({ data }: ExpenseAnalysisSectionProps) {
  const { totalExpensesTTC, averagePrepCost, categoryBreakdown, pendingCount, pendingAmount } =
    data;

  return (
    <View>
      <SectionHeader icon="receipt-outline" title="Analyse des frais" color="#F97316" />

      <Card className="mb-3">
        <StatRow label="Total frais TTC" value={formatPrice(totalExpensesTTC)} />
        <StatRow label="Cout moyen de preparation" value={formatPrice(averagePrepCost)} />
      </Card>

      {pendingCount > 0 && (
        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text className="text-red-400 text-sm font-semibold">Factures impayees</Text>
          </View>
          <StatRow label="Nombre" value={String(pendingCount)} valueColor="#EF4444" />
          <StatRow label="Montant total" value={formatPrice(pendingAmount)} valueColor="#EF4444" />
        </Card>
      )}

      {categoryBreakdown.length > 0 && (
        <ChartCard title="Repartition par categorie">
          <DonutChart
            data={categoryBreakdown}
            centerLabel={formatPrice(totalExpensesTTC)}
            centerSubLabel="total"
            size={140}
          />
        </ChartCard>
      )}
    </View>
  );
}
