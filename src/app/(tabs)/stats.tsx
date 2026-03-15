import { LoadingSpinner } from '@/components/ui';
import { ExpenseAnalysisSection } from '@/features/stats/components/ExpenseAnalysisSection';
import { FinancialSection } from '@/features/stats/components/FinancialSection';
import { KPISummaryGrid } from '@/features/stats/components/KPISummaryGrid';
import { PerformanceSection } from '@/features/stats/components/PerformanceSection';
import { PeriodSelector } from '@/features/stats/components/PeriodSelector';
import { SalesAnalysisSection } from '@/features/stats/components/SalesAnalysisSection';
import { StockSection } from '@/features/stats/components/StockSection';
import { VehicleAnalysisSection } from '@/features/stats/components/VehicleAnalysisSection';
import { useExpenseKPIs } from '@/features/stats/hooks/useExpenseKPIs';
import { useFinancialKPIs } from '@/features/stats/hooks/useFinancialKPIs';
import { usePeriodFilter } from '@/features/stats/hooks/usePeriodFilter';
import { useSalesKPIs } from '@/features/stats/hooks/useSalesKPIs';
import { useStatsData } from '@/features/stats/hooks/useStatsData';
import { useStockKPIs } from '@/features/stats/hooks/useStockKPIs';
import { useVehicleKPIs } from '@/features/stats/hooks/useVehicleKPIs';
import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

export default function StatsScreen() {
  const { periodFilter, setPeriodType } = usePeriodFilter();
  const { data, isLoading, isRefetching, error, refetch } = useStatsData(periodFilter);

  const financial = useFinancialKPIs(data);
  const stock = useStockKPIs(data);
  const sales = useSalesKPIs(data);
  const expenses = useExpenseKPIs(data);
  const vehicle = useVehicleKPIs(data);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-text-primary text-lg font-semibold mt-4 mb-2">
          Erreur de chargement
        </Text>
        <Text className="text-text-muted text-center">Impossible de charger les statistiques.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-4 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        <PeriodSelector activeType={periodFilter.type} onChange={setPeriodType} />

        <KPISummaryGrid financial={financial} stock={stock} sales={sales} vehicle={vehicle} />

        {financial && <FinancialSection data={financial} />}

        {stock && <StockSection data={stock} />}

        {sales && <SalesAnalysisSection data={sales} />}

        {expenses && <ExpenseAnalysisSection data={expenses} />}

        {vehicle && <VehicleAnalysisSection data={vehicle} />}

        {vehicle && <PerformanceSection data={vehicle} />}
      </ScrollView>
    </View>
  );
}
