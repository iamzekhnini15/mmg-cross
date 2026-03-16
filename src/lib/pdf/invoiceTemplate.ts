import type { SaleFormData } from '@/features/sales/schemas/saleForm';
import {
  CIVILITY_LABELS,
  FUEL_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  TRANSMISSION_LABELS,
  WARRANTY_LABELS,
  VAT_REGIME_LABELS,
  type Civility,
  type FuelType,
  type PaymentMethod,
  type TransmissionType,
  type WarrantyOption,
  type VatRegime,
} from '@/lib/constants';
import type { Garage, Sale, Vehicle } from '@/types/database';

/**
 * Minimal sale fields needed to render the invoice.
 * Both the live `SaleFormData` (from the form) and the persisted `Sale`
 * (from the database) satisfy this shape.
 */
export type SaleInfo = Pick<
  SaleFormData,
  | 'client_civility'
  | 'client_firstname'
  | 'client_lastname'
  | 'client_address'
  | 'client_zip'
  | 'client_city'
  | 'client_country'
  | 'client_phone'
  | 'client_email'
  | 'client_type'
  | 'company_name'
  | 'siret'
  | 'vat_number'
  | 'sale_price'
  | 'payment_method'
  | 'sale_date'
  | 'mileage_at_sale'
  | 'warranty'
> &
  // Allow the same fields from a persisted Sale row (some may be null there)
  Partial<
    Pick<
      Sale,
      | 'client_civility'
      | 'company_name'
      | 'siret'
      | 'vat_number'
      | 'mileage_at_sale'
      | 'warranty'
    >
  >;

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
    month: 'long',
    year: 'numeric',
  });
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat('fr-BE').format(km) + ' km';
}

function row(label: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  return `
    <tr>
      <td class="spec-label">${label}</td>
      <td class="spec-value">${value}</td>
    </tr>`;
}

interface InvoiceData {
  invoiceNumber: string;
  vehicle: Vehicle;
  sale: SaleInfo;
  costPrice?: number;
  garage?: Garage | null;
}

export function generateInvoiceHtml({
  invoiceNumber,
  vehicle,
  sale,
  costPrice: _costPrice,
  garage,
}: InvoiceData): string {
  const sellerName = garage?.name ?? 'MMG';
  const sellerAddress = garage?.address ?? '';
  const sellerSiret = garage?.siret ?? '';
  const sellerPhone = garage?.phone ?? '';
  const sellerEmail = garage?.email ?? '';

  const civility = sale.client_civility
    ? CIVILITY_LABELS[sale.client_civility as Civility]
    : '';
  const clientFullName = [civility, sale.client_firstname, sale.client_lastname]
    .filter(Boolean)
    .join(' ');

  const clientAddress = [
    sale.client_address,
    [sale.client_zip, sale.client_city].filter(Boolean).join(' '),
    sale.client_country,
  ]
    .filter(Boolean)
    .join(', ');

  const warrantyLabel = WARRANTY_LABELS[sale.warranty as WarrantyOption] ?? sale.warranty ?? '—';
  const paymentLabel =
    PAYMENT_METHOD_LABELS[sale.payment_method as PaymentMethod] ?? sale.payment_method;
  const vatRegimeLabel =
    VAT_REGIME_LABELS[vehicle.vat_regime as VatRegime] ?? vehicle.vat_regime ?? '—';
  const isMarginScheme = vehicle.vat_regime === 'margin';

  const generatedDate = formatDate(new Date().toISOString());

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture de vente ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.5;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 36px 44px 44px;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 18px;
      margin-bottom: 24px;
      border-bottom: 3px solid #1e3a5f;
    }
    .brand-block .company-name {
      font-size: 22px;
      font-weight: 800;
      color: #1e3a5f;
      letter-spacing: -0.5px;
    }
    .brand-block .company-tagline {
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .brand-block .company-coords {
      font-size: 10px;
      color: #4b5563;
      margin-top: 6px;
      line-height: 1.6;
    }
    .invoice-block {
      text-align: right;
    }
    .invoice-block .doc-type {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-block .doc-number {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-top: 4px;
    }
    .invoice-block .doc-date {
      font-size: 11px;
      color: #6b7280;
      margin-top: 2px;
    }

    /* ── PARTIES ── */
    .parties {
      display: flex;
      gap: 20px;
      margin-bottom: 22px;
    }
    .party-box {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 12px 14px;
    }
    .party-box .box-title {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #9ca3af;
      font-weight: 700;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    .party-box .party-name {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 3px;
    }
    .party-box .party-company {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 3px;
    }
    .party-box .party-detail {
      font-size: 10px;
      color: #4b5563;
      line-height: 1.7;
    }

    /* ── SECTION TITLES ── */
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e3a5f;
      background: #eff6ff;
      padding: 5px 10px;
      border-left: 3px solid #1e3a5f;
      margin-bottom: 10px;
      margin-top: 20px;
    }

    /* ── VEHICLE SPECS TABLE ── */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .specs-table tr:nth-child(odd) td {
      background: #f9fafb;
    }
    .specs-table .spec-label {
      width: 38%;
      padding: 5px 10px;
      font-size: 10px;
      color: #6b7280;
      font-weight: 500;
      border: 1px solid #e5e7eb;
    }
    .specs-table .spec-value {
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 600;
      color: #111827;
      border: 1px solid #e5e7eb;
    }
    .vehicle-headline {
      font-size: 15px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 10px;
    }

    /* ── FINANCIAL TABLE ── */
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .financial-table thead th {
      background: #1e3a5f;
      color: #fff;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      text-align: left;
      border: 1px solid #1e3a5f;
    }
    .financial-table thead th.right { text-align: right; }
    .financial-table tbody td {
      padding: 8px 10px;
      border: 1px solid #e5e7eb;
      font-size: 11px;
      vertical-align: top;
    }
    .financial-table tbody td.right {
      text-align: right;
      font-weight: 700;
    }
    .financial-table tfoot td {
      padding: 7px 10px;
      border: 1px solid #1e3a5f;
      font-size: 12px;
      font-weight: 700;
    }
    .financial-table tfoot td.label { background: #1e3a5f; color: #fff; }
    .financial-table tfoot td.amount {
      text-align: right;
      background: #1e3a5f;
      color: #fff;
      font-size: 14px;
    }
    .vat-note {
      font-size: 9px;
      color: #6b7280;
      font-style: italic;
      margin-top: 4px;
    }

    /* ── INFO GRID ── */
    .info-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 6px;
    }
    .info-cell {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .info-cell .cell-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-cell .cell-value {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
    }

    /* ── CONDITIONS ── */
    .conditions-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px 14px;
      font-size: 9px;
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 6px;
    }
    .conditions-box p { margin-bottom: 4px; }

    /* ── SIGNATURES ── */
    .signatures {
      display: flex;
      gap: 30px;
      margin-top: 30px;
    }
    .sig-block {
      flex: 1;
      border-top: 1px solid #9ca3af;
      padding-top: 8px;
    }
    .sig-block .sig-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .sig-block .sig-name {
      font-size: 10px;
      color: #374151;
      margin-bottom: 40px;
    }
    .sig-block .sig-line {
      border-bottom: 1px dashed #9ca3af;
      margin-top: 4px;
    }
    .sig-block .sig-mention {
      font-size: 8.5px;
      color: #9ca3af;
      margin-top: 4px;
      font-style: italic;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 9px;
      color: #9ca3af;
      text-align: center;
    }

    @page { margin: 15mm 12mm; }
    @media print { body { font-size: 10px; } }
  </style>
</head>
<body>
<div class="page">

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    <div class="brand-block">
      <div class="company-name">${sellerName}</div>
      <div class="company-tagline">Commerce de véhicules d'occasion</div>
      <div class="company-coords">
        ${sellerAddress ? sellerAddress + '<br/>' : ''}
        ${sellerPhone ? 'Tél : ' + sellerPhone + '<br/>' : ''}
        ${sellerEmail ? 'E-mail : ' + sellerEmail + '<br/>' : ''}
        ${sellerSiret ? 'BCE / TVA : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="invoice-block">
      <div class="doc-type">Facture de vente</div>
      <div class="doc-number">N° ${invoiceNumber}</div>
      <div class="doc-date">Date : ${formatDate(sale.sale_date)}</div>
    </div>
  </div>

  <!-- ═══ PARTIES ═══ -->
  <div class="parties">
    <div class="party-box">
      <div class="box-title">Vendeur</div>
      <div class="party-name">${sellerName}</div>
      <div class="party-detail">
        ${sellerAddress ? sellerAddress + '<br/>' : ''}
        ${sellerPhone ? 'Tél : ' + sellerPhone + '<br/>' : ''}
        ${sellerEmail ? 'E-mail : ' + sellerEmail + '<br/>' : ''}
        ${sellerSiret ? 'BCE / TVA : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="party-box">
      <div class="box-title">Acheteur</div>
      <div class="party-name">${clientFullName}</div>
      ${sale.company_name ? `<div class="party-company">${sale.company_name}</div>` : ''}
      <div class="party-detail">
        ${clientAddress ? clientAddress + '<br/>' : ''}
        ${sale.client_phone ? 'Tél : ' + sale.client_phone + '<br/>' : ''}
        ${sale.client_email ? 'E-mail : ' + sale.client_email + '<br/>' : ''}
        ${sale.siret ? 'BCE : ' + sale.siret + '<br/>' : ''}
        ${sale.vat_number ? 'N° TVA : ' + sale.vat_number : ''}
      </div>
    </div>
  </div>

  <!-- ═══ VEHICLE ═══ -->
  <div class="section-title">Désignation du véhicule</div>
  <div class="vehicle-headline">
    ${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''} — ${vehicle.year}
  </div>
  <table class="specs-table">
    <tbody>
      ${row('Marque / Modèle', `${vehicle.brand} ${vehicle.model}`)}
      ${vehicle.version ? row('Version', vehicle.version) : ''}
      ${row('Année', vehicle.year)}
      ${vehicle.license_plate ? row('Immatriculation', vehicle.license_plate) : ''}
      ${vehicle.vin ? row('N° de châssis (VIN)', vehicle.vin) : ''}
      ${row('Carburant', FUEL_TYPE_LABELS[vehicle.fuel_type as FuelType] ?? vehicle.fuel_type)}
      ${row('Boîte de vitesses', TRANSMISSION_LABELS[vehicle.transmission as TransmissionType] ?? vehicle.transmission)}
      ${vehicle.color ? row('Couleur', vehicle.color) : ''}
      ${vehicle.doors ? row('Portes', vehicle.doors) : ''}
      ${sale.mileage_at_sale ? row('Kilométrage à la vente', formatMileage(sale.mileage_at_sale)) : ''}
      ${row('Régime TVA', vatRegimeLabel)}
    </tbody>
  </table>

  <!-- ═══ FINANCIAL ═══ -->
  <div class="section-title">Conditions financières</div>
  <table class="financial-table">
    <thead>
      <tr>
        <th>Désignation</th>
        <th class="right">Montant TTC</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          ${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''}<br/>
          <span style="font-size:10px; color:#6b7280;">
            ${vehicle.license_plate ? 'Immat. ' + vehicle.license_plate + ' — ' : ''}
            ${vehicle.year} — ${sale.mileage_at_sale ? formatMileage(sale.mileage_at_sale) : ''}
          </span>
        </td>
        <td class="right">${formatPrice(sale.sale_price)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td class="label">TOTAL TTC</td>
        <td class="amount">${formatPrice(sale.sale_price)}</td>
      </tr>
    </tfoot>
  </table>
  ${isMarginScheme
    ? '<p class="vat-note">Véhicule vendu sous le régime de la marge — TVA non récupérable (Art. 312 à 325 de la Directive 2006/112/CE).</p>'
    : ''}

  <!-- ═══ PAYMENT & WARRANTY ═══ -->
  <div class="section-title">Modalités de paiement &amp; Garantie</div>
  <div class="info-grid">
    <div class="info-cell">
      <div class="cell-label">Mode de règlement</div>
      <div class="cell-value">${paymentLabel}</div>
    </div>
    <div class="info-cell">
      <div class="cell-label">Date de paiement</div>
      <div class="cell-value">${formatDate(sale.sale_date)}</div>
    </div>
    <div class="info-cell">
      <div class="cell-label">Garantie</div>
      <div class="cell-value">${warrantyLabel}</div>
    </div>
  </div>

  <!-- ═══ CONDITIONS ═══ -->
  <div class="section-title">Conditions générales</div>
  <div class="conditions-box">
    <p><strong>Transfert de propriété :</strong> La propriété du véhicule est transférée à l'acheteur dès réception intégrale du prix de vente.</p>
    <p><strong>État du véhicule :</strong> Le véhicule est vendu en l'état, tel que vu et accepté par l'acheteur. Le vendeur déclare que le kilométrage indiqué est exact à sa connaissance.</p>
    <p><strong>Garantie :</strong> ${sale.warranty === 'none'
      ? "Le véhicule est vendu sans garantie contractuelle. L'acheteur reconnaît avoir été informé de cet état de fait."
      : `Le véhicule bénéficie d'une garantie contractuelle de ${warrantyLabel} à compter de la date de livraison.`}
    </p>
    <p><strong>Immatriculation :</strong> Les démarches d'immatriculation sont à la charge de l'acheteur, sauf accord contraire.</p>
    <p><strong>Litige :</strong> Tout litige relatif à la présente vente sera soumis au tribunal compétent du ressort du siège social du vendeur.</p>
  </div>

  <!-- ═══ SIGNATURES ═══ -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-label">Signature du vendeur</div>
      <div class="sig-name">${sellerName}</div>
      <div class="sig-line"></div>
      <div class="sig-mention">Lu et approuvé — Signature et cachet</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Signature de l'acheteur</div>
      <div class="sig-name">${clientFullName}</div>
      <div class="sig-line"></div>
      <div class="sig-mention">Lu et approuvé — Bon pour accord</div>
    </div>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div class="footer">
    Document généré le ${generatedDate} · ${invoiceNumber}
    ${sellerSiret ? ' · BCE / TVA : ' + sellerSiret : ''}
  </div>

</div>
</body>
</html>`;
}
