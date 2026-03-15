import { Card } from '@/components/ui';
import { formatPrice } from '@/lib/formatters';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { SalesKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { DonutChart } from './DonutChart';
import { SectionHeader } from './SectionHeader';
import { StatRow } from './StatRow';

interface SalesAnalysisSectionProps {
  data: SalesKPIs;
}

export function SalesAnalysisSection({ data }: SalesAnalysisSectionProps) {
  const {
    salesByMonth,
    salesCount,
    averageSalePrice,
    bestMonth,
    paymentMethodDistribution,
    clientTypeDistribution,
  } = data;

  const lineData = salesByMonth.map((d) => ({
    value: d.value,
    label: d.label,
    labelTextStyle: { color: '#6B7280', fontSize: 9 },
  }));

  return (
    <View>
      <SectionHeader icon="stats-chart-outline" title="Analyse des ventes" color="#3B82F6" />

      <Card className="mb-3">
        <StatRow label="Nombre de ventes" value={String(salesCount)} />
        <StatRow label="Prix de vente moyen" value={formatPrice(averageSalePrice)} />
        {bestMonth && (
          <StatRow
            label="Meilleur mois"
            value={`${bestMonth.label} (${bestMonth.count})`}
            valueColor="#22C55E"
          />
        )}
      </Card>

      {lineData.length > 1 ? (
        <ChartCard title="Tendance des ventes" subtitle="Nombre de ventes par mois">
          <View style={{ marginLeft: -10 }}>
            <LineChart
              data={lineData}
              height={160}
              color="#3B82F6"
              thickness={2}
              curved
              areaChart
              startFillColor="#3B82F620"
              endFillColor="#3B82F600"
              dataPointsColor="#3B82F6"
              dataPointsRadius={4}
              noOfSections={4}
              yAxisTextStyle={{ color: '#6B7280', fontSize: 9 }}
              xAxisColor="#2D2D2F"
              yAxisColor="#2D2D2F"
              rulesColor="#2D2D2F"
              rulesType="dashed"
              backgroundColor="#1A1A1B"
              isAnimated
              animationDuration={400}
            />
          </View>
        </ChartCard>
      ) : null}

      {paymentMethodDistribution.length > 0 && (
        <ChartCard title="Methodes de paiement">
          <DonutChart
            data={paymentMethodDistribution}
            centerLabel={String(salesCount)}
            centerSubLabel="ventes"
            size={140}
          />
        </ChartCard>
      )}

      {clientTypeDistribution.length > 0 && (
        <ChartCard title="Type de client">
          <DonutChart
            data={clientTypeDistribution}
            centerLabel={String(salesCount)}
            centerSubLabel="clients"
            size={140}
          />
        </ChartCard>
      )}
    </View>
  );
}
