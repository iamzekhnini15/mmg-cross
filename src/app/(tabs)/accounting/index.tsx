import { ExpensesSection } from '@/features/accounting/components/ExpensesSection';
import { InvoicesSection } from '@/features/accounting/components/InvoicesSection';
import { PurchasesSection } from '@/features/accounting/components/PurchasesSection';
import { QuarterSelector } from '@/features/accounting/components/QuarterSelector';
import { SalesSection } from '@/features/accounting/components/SalesSection';
import { TVASummary } from '@/features/accounting/components/TVASummary';
import { useQuarterlyData } from '@/features/accounting/hooks/useQuarterlyData';
import {
  useQuarterlyReport,
  useUpdateQuarterlyReport,
  useUpsertQuarterlyReport,
} from '@/features/accounting/hooks/useQuarterlyReport';
import { useTVACalculations } from '@/features/accounting/hooks/useTVACalculations';
import { currentQuarter, quarterLabel } from '@/features/accounting/types';
import { QUARTERLY_REPORT_STATUSES } from '@/lib/constants';
import { generateAndShareExcel } from '@/lib/excel/accountingExport';
import { generateAccountingReportHtml } from '@/lib/pdf/accountingReportTemplate';
import { useGarageStore } from '@/stores/garageStore';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

function prevQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4,
): { year: number; quarter: 1 | 2 | 3 | 4 } {
  if (quarter === 1) return { year: year - 1, quarter: 4 };
  return { year, quarter: (quarter - 1) as 1 | 2 | 3 | 4 };
}

function nextQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4,
): { year: number; quarter: 1 | 2 | 3 | 4 } {
  if (quarter === 4) return { year: year + 1, quarter: 1 };
  return { year, quarter: (quarter + 1) as 1 | 2 | 3 | 4 };
}

export default function AccountingScreen() {
  const cq = currentQuarter();
  const [year, setYear] = useState(cq.year);
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(cq.quarter);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const garage = useGarageStore((s) => s.currentGarage);
  const quarterlyDataQuery = useQuarterlyData(year, quarter);
  const reportQuery = useQuarterlyReport(year, quarter);
  const upsertReport = useUpsertQuarterlyReport();
  const updateReport = useUpdateQuarterlyReport();
  const { saleRows, purchaseRows, expenseRows, grids } = useTVACalculations(
    quarterlyDataQuery.data ?? null,
  );

  const isCurrentOrFuture = year > cq.year || (year === cq.year && quarter >= cq.quarter);

  const handlePrev = () => {
    const p = prevQuarter(year, quarter);
    setYear(p.year);
    setQuarter(p.quarter);
  };

  const handleNext = () => {
    if (isCurrentOrFuture) return;
    const n = nextQuarter(year, quarter);
    setYear(n.year);
    setQuarter(n.quarter);
  };

  const handleMarkSubmitted = async () => {
    try {
      const report = reportQuery.data;
      if (report) {
        await updateReport.mutateAsync({
          id: report.id,
          updates: {
            status: QUARTERLY_REPORT_STATUSES.SUBMITTED,
            submitted_at: new Date().toISOString(),
          },
        });
      } else {
        await upsertReport.mutateAsync({
          year,
          quarter,
          status: QUARTERLY_REPORT_STATUSES.SUBMITTED,
          submitted_at: new Date().toISOString(),
        });
      }
      Alert.alert(
        'Trimestre transmis',
        `Le dossier ${quarterLabel(year, quarter)} a été marqué comme transmis à votre comptable.`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de la mise à jour';
      Alert.alert('Erreur', msg);
    }
  };

  const handleMarkDraft = async () => {
    const report = reportQuery.data;
    if (!report) return;
    try {
      await updateReport.mutateAsync({
        id: report.id,
        updates: { status: QUARTERLY_REPORT_STATUSES.DRAFT, submitted_at: null },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur';
      Alert.alert('Erreur', msg);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const html = generateAccountingReportHtml({
        year,
        quarter,
        grids,
        saleRows,
        purchaseRows,
        expenseRows,
        garage,
      });
      await Print.printAsync({ html });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'export";
      Alert.alert('Erreur', msg);
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      await generateAndShareExcel({
        year,
        quarter,
        grids,
        saleRows,
        purchaseRows,
        expenseRows,
        garage,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'export Excel";
      Alert.alert('Erreur', msg);
    } finally {
      setExporting(null);
    }
  };

  const isLoading = quarterlyDataQuery.isLoading;
  const isRefreshing = quarterlyDataQuery.isRefetching;
  const report = reportQuery.data;
  const isSubmitted = report?.status === QUARTERLY_REPORT_STATUSES.SUBMITTED;
  const isPending = upsertReport.isPending || updateReport.isPending;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-4 pb-3 px-4 border-b border-border">
        <View className="flex-row gap-2">
          {/* Export PDF button */}
          <Pressable
            onPress={handleExportPDF}
            disabled={isLoading || !!exporting}
            className="flex-row items-center gap-1 bg-surface px-3 py-2 rounded-lg"
            accessibilityLabel="Exporter en PDF"
            accessibilityRole="button"
          >
            {exporting === 'pdf' ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
            )}
            <Text className="text-blue-400 text-sm font-medium">PDF</Text>
          </Pressable>

          {/* Export Excel button */}
          <Pressable
            onPress={handleExportExcel}
            disabled={isLoading || !!exporting}
            className="flex-row items-center gap-1 bg-surface px-3 py-2 rounded-lg"
            accessibilityLabel="Exporter en Excel"
            accessibilityRole="button"
          >
            {exporting === 'excel' ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Ionicons name="grid-outline" size={18} color="#10B981" />
            )}
            <Text className="text-emerald-400 text-sm font-medium">Excel</Text>
          </Pressable>

          {/* Submit / Reopen button */}
          {isSubmitted ? (
            <Pressable
              onPress={handleMarkDraft}
              disabled={isPending}
              className="flex-row items-center gap-1 bg-green-900/40 px-3 py-2 rounded-lg"
              accessibilityLabel="Rouvrir le trimestre"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
              <Text className="text-green-400 text-sm font-medium">Transmis</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleMarkSubmitted}
              disabled={isPending || isLoading}
              className="flex-row items-center gap-1 bg-surface px-3 py-2 rounded-lg"
              accessibilityLabel="Marquer comme transmis au comptable"
              accessibilityRole="button"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Ionicons name="send-outline" size={18} color="#6B7280" />
              )}
              <Text className="text-text-secondary text-sm font-medium">Transmettre</Text>
            </Pressable>
          )}
        </View>
        {isSubmitted && report?.submitted_at && (
          <Text className="text-green-400 text-xs mt-1">
            Transmis le{' '}
            {new Date(report.submitted_at).toLocaleDateString('fr-BE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-text-secondary mt-3">Chargement des données…</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-4 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={quarterlyDataQuery.refetch}
              tintColor="#3B82F6"
            />
          }
        >
          {/* Quarter selector */}
          <QuarterSelector
            year={year}
            quarter={quarter}
            onPrev={handlePrev}
            onNext={handleNext}
            disableNext={isCurrentOrFuture}
          />

          {/* TVA Grids */}
          <TVASummary grids={grids} />

          {/* Sales */}
          <SalesSection rows={saleRows} />

          {/* Purchases */}
          <PurchasesSection rows={purchaseRows} />

          {/* Expenses */}
          <ExpensesSection rows={expenseRows} />

          {/* Invoices */}
          <InvoicesSection
            sales={quarterlyDataQuery.data?.quarterSales ?? []}
            vehicleMap={quarterlyDataQuery.data?.vehicleMap ?? new Map()}
          />
        </ScrollView>
      )}
    </View>
  );
}
