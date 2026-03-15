import type {
  ExpenseSummaryRow,
  PurchaseSummaryRow,
  SaleSummaryRow,
  TVAGrids,
} from '@/features/accounting/types';
import { EXPENSE_CATEGORY_LABELS, VAT_REGIME_LABELS, type ExpenseCategory } from '@/lib/constants';
import type { Garage } from '@/types/database';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface AccountingReportData {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  grids: TVAGrids;
  saleRows: SaleSummaryRow[];
  purchaseRows: PurchaseSummaryRow[];
  expenseRows: ExpenseSummaryRow[];
  garage?: Garage | null;
}

export function generateAccountingReportHtml({
  year,
  quarter,
  grids,
  saleRows,
  purchaseRows,
  expenseRows,
  garage,
}: AccountingReportData): string {
  const companyName = garage?.name ?? 'Mon Garage';
  const companyAddress = garage?.address ?? '';
  const companySiret = garage?.siret ?? '';
  const generatedOn = new Date().toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const isCredit = grids.grille71 < 0;

  const salesRows = saleRows
    .map(
      (r) => `
    <tr>
      <td>${r.invoiceNumber}</td>
      <td>${formatDate(r.saleDate)}</td>
      <td>${r.vehicleLabel}</td>
      <td>${r.clientName}${r.clientVatNumber ? `<br/><small>TVA: ${r.clientVatNumber}</small>` : ''}</td>
      <td class="badge ${r.vatRegime === 'normal' ? 'badge-normal' : 'badge-margin'}">${VAT_REGIME_LABELS[r.vatRegime]}</td>
      <td class="num">${formatPrice(r.salePrice)}</td>
      <td class="num">${r.vatRegime === 'margin' ? formatPrice(r.margin) : '—'}</td>
      <td class="num">${formatPrice(r.baseHT)}</td>
      <td class="num">${formatPrice(r.vatCollected)}</td>
    </tr>`,
    )
    .join('');

  const purchasesRows = purchaseRows
    .map(
      (r) => `
    <tr>
      <td>${formatDate(r.purchaseDate)}</td>
      <td>${r.vehicleLabel}</td>
      <td>${r.sellerName ?? '—'}${r.sellerVatNumber ? `<br/><small>TVA: ${r.sellerVatNumber}</small>` : ''}</td>
      <td class="badge ${r.vatRegime === 'normal' ? 'badge-normal' : 'badge-margin'}">${VAT_REGIME_LABELS[r.vatRegime]}</td>
      <td class="num">${formatPrice(r.purchasePrice)}</td>
      <td class="num ${r.deductibleVat > 0 ? 'green' : ''}">${r.deductibleVat > 0 ? formatPrice(r.deductibleVat) : '—'}</td>
    </tr>`,
    )
    .join('');

  const expensesRows = expenseRows
    .map(
      (r) => `
    <tr>
      <td>${formatDate(r.expenseDate)}</td>
      <td>${r.vehicleLabel}</td>
      <td>${EXPENSE_CATEGORY_LABELS[r.category as ExpenseCategory] ?? r.category}</td>
      <td>${r.provider ?? '—'}</td>
      <td class="num">${formatPrice(r.amountHT)}</td>
      <td class="num">${r.vatRate}%</td>
      <td class="num">${formatPrice(r.amountTTC)}</td>
      <td class="num green">${formatPrice(r.deductibleVat)}</td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dossier TVA T${quarter} ${year}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      padding: 30px 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 16px;
    }
    .company-name { font-size: 20px; font-weight: 700; color: #3B82F6; }
    .company-info { font-size: 10px; color: #666; margin-top: 3px; }
    .report-title { font-size: 18px; font-weight: 700; text-align: right; }
    .report-meta { font-size: 11px; color: #666; text-align: right; margin-top: 2px; }

    h2 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #3B82F6;
      margin: 28px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* TVA Grid summary */
    .tva-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .tva-grid td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
    .tva-grid .code { font-weight: 700; color: #3B82F6; width: 60px; }
    .tva-grid .amount { text-align: right; font-weight: 600; white-space: nowrap; }
    .tva-grid .total-row td {
      background: #eff6ff;
      border-top: 2px solid #3B82F6;
      font-weight: 700;
      font-size: 13px;
    }
    .green { color: #16a34a; }
    .red   { color: #dc2626; }

    /* Tables */
    table.data {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 20px;
    }
    table.data thead th {
      background: #f8f9fa;
      padding: 7px 8px;
      text-align: left;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }
    table.data thead th.num { text-align: right; }
    table.data tbody td {
      padding: 7px 8px;
      border-bottom: 1px solid #f5f5f5;
      vertical-align: top;
    }
    table.data tbody td.num { text-align: right; font-weight: 600; white-space: nowrap; }
    table.data tbody td.green { color: #16a34a; }
    table.data tfoot td {
      padding: 8px;
      font-weight: 700;
      border-top: 2px solid #e5e7eb;
      background: #f8f9fa;
    }
    table.data tfoot td.num { text-align: right; }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 600;
    }
    .badge-normal { background: #f3e8ff; color: #7c3aed; }
    .badge-margin { background: #fff7ed; color: #c2410c; }

    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      font-size: 9px;
      color: #999;
      text-align: center;
    }
    @media print { body { padding: 15px 20px; } }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="company-name">${companyName}</div>
      <div class="company-info">
        ${companyAddress ? companyAddress + '<br/>' : ''}
        ${companySiret ? 'BCE / TVA : ' + companySiret : ''}
      </div>
    </div>
    <div>
      <div class="report-title">Dossier TVA — T${quarter} ${year}</div>
      <div class="report-meta">Généré le ${generatedOn}</div>
    </div>
  </div>

  <!-- TVA Grids -->
  <h2>Récapitulatif des grilles TVA</h2>
  <table class="tva-grid">
    <tr>
      <td class="code">03</td>
      <td>Base imposable des ventes (HT)</td>
      <td class="amount">${formatPrice(grids.grille03)}</td>
    </tr>
    <tr>
      <td class="code">54</td>
      <td>TVA collectée sur ventes</td>
      <td class="amount">${formatPrice(grids.grille54)}</td>
    </tr>
    <tr>
      <td class="code">59</td>
      <td>TVA déductible (achats + frais)</td>
      <td class="amount">${formatPrice(grids.grille59)}</td>
    </tr>
    <tr class="total-row">
      <td class="code">71</td>
      <td>${isCredit ? 'Crédit TVA' : 'Solde TVA à payer'}</td>
      <td class="amount ${isCredit ? 'green' : ''}">${formatPrice(Math.abs(grids.grille71))}</td>
    </tr>
  </table>

  <!-- Sales -->
  <h2>Ventes (${saleRows.length})</h2>
  <table class="data">
    <thead>
      <tr>
        <th>Facture</th>
        <th>Date</th>
        <th>Véhicule</th>
        <th>Client</th>
        <th>Régime</th>
        <th class="num">Prix vente</th>
        <th class="num">Marge</th>
        <th class="num">Base 03</th>
        <th class="num">TVA 54</th>
      </tr>
    </thead>
    <tbody>${salesRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="7">Total</td>
        <td class="num">${formatPrice(saleRows.reduce((s, r) => s + r.baseHT, 0))}</td>
        <td class="num">${formatPrice(saleRows.reduce((s, r) => s + r.vatCollected, 0))}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Purchases -->
  <h2>Achats véhicules (${purchaseRows.length})</h2>
  <table class="data">
    <thead>
      <tr>
        <th>Date</th>
        <th>Véhicule</th>
        <th>Vendeur</th>
        <th>Régime</th>
        <th class="num">Prix achat</th>
        <th class="num">TVA déd. (59)</th>
      </tr>
    </thead>
    <tbody>${purchasesRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">Total TVA déductible achats</td>
        <td class="num green">${formatPrice(purchaseRows.reduce((s, r) => s + r.deductibleVat, 0))}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Expenses -->
  <h2>Frais (${expenseRows.length})</h2>
  <table class="data">
    <thead>
      <tr>
        <th>Date</th>
        <th>Véhicule</th>
        <th>Catégorie</th>
        <th>Fournisseur</th>
        <th class="num">Montant HT</th>
        <th class="num">TVA</th>
        <th class="num">Montant TTC</th>
        <th class="num">TVA déd. (59)</th>
      </tr>
    </thead>
    <tbody>${expensesRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="7">Total TVA déductible frais</td>
        <td class="num green">${formatPrice(expenseRows.reduce((s, r) => s + r.deductibleVat, 0))}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    Dossier TVA T${quarter} ${year} — ${companyName}${companySiret ? ' · BCE/TVA : ' + companySiret : ''} — généré le ${generatedOn}
  </div>

</body>
</html>`;
}
