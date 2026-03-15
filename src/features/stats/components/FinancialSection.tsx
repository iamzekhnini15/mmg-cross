import { Card } from '@/components/ui';
import { formatCompactPrice, formatPercentage, formatPrice } from '@/lib/formatters';
import { Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { FinancialKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { SectionHeader } from './SectionHeader';
import { StatRow } from './StatRow';

interface FinancialSectionProps {
  data: FinancialKPIs;
}

export function FinancialSection({ data }: FinancialSectionProps) {
  const { monthlyRevenue, monthlyMargin } = data;

  // Build grouped bar data
  const barData = monthlyRevenue.flatMap((rev, i) => {
    const margin = monthlyMargin[i];
    return [
      {
        value: rev.value,
        label: rev.label,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: '#6B7280', fontSize: 9 },
        frontColor: '#3B82F6',
      },
      {
        value: Math.max(0, margin?.value ?? 0),
        frontColor: '#22C55E',
        spacing: 12,
      },
    ];
  });

  return (
    <View>
      <SectionHeader icon="wallet-outline" title="Rentabilite" color="#22C55E" />

      {monthlyRevenue.length > 0 ? (
        <ChartCard title="CA et marge par mois" subtitle="Bleu = CA, Vert = Marge">
          <View style={{ marginLeft: -10 }}>
            <BarChart
              data={barData}
              barWidth={14}
              barBorderRadius={3}
              noOfSections={4}
              yAxisTextStyle={{ color: '#6B7280', fontSize: 9 }}
              xAxisColor="#2D2D2F"
              yAxisColor="#2D2D2F"
              rulesColor="#2D2D2F"
              rulesType="dashed"
              backgroundColor="#1A1A1B"
              formatYLabel={(val) => formatCompactPrice(Number(val))}
              height={180}
              isAnimated
              animationDuration={400}
            />
          </View>
        </ChartCard>
      ) : null}

      <Card className="mt-3">
        <Text className="text-text-primary text-base font-semibold mb-2">Details marges</Text>
        <StatRow
          label="Marge moyenne"
          value={formatPrice(data.averageMargin)}
          valueColor="#22C55E"
        />
        <StatRow label="Meilleure marge" value={formatPrice(data.maxMargin)} valueColor="#22C55E" />
        <StatRow
          label="Pire marge"
          value={formatPrice(data.minMargin)}
          valueColor={data.minMargin < 0 ? '#EF4444' : '#22C55E'}
        />
        <StatRow label="Taux de marge moyen" value={formatPercentage(data.marginRate)} />
        <StatRow label="ROI moyen" value={formatPercentage(data.averageROI)} />
      </Card>
    </View>
  );
}
