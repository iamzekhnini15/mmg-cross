import type { Expense, Sale, Vehicle } from '@/types/database';

// ─── Quarter helpers ─────────────────────────────────

export interface Quarter {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

export function getQuarterRange(
  year: number,
  quarter: 1 | 2 | 3 | 4,
): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3 + 1; // 1, 4, 7, 10
  const endMonth = startMonth + 2; // 3, 6, 9, 12
  const lastDay = new Date(year, endMonth, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    start: `${year}-${pad(startMonth)}-01`,
    end: `${year}-${pad(endMonth)}-${lastDay}`,
  };
}

export function currentQuarter(): Quarter {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  return {
    year: now.getFullYear(),
    quarter: Math.ceil(month / 3) as 1 | 2 | 3 | 4,
  };
}

export function quarterLabel(year: number, quarter: number): string {
  return `T${quarter} ${year}`;
}

// ─── Enriched data structures ────────────────────────

export interface VehicleWithSaleAndExpenses {
  vehicle: Vehicle;
  sale: Sale | null;
  expenses: Expense[];
  totalExpenses: number;
  vatRegime: 'margin' | 'normal';
}

// ─── TVA grid types ──────────────────────────────────

export interface TVALine {
  /** Base imposable HT */
  base: number;
  /** TVA collectée */
  vat: number;
}

export interface TVAGrids {
  /** Grille 03 – Base imposable des ventes */
  grille03: number;
  /** Grille 54 – TVA collectée */
  grille54: number;
  /** Grille 59 – TVA déductible */
  grille59: number;
  /** Grille 71 – Solde (54 − 59) */
  grille71: number;
}

// ─── Quarterly summary rows ──────────────────────────

export interface SaleSummaryRow {
  vehicleId: string;
  invoiceNumber: string;
  saleDate: string;
  vehicleLabel: string;
  salePrice: number;
  purchasePrice: number;
  vatRegime: 'margin' | 'normal';
  /** Only meaningful for margin regime */
  margin: number;
  /** Base HT used in grille 03 */
  baseHT: number;
  /** TVA collectée */
  vatCollected: number;
  clientName: string;
  clientVatNumber: string | null;
}

export interface PurchaseSummaryRow {
  vehicleId: string;
  purchaseDate: string;
  vehicleLabel: string;
  purchasePrice: number;
  vatRegime: 'margin' | 'normal';
  sellerName: string | null;
  sellerVatNumber: string | null;
  /** Deductible VAT on vehicle purchase (only for normal regime) */
  deductibleVat: number;
}

export interface ExpenseSummaryRow {
  id: string;
  expenseDate: string;
  vehicleLabel: string;
  provider: string | null;
  category: string;
  amountHT: number;
  vatRate: number;
  amountTTC: number;
  deductibleVat: number;
}
