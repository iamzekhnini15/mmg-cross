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

  const warrantyClause =
    sale.warranty === 'none'
      ? "Le véhicule est vendu sans garantie contractuelle. L'acheteur reconnaît avoir été informé de cet état de fait."
      : `Le véhicule bénéficie d'une garantie contractuelle de ${warrantyLabel} à compter de la date de livraison.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture de vente ${invoiceNumber}</title>
  <style>
    /* ─── Reset ─── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* ─── Base ─── */
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ─── A4 page wrapper (794 px = 210 mm @ 96 dpi) ─── */
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      padding: 32px 48px 48px;
      background: #fff;
    }

    /* ─── Accent colours ─── */
    :root {
      --navy: #1e3a5f;
      --navy-light: #eff6ff;
      --border: #d1d5db;
      --muted: #6b7280;
      --soft: #f9fafb;
    }

    /* ─── HEADER ─── */
    .header {
      display: table;
      width: 100%;
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 3px solid #1e3a5f;
    }
    .header-left  { display: table-cell; vertical-align: top; width: 55%; }
    .header-right { display: table-cell; vertical-align: top; text-align: right; }

    .company-name {
      font-size: 22pt;
      font-weight: 900;
      color: #1e3a5f;
      letter-spacing: -0.5px;
      line-height: 1;
    }
    .company-tagline {
      font-size: 8.5pt;
      color: #6b7280;
      margin-top: 3px;
      font-style: italic;
    }
    .company-coords {
      font-size: 9pt;
      color: #4b5563;
      margin-top: 8px;
      line-height: 1.6;
    }
    .doc-type {
      font-size: 17pt;
      font-weight: 800;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .doc-badge {
      display: inline-block;
      margin-top: 6px;
      background: #1e3a5f;
      color: #fff;
      font-size: 10pt;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
    }
    .doc-date {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 5px;
    }

    /* ─── PARTIES ─── */
    .parties { display: table; width: 100%; margin-bottom: 18px; border-spacing: 12px 0; }
    .party-box {
      display: table-cell;
      width: 50%;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 11px 13px;
      vertical-align: top;
    }
    .party-box + .party-box { margin-left: 12px; }
    .box-title {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #9ca3af;
      font-weight: 700;
      margin-bottom: 5px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    .party-name {
      font-size: 12pt;
      font-weight: 800;
      color: #111827;
      margin-bottom: 3px;
    }
    .party-company {
      font-size: 10pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 3px;
    }
    .party-detail {
      font-size: 9pt;
      color: #4b5563;
      line-height: 1.65;
      margin-top: 2px;
    }

    /* ─── SECTION TITLE ─── */
    .section-title {
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e3a5f;
      background: #eff6ff;
      padding: 5px 10px;
      border-left: 4px solid #1e3a5f;
      margin-top: 18px;
      margin-bottom: 9px;
    }

    /* ─── VEHICLE HEADLINE ─── */
    .vehicle-headline {
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e3a5f;
      margin-bottom: 9px;
    }

    /* ─── SPECS TABLE ─── */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
    }
    .specs-table tr:nth-child(odd) td { background: #f9fafb; }
    .specs-table td {
      border: 1px solid #e5e7eb;
      padding: 5px 9px;
      vertical-align: middle;
    }
    .spec-label {
      width: 40%;
      font-size: 9pt;
      color: #6b7280;
      font-weight: 500;
    }
    .spec-value {
      font-size: 10pt;
      font-weight: 700;
      color: #111827;
    }

    /* ─── FINANCIAL TABLE ─── */
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
    }
    .financial-table thead th {
      background: #1e3a5f;
      color: #fff;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      text-align: left;
    }
    .financial-table thead th.right { text-align: right; }
    .financial-table tbody td {
      padding: 9px 10px;
      border: 1px solid #e5e7eb;
      font-size: 10.5pt;
      vertical-align: top;
    }
    .financial-table tbody td.right {
      text-align: right;
      font-weight: 700;
      white-space: nowrap;
    }
    .financial-table .desc-sub {
      display: block;
      font-size: 8.5pt;
      color: #6b7280;
      margin-top: 2px;
    }
    .total-row td {
      background: #1e3a5f;
      color: #fff;
      padding: 8px 10px;
      border: 1px solid #1e3a5f;
      font-weight: 800;
    }
    .total-row .total-label { font-size: 11pt; }
    .total-row .total-amount { text-align: right; font-size: 14pt; white-space: nowrap; }
    .vat-note {
      font-size: 8.5pt;
      color: #6b7280;
      font-style: italic;
      margin-top: 5px;
    }

    /* ─── INFO GRID (3-col) ─── */
    .info-grid { display: table; width: 100%; border-spacing: 10px 0; margin-bottom: 4px; }
    .info-cell {
      display: table-cell;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 9px 11px;
      background: #f9fafb;
    }
    .info-cell + .info-cell { margin-left: 10px; }
    .cell-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .cell-value {
      font-size: 11pt;
      font-weight: 800;
      color: #111827;
    }

    /* ─── CONDITIONS ─── */
    .conditions-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 13px;
      background: #fafafa;
      margin-bottom: 4px;
    }
    .cond-item {
      font-size: 8.5pt;
      color: #4b5563;
      line-height: 1.75;
      padding: 2px 0;
    }
    .cond-item + .cond-item { border-top: 1px dotted #e5e7eb; }
    .cond-item strong { color: #1e3a5f; }

    /* ─── SIGNATURES ─── */
    .signatures { display: table; width: 100%; margin-top: 24px; border-spacing: 30px 0; }
    .sig-block {
      display: table-cell;
      border-top: 2px solid #1e3a5f;
      padding-top: 8px;
    }
    .sig-label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      font-weight: 700;
    }
    .sig-name {
      font-size: 9.5pt;
      color: #374151;
      margin-top: 2px;
      margin-bottom: 44px;
    }
    .sig-line { border-bottom: 1px dashed #9ca3af; }
    .sig-mention {
      font-size: 8pt;
      color: #9ca3af;
      margin-top: 4px;
      font-style: italic;
    }

    /* ─── FOOTER ─── */
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt;
      color: #9ca3af;
      text-align: center;
      line-height: 1.5;
    }

    /* ─── PRINT / @page ─── */
    @page {
      size: A4 portrait;
      margin: 14mm 12mm;
    }
    @media print {
      body { font-size: 10pt; }
      .page { padding: 0; width: 100%; }
      .section-title, .info-cell, .party-box, .conditions-box { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    <div class="header-left">
      <div class="company-name">${sellerName}</div>
      <div class="company-tagline">Commerce de véhicules d'occasion</div>
      <div class="company-coords">
        ${sellerAddress ? sellerAddress + '<br>' : ''}${sellerPhone ? 'Tél : ' + sellerPhone + '<br>' : ''}${sellerEmail ? 'E-mail : ' + sellerEmail + '<br>' : ''}${sellerSiret ? 'BCE / TVA : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="header-right">
      <div class="doc-type">Facture de vente</div>
      <div class="doc-badge">N° ${invoiceNumber}</div>
      <div class="doc-date">Date : ${formatDate(sale.sale_date)}</div>
    </div>
  </div>

  <!-- ═══ PARTIES ═══ -->
  <div class="parties">
    <div class="party-box">
      <div class="box-title">Vendeur</div>
      <div class="party-name">${sellerName}</div>
      <div class="party-detail">
        ${sellerAddress ? sellerAddress + '<br>' : ''}${sellerPhone ? 'Tél : ' + sellerPhone + '<br>' : ''}${sellerEmail ? 'E-mail : ' + sellerEmail + '<br>' : ''}${sellerSiret ? 'BCE / TVA : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="party-box">
      <div class="box-title">Acheteur / Client</div>
      <div class="party-name">${clientFullName}</div>
      ${sale.company_name ? `<div class="party-company">${sale.company_name}</div>` : ''}
      <div class="party-detail">
        ${clientAddress ? clientAddress + '<br>' : ''}${sale.client_phone ? 'Tél : ' + sale.client_phone + '<br>' : ''}${sale.client_email ? 'E-mail : ' + sale.client_email + '<br>' : ''}${sale.siret ? 'BCE : ' + sale.siret + '<br>' : ''}${sale.vat_number ? 'N° TVA : ' + sale.vat_number : ''}
      </div>
    </div>
  </div>

  <!-- ═══ VEHICLE ═══ -->
  <div class="section-title">Désignation du véhicule</div>
  <div class="vehicle-headline">
    ${vehicle.brand} ${vehicle.model}${vehicle.version ? ' · ' + vehicle.version : ''} &mdash; ${vehicle.year}
  </div>
  <table class="specs-table">
    <tbody>
      ${row('Marque / Modèle', `${vehicle.brand} ${vehicle.model}`)}
      ${vehicle.version ? row('Version / Finition', vehicle.version) : ''}
      ${row('Année', vehicle.year)}
      ${vehicle.license_plate ? row('Immatriculation', vehicle.license_plate) : ''}
      ${vehicle.vin ? row('N° de châssis (VIN)', vehicle.vin) : ''}
      ${row('Carburant', FUEL_TYPE_LABELS[vehicle.fuel_type as FuelType] ?? vehicle.fuel_type)}
      ${row('Boîte de vitesses', TRANSMISSION_LABELS[vehicle.transmission as TransmissionType] ?? vehicle.transmission)}
      ${vehicle.color ? row('Couleur extérieure', vehicle.color) : ''}
      ${vehicle.doors ? row('Nombre de portes', vehicle.doors) : ''}
      ${sale.mileage_at_sale ? row('Kilométrage à la vente', formatMileage(sale.mileage_at_sale)) : ''}
      ${row('Régime TVA', vatRegimeLabel)}
    </tbody>
  </table>

  <!-- ═══ FINANCIAL ═══ -->
  <div class="section-title">Conditions financières</div>
  <table class="financial-table">
    <thead>
      <tr>
        <th style="width:68%">Désignation</th>
        <th class="right">Montant TTC</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''}</strong>
          <span class="desc-sub">
            ${vehicle.license_plate ? 'Immat. ' + vehicle.license_plate + ' &mdash; ' : ''}${vehicle.year}${sale.mileage_at_sale ? ' &mdash; ' + formatMileage(sale.mileage_at_sale) : ''}
          </span>
        </td>
        <td class="right">${formatPrice(sale.sale_price)}</td>
      </tr>
    </tbody>
    <tr class="total-row">
      <td class="total-label">Total TTC</td>
      <td class="total-amount">${formatPrice(sale.sale_price)}</td>
    </tr>
  </table>
  ${isMarginScheme
    ? "<p class=\"vat-note\">&#9432;&nbsp; V&eacute;hicule vendu sous le r&eacute;gime de la marge &mdash; TVA non r&eacute;cup&eacute;rable par l\u2019acheteur (Art. 312 &agrave; 325, Directive 2006/112/CE).</p>"
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
  <div class="section-title">Conditions générales de vente</div>
  <div class="conditions-box">
    <div class="cond-item"><strong>Transfert de propriété :</strong> La propriété du véhicule est transférée à l'acheteur dès réception intégrale du montant de la vente.</div>
    <div class="cond-item"><strong>État du véhicule :</strong> Le véhicule est vendu en l'état, vu et accepté par l'acheteur. Le vendeur atteste que le kilométrage indiqué est exact à sa connaissance.</div>
    <div class="cond-item"><strong>Garantie :</strong> ${warrantyClause}</div>
    <div class="cond-item"><strong>Immatriculation :</strong> Les démarches d'immatriculation sont à la charge exclusive de l'acheteur, sauf accord écrit contraire.</div>
    <div class="cond-item"><strong>Litige :</strong> Tout litige relatif à la présente vente sera soumis au tribunal compétent du ressort du siège social du vendeur.</div>
  </div>

  <!-- ═══ SIGNATURES ═══ -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-label">Signature du vendeur</div>
      <div class="sig-name">${sellerName}</div>
      <div class="sig-line"></div>
      <div class="sig-mention">Lu et approuvé &mdash; Signature et cachet</div>
    </div>
    <div class="sig-block">
      <div class="sig-label">Signature de l'acheteur</div>
      <div class="sig-name">${clientFullName}</div>
      <div class="sig-line"></div>
      <div class="sig-mention">Lu et approuvé &mdash; Bon pour accord</div>
    </div>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div class="footer">
    Document généré le ${generatedDate}&nbsp;&nbsp;&bull;&nbsp;&nbsp;Facture N° ${invoiceNumber}${sellerSiret ? '&nbsp;&nbsp;&bull;&nbsp;&nbsp;BCE / TVA : ' + sellerSiret : ''}
  </div>

</div>
</body>
</html>`;
}
