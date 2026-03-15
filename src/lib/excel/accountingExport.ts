import type {
  ExpenseSummaryRow,
  PurchaseSummaryRow,
  SaleSummaryRow,
  TVAGrids,
} from '@/features/accounting/types';
import { EXPENSE_CATEGORY_LABELS, VAT_REGIME_LABELS, type ExpenseCategory } from '@/lib/constants';
import type { Garage } from '@/types/database';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';

interface AccountingExcelData {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  grids: TVAGrids;
  saleRows: SaleSummaryRow[];
  purchaseRows: PurchaseSummaryRow[];
  expenseRows: ExpenseSummaryRow[];
  garage?: Garage | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function generateAndShareExcel({
  year,
  quarter,
  grids,
  saleRows,
  purchaseRows,
  expenseRows,
  garage,
}: AccountingExcelData): Promise<void> {
  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Récapitulatif TVA ───────────────────
  const tvaData = [
    ['Grille', 'Libellé', 'Montant (EUR)'],
    ['03', 'Base imposable des ventes', round2(grids.grille03)],
    ['54', 'TVA collectée', round2(grids.grille54)],
    ['59', 'TVA déductible', round2(grids.grille59)],
    ['71', grids.grille71 >= 0 ? 'Solde à payer' : 'Crédit TVA', round2(grids.grille71)],
  ];
  const wsTva = XLSX.utils.aoa_to_sheet(tvaData);
  wsTva['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsTva, 'Grilles TVA');

  // ─── Sheet 2: Ventes ──────────────────────────────
  const salesHeader = [
    'N° Facture',
    'Date',
    'Véhicule',
    'Client',
    'N° TVA client',
    'Régime',
    'Prix de vente',
    "Prix d'achat",
    'Marge',
    'Base HT (G03)',
    'TVA collectée (G54)',
  ];
  const salesData = saleRows.map((r) => [
    r.invoiceNumber,
    r.saleDate,
    r.vehicleLabel,
    r.clientName,
    r.clientVatNumber ?? '',
    VAT_REGIME_LABELS[r.vatRegime],
    round2(r.salePrice),
    round2(r.purchasePrice),
    round2(r.margin),
    round2(r.baseHT),
    round2(r.vatCollected),
  ]);
  const wsSales = XLSX.utils.aoa_to_sheet([salesHeader, ...salesData]);
  wsSales['!cols'] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, 'Ventes');

  // ─── Sheet 3: Achats véhicules ────────────────────
  const purchasesHeader = [
    'Date',
    'Véhicule',
    'Vendeur',
    'N° TVA vendeur',
    'Régime',
    "Prix d'achat",
    'TVA déductible (G59)',
  ];
  const purchasesData = purchaseRows.map((r) => [
    r.purchaseDate,
    r.vehicleLabel,
    r.sellerName ?? '',
    r.sellerVatNumber ?? '',
    VAT_REGIME_LABELS[r.vatRegime],
    round2(r.purchasePrice),
    round2(r.deductibleVat),
  ]);
  const wsPurchases = XLSX.utils.aoa_to_sheet([purchasesHeader, ...purchasesData]);
  wsPurchases['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPurchases, 'Achats');

  // ─── Sheet 4: Frais ───────────────────────────────
  const expensesHeader = [
    'Date',
    'Véhicule',
    'Catégorie',
    'Fournisseur',
    'Montant HT',
    'Taux TVA %',
    'Montant TTC',
    'TVA déductible (G59)',
  ];
  const expensesData = expenseRows.map((r) => [
    r.expenseDate,
    r.vehicleLabel,
    EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category,
    r.provider ?? '',
    round2(r.amountHT),
    r.vatRate,
    round2(r.amountTTC),
    round2(r.deductibleVat),
  ]);
  const wsExpenses = XLSX.utils.aoa_to_sheet([expensesHeader, ...expensesData]);
  wsExpenses['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Frais');

  // ─── Write and share ──────────────────────────────
  const garageName = garage?.name?.replace(/[^a-zA-Z0-9]/g, '_') ?? 'compta';
  const fileName = `${garageName}_T${quarter}_${year}.xlsx`;

  if (Platform.OS === 'web') {
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const { File, Paths } = await import('expo-file-system');
    const { shareAsync } = await import('expo-sharing');
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const file = new File(Paths.cache, fileName);
    const bytes = Uint8Array.from(atob(wbout), (c) => c.charCodeAt(0));
    file.write(bytes);
    await shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Export comptable T${quarter} ${year}`,
    });
  }
}
