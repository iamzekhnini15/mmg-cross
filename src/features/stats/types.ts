// ─── Period Filtering ────────────────────────────────

export type PeriodType = 'month' | 'quarter' | 'year' | 'all';

export interface PeriodFilter {
  type: PeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

// ─── Chart Data ─────────────────────────────────────

export interface MonthlyDataPoint {
  month: string; // "2026-01"
  label: string; // "Jan"
  value: number;
}

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

// ─── Financial KPIs ─────────────────────────────────

export interface FinancialKPIs {
  totalRevenue: number;
  totalMargin: number;
  averageMargin: number;
  minMargin: number;
  maxMargin: number;
  marginRate: number; // avg margin / avg sale price * 100
  averageROI: number; // avg margin / avg cost price * 100
  monthlyRevenue: MonthlyDataPoint[];
  monthlyMargin: MonthlyDataPoint[];
}

// ─── Stock KPIs ─────────────────────────────────────

export interface PipelineItem {
  status: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

export interface StockKPIs {
  stockCount: number;
  stockValueAtCost: number;
  averageStockAgeDays: number;
  vehiclesOver60Days: number;
  vehiclesOver90Days: number;
  pipelineDistribution: PipelineItem[];
}

// ─── Sales KPIs ─────────────────────────────────────

export interface SalesKPIs {
  salesCount: number;
  averageSalePrice: number;
  salesByMonth: MonthlyDataPoint[];
  bestMonth: { label: string; count: number } | null;
  paymentMethodDistribution: DonutSegment[];
  clientTypeDistribution: DonutSegment[];
}

// ─── Expense KPIs ───────────────────────────────────

export interface ExpenseKPIs {
  totalExpensesTTC: number;
  averagePrepCost: number;
  categoryBreakdown: DonutSegment[];
  pendingCount: number;
  pendingAmount: number;
}

// ─── Vehicle KPIs ───────────────────────────────────

export interface VehiclePerformance {
  id: string;
  label: string;
  margin: number;
  marginRate: number;
  rotationDays: number;
}

export interface VehicleKPIs {
  topBrandsByMargin: { brand: string; avgMargin: number }[];
  fuelDistribution: DonutSegment[];
  averageRotationDays: number;
  rotationTrend: MonthlyDataPoint[];
  bestPerformers: VehiclePerformance[];
  worstPerformers: VehiclePerformance[];
}

// ─── Stats Data (from useStatsData) ─────────────────

export interface StatsData {
  allVehicles: import('@/types/database').Vehicle[];
  soldVehicles: import('@/types/database').Vehicle[];
  unsoldVehicles: import('@/types/database').Vehicle[];
  purchasedVehicles: import('@/types/database').Vehicle[];
  filteredSales: import('@/types/database').Sale[];
  filteredExpenses: import('@/types/database').Expense[];
  saleMap: Map<string, import('@/types/database').Sale>;
  expenseTotalMap: Map<string, number>;
}
