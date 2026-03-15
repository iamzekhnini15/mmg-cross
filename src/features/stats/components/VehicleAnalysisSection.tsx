import { BarChart } from 'react-native-gifted-charts';
import { View } from 'react-native';
import type { VehicleKPIs } from '../types';
import { ChartCard } from './ChartCard';
import { DonutChart } from './DonutChart';
import { SectionHeader } from './SectionHeader';

interface VehicleAnalysisSectionProps {
  data: VehicleKPIs;
}

export function VehicleAnalysisSection({ data }: VehicleAnalysisSectionProps) {
  const { topBrandsByMargin, fuelDistribution } = data;

  const brandBarData = topBrandsByMargin.map((b) => ({
    value: Math.max(0, b.avgMargin),
    label: b.brand,
    labelTextStyle: { color: '#6B7280', fontSize: 9 },
    frontColor: '#3B82F6',
    topLabelComponent: () => null,
  }));

  return (
    <View>
      <SectionHeader icon="car-sport-outline" title="Analyse vehicules" color="#8B5CF6" />

      {brandBarData.length > 0 && (
        <ChartCard title="Marge moyenne par marque" subtitle="Top 5">
          <View style={{ marginLeft: -10 }}>
            <BarChart
              data={brandBarData}
              barWidth={28}
              barBorderRadius={4}
              noOfSections={4}
              yAxisTextStyle={{ color: '#6B7280', fontSize: 9 }}
              xAxisColor="#2D2D2F"
              yAxisColor="#2D2D2F"
              rulesColor="#2D2D2F"
              rulesType="dashed"
              backgroundColor="#1A1A1B"
              height={160}
              isAnimated
              animationDuration={400}
              formatYLabel={(val) => {
                const n = Number(val);
                return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
              }}
            />
          </View>
        </ChartCard>
      )}

      {fuelDistribution.length > 0 && (
        <ChartCard title="Type de carburant">
          <DonutChart data={fuelDistribution} size={140} />
        </ChartCard>
      )}
    </View>
  );
}
