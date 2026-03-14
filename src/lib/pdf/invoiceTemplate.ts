import type { Vehicle, Garage } from '@/types/database';
import type { SaleFormData } from '@/features/sales/schemas/saleForm';
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  PAYMENT_METHOD_LABELS,
  WARRANTY_LABELS,
  CIVILITY_LABELS,
  type FuelType,
  type TransmissionType,
  type PaymentMethod,
  type WarrantyOption,
  type Civility,
} from '@/lib/constants';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMileage(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
}

interface InvoiceData {
  invoiceNumber: string;
  vehicle: Vehicle;
  sale: SaleFormData;
  costPrice: number;
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

  const clientName = [
    sale.client_civility ? CIVILITY_LABELS[sale.client_civility as Civility] : '',
    sale.client_firstname,
    sale.client_lastname,
  ]
    .filter(Boolean)
    .join(' ');

  const clientAddress = [
    sale.client_address,
    [sale.client_zip, sale.client_city].filter(Boolean).join(' '),
    sale.client_country,
  ]
    .filter(Boolean)
    .join('<br/>');

  const warrantyLabel = WARRANTY_LABELS[sale.warranty as WarrantyOption] ?? sale.warranty;
  const paymentLabel =
    PAYMENT_METHOD_LABELS[sale.payment_method as PaymentMethod] ?? sale.payment_method;

  const vehicleDescription = [
    `${vehicle.brand} ${vehicle.model}`,
    vehicle.version,
    `Année : ${vehicle.year}`,
    vehicle.vin ? `VIN : ${vehicle.vin}` : null,
    vehicle.license_plate ? `Immatriculation : ${vehicle.license_plate}` : null,
    `Carburant : ${FUEL_TYPE_LABELS[vehicle.fuel_type as FuelType] ?? vehicle.fuel_type}`,
    `Boîte : ${TRANSMISSION_LABELS[vehicle.transmission as TransmissionType] ?? vehicle.transmission}`,
    vehicle.color ? `Couleur : ${vehicle.color}` : null,
    sale.mileage_at_sale ? `Kilométrage : ${formatMileage(sale.mileage_at_sale)}` : null,
  ]
    .filter(Boolean)
    .join('<br/>');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #3B82F6;
    }
    .company-info {
      font-size: 11px;
      color: #666;
      margin-top: 4px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-number {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .invoice-date {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .party {
      width: 45%;
    }
    .party-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .party-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .party-details {
      font-size: 11px;
      color: #555;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead th {
      background: #f8f9fa;
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }
    thead th:last-child { text-align: right; }
    tbody td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
    }
    tbody td:last-child {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;
    }
    .vehicle-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .vehicle-details {
      font-size: 10px;
      color: #666;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .totals-row.total {
      border-bottom: none;
      border-top: 2px solid #1a1a1a;
      padding-top: 10px;
      margin-top: 4px;
      font-size: 16px;
      font-weight: 700;
    }
    .info-section {
      margin-bottom: 30px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .info-section h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      margin-bottom: 8px;
    }
    .info-grid {
      display: flex;
      gap: 30px;
    }
    .info-item {
      font-size: 12px;
    }
    .info-item strong {
      display: block;
      color: #1a1a1a;
    }
    .info-item span {
      color: #666;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${sellerName}</div>
      <div class="company-info">
        ${sellerAddress ? sellerAddress + '<br/>' : ''}
        ${sellerSiret ? 'SIRET : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-number">${invoiceNumber}</div>
      <div class="invoice-date">${formatDate(sale.sale_date)}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Vendeur</div>
      <div class="party-name">${sellerName}</div>
      <div class="party-details">
        ${sellerAddress ? sellerAddress + '<br/>' : ''}
        ${sellerPhone ? 'Tél : ' + sellerPhone + '<br/>' : ''}
        ${sellerEmail ? 'Email : ' + sellerEmail + '<br/>' : ''}
        ${sellerSiret ? 'SIRET : ' + sellerSiret : ''}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Client</div>
      <div class="party-name">${clientName}</div>
      ${sale.company_name ? `<div class="party-details" style="font-weight:600;">${sale.company_name}</div>` : ''}
      <div class="party-details">
        ${clientAddress}
        ${sale.client_phone ? `<br/>Tél : ${sale.client_phone}` : ''}
        ${sale.client_email ? `<br/>Email : ${sale.client_email}` : ''}
        ${sale.siret ? `<br/>SIRET : ${sale.siret}` : ''}
        ${sale.vat_number ? `<br/>TVA Intra : ${sale.vat_number}` : ''}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th style="text-align:right;">Prix TTC</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="vehicle-name">${vehicle.brand} ${vehicle.model}${vehicle.version ? ` - ${vehicle.version}` : ''}</div>
          <div class="vehicle-details">${vehicleDescription}</div>
        </td>
        <td>${formatPrice(sale.sale_price)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="totals-row total">
        <span>Total TTC</span>
        <span>${formatPrice(sale.sale_price)}</span>
      </div>
    </div>
  </div>

  <div class="info-section">
    <h3>Informations de paiement</h3>
    <div class="info-grid">
      <div class="info-item">
        <span>Mode de paiement</span>
        <strong>${paymentLabel}</strong>
      </div>
      <div class="info-item">
        <span>Garantie</span>
        <strong>${warrantyLabel}</strong>
      </div>
    </div>
  </div>

  <div class="footer">
    Facture générée le ${formatDate(new Date().toISOString())} — ${invoiceNumber}
  </div>
</body>
</html>`;
}
