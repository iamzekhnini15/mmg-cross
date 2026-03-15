import { BELGIAN_VAT_RATE, VAT_REGIMES } from '@/lib/constants';
import type { Expense, Sale, Vehicle } from '@/types/database';
import { useMemo } from 'react';
import type { ExpenseSummaryRow, PurchaseSummaryRow, SaleSummaryRow, TVAGrids } from '../types';
import type { QuarterlyData } from './useQuarterlyData';

// ─── Core TVA calculation helpers ────────────────────

const RATE = BELGIAN_VAT_RATE; // 21%
const RATE_FACTOR = RATE / (100 + RATE); // 21/121

/** Extract VAT from a TTC price */
function vatFromTTC(ttc: number): number {
  return ttc * RATE_FACTOR;
}

/** Extract HT from a TTC price */
function htFromTTC(ttc: number): number {
  return ttc / (1 + RATE / 100);
}

function vehicleLabel(v: Vehicle): string {
  return [v.brand, v.model, v.version, v.year].filter(Boolean).join(' ');
}

function clientLabel(sale: Sale): string {
  const parts = [sale.client_firstname, sale.client_lastname].filter(Boolean);
  if (sale.company_name) parts.unshift(sale.company_name);
  return parts.join(' ');
}

// ─── Build summary rows ───────────────────────────────

export function buildSaleRows(
  soldVehicles: Vehicle[],
  saleMap: Map<string, Sale>,
): SaleSummaryRow[] {
  return soldVehicles
    .map((v): SaleSummaryRow | null => {
      const sale = saleMap.get(v.id);
      if (!sale) return null;

      const vatRegime = (v.vat_regime ?? VAT_REGIMES.MARGIN) as 'margin' | 'normal';
      const salePrice = Number(sale.sale_price);
      const purchasePrice = Number(v.purchase_price);

      let baseHT: number;
      let vatCollected: number;
      let margin: number;

      if (vatRegime === VAT_REGIMES.NORMAL) {
        baseHT = htFromTTC(salePrice);
        vatCollected = vatFromTTC(salePrice);
        margin = salePrice - purchasePrice;
      } else {
        // Margin regime: TVA calculated on profit margin
        margin = salePrice - purchasePrice;
        baseHT = htFromTTC(Math.max(0, margin));
        vatCollected = vatFromTTC(Math.max(0, margin));
      }

      return {
        vehicleId: v.id,
        invoiceNumber: sale.invoice_number,
        saleDate: sale.sale_date,
        vehicleLabel: vehicleLabel(v),
        salePrice,
        purchasePrice,
        vatRegime,
        margin,
        baseHT,
        vatCollected,
        clientName: clientLabel(sale),
        clientVatNumber: sale.vat_number,
      };
    })
    .filter((r): r is SaleSummaryRow => r !== null);
}

export function buildPurchaseRows(purchasedVehicles: Vehicle[]): PurchaseSummaryRow[] {
  return purchasedVehicles.map((v): PurchaseSummaryRow => {
    const vatRegime = (v.vat_regime ?? VAT_REGIMES.MARGIN) as 'margin' | 'normal';
    const purchasePrice = Number(v.purchase_price);

    // Only under normal regime is the purchase VAT deductible
    const deductibleVat = vatRegime === VAT_REGIMES.NORMAL ? vatFromTTC(purchasePrice) : 0;

    return {
      vehicleId: v.id,
      purchaseDate: v.purchase_date,
      vehicleLabel: vehicleLabel(v),
      purchasePrice,
      vatRegime,
      sellerName: v.seller_name,
      sellerVatNumber:
        (v as Vehicle & { seller_vat_number?: string | null }).seller_vat_number ?? null,
      deductibleVat,
    };
  });
}

export function buildExpenseRows(
  expenses: Expense[],
  vehicleMap: Map<string, Vehicle>,
): ExpenseSummaryRow[] {
  return expenses.map((e): ExpenseSummaryRow => {
    const vehicle = vehicleMap.get(e.vehicle_id);
    const amountHT = Number(e.amount_ht);
    const vatRate = Number(e.vat_rate);
    const amountTTC = Number(e.amount_ttc);
    const deductibleVat = amountHT * (vatRate / 100);

    return {
      id: e.id,
      expenseDate: e.expense_date,
      vehicleLabel: vehicle ? vehicleLabel(vehicle) : '—',
      provider: e.provider,
      category: e.category,
      amountHT,
      vatRate,
      amountTTC,
      deductibleVat,
    };
  });
}

// ─── TVA grid calculation ─────────────────────────────

export function calculateTVAGrids(
  saleRows: SaleSummaryRow[],
  purchaseRows: PurchaseSummaryRow[],
  expenseRows: ExpenseSummaryRow[],
): TVAGrids {
  // Grille 03 – base imposable (HT) des ventes du trimestre
  const grille03 = saleRows.reduce((sum, r) => sum + r.baseHT, 0);

  // Grille 54 – TVA collectée sur ventes
  const grille54 = saleRows.reduce((sum, r) => sum + r.vatCollected, 0);

  // Grille 59 – TVA déductible
  //   • Vehicle purchases (only normal regime)
  const vatOnPurchases = purchaseRows.reduce((sum, r) => sum + r.deductibleVat, 0);
  //   • Expenses (all vehicles)
  const vatOnExpenses = expenseRows.reduce((sum, r) => sum + r.deductibleVat, 0);
  const grille59 = vatOnPurchases + vatOnExpenses;

  // Grille 71 – Solde à payer (positive) or credit TVA (negative)
  const grille71 = grille54 - grille59;

  return { grille03, grille54, grille59, grille71 };
}

// ─── Main hook ────────────────────────────────────────

export interface TVACalculationsResult {
  saleRows: SaleSummaryRow[];
  purchaseRows: PurchaseSummaryRow[];
  expenseRows: ExpenseSummaryRow[];
  grids: TVAGrids;
}

export function useTVACalculations(data: QuarterlyData | null): TVACalculationsResult {
  return useMemo(() => {
    if (!data) {
      return {
        saleRows: [],
        purchaseRows: [],
        expenseRows: [],
        grids: { grille03: 0, grille54: 0, grille59: 0, grille71: 0 },
      };
    }

    const saleRows = buildSaleRows(data.soldVehicles, data.saleMap);
    const purchaseRows = buildPurchaseRows(data.purchasedVehicles);
    const expenseRows = buildExpenseRows(data.quarterExpenses, data.vehicleMap);
    const grids = calculateTVAGrids(saleRows, purchaseRows, expenseRows);

    return { saleRows, purchaseRows, expenseRows, grids };
  }, [data]);
}
