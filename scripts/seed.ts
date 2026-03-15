/**
 * Seed script — Insère des données fictives pour tester l'app.
 *
 * Usage :
 *   npm run seed
 *   npm run seed -- --clear    ← supprime toutes les données du compte avant de seeder
 *
 * Variables requises dans .env :
 *   EXPO_PUBLIC_SUPABASE_URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   SEED_USER_EMAIL      ← email d'un compte existant
 *   SEED_USER_PASSWORD   ← mot de passe de ce compte
 */

import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = process.env.SEED_USER_EMAIL;
const PASSWORD = process.env.SEED_USER_PASSWORD;
const CLEAR = process.argv.includes('--clear');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont requis dans .env');
  process.exit(1);
}
if (!EMAIL || !PASSWORD) {
  console.error('❌  SEED_USER_EMAIL et SEED_USER_PASSWORD sont requis dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Données fictives ─────────────────────────────────────────────────────────
//
//  Tous les véhicules sont achetés et revendus au T1 2026 (jan–mar).
//  Chaque véhicule passe par TOUS les statuts :
//    purchased → technical_control → bodywork → mechanic → cleaning → ready_for_sale → sold
//
//  Régimes TVA :
//    • Achat à un particulier  → régime de la marge (vat_regime: 'margin')
//    • Achat à un professionnel → régime normal      (vat_regime: 'normal')
//
//  TVA belge : 21 % sur tous les frais.
// ─────────────────────────────────────────────────────────────────────────────

const VEHICLES = [
  // ── 0 · VW Golf VII 1.6 TDI — particulier → régime marge ──
  {
    brand: 'Volkswagen', model: 'Golf', version: 'VII 1.6 TDI 110 Confortline',
    year: 2019, mileage: 78_000, fuel_type: 'diesel', transmission: 'manual',
    color: 'Blanc Candy', doors: 5,
    purchase_price: 9_800, purchase_date: '2026-01-05',
    seller_type: 'particular', seller_name: 'Didier Lecomte', seller_phone: '+32 494 12 34 56',
    vat_regime: 'margin', seller_vat_number: null,
    notes: '[SEED] Bon état général, carnet d\'entretien complet.',
    status: 'sold',
  },
  // ── 1 · BMW 118d — professionnel → régime normal ──
  {
    brand: 'BMW', model: 'Série 1', version: '118d 150 Business Design',
    year: 2020, mileage: 52_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Noir Saphir métallisé', doors: 5,
    purchase_price: 14_500, purchase_date: '2026-01-07',
    seller_type: 'professional', seller_name: 'BMW Premium Selection Bruxelles',
    seller_phone: '+32 2 349 80 00',
    vat_regime: 'normal', seller_vat_number: 'BE 0456.123.789',
    notes: '[SEED] Véhicule certifié BMW, historique complet.',
    status: 'sold',
  },
  // ── 2 · Peugeot 308 SW — particulier → régime marge ──
  {
    brand: 'Peugeot', model: '308 SW', version: '1.5 BlueHDi 130 EAT8 Allure Pack',
    year: 2021, mileage: 39_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Gris Platinium', doors: 5,
    purchase_price: 12_500, purchase_date: '2026-01-09',
    seller_type: 'particular', seller_name: 'Martine Dupont', seller_phone: '+32 471 98 76 54',
    vat_regime: 'margin', seller_vat_number: null,
    notes: '[SEED] Première propriétaire, factures d\'entretien fournies.',
    status: 'sold',
  },
  // ── 3 · Renault Clio V — particulier → régime marge ──
  {
    brand: 'Renault', model: 'Clio V', version: '1.0 TCe 100 Intens',
    year: 2022, mileage: 22_000, fuel_type: 'essence', transmission: 'manual',
    color: 'Rouge Flamme', doors: 5,
    purchase_price: 7_800, purchase_date: '2026-01-12',
    seller_type: 'particular', seller_name: 'Nicolas Poncin', seller_phone: '+32 477 55 44 33',
    vat_regime: 'margin', seller_vat_number: null,
    notes: '[SEED] Très peu de kilomètres, pneumatiques récents.',
    status: 'sold',
  },
  // ── 4 · Audi A4 Avant — professionnel → régime normal ──
  {
    brand: 'Audi', model: 'A4 Avant', version: '2.0 TDI 190 S tronic S line',
    year: 2020, mileage: 58_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Gris Manhattan perlé', doors: 5,
    purchase_price: 18_500, purchase_date: '2026-01-14',
    seller_type: 'professional', seller_name: 'Audi Fleet Solutions Anvers',
    seller_phone: '+32 3 287 44 00',
    vat_regime: 'normal', seller_vat_number: 'BE 0543.789.012',
    notes: '[SEED] Ex-véhicule de leasing fleet, excellent état.',
    status: 'sold',
  },
  // ── 5 · Toyota Corolla Hybride — particulier → régime marge ──
  {
    brand: 'Toyota', model: 'Corolla', version: '1.8 Hybride 122h Dynamic+',
    year: 2021, mileage: 31_000, fuel_type: 'hybrid', transmission: 'automatic',
    color: 'Gris Lunaire nacré', doors: 5,
    purchase_price: 17_500, purchase_date: '2026-01-16',
    seller_type: 'particular', seller_name: 'Isabelle Renard', seller_phone: '+32 495 66 77 88',
    vat_regime: 'margin', seller_vat_number: null,
    notes: '[SEED] Hybride, consommation très basse, deux clés.',
    status: 'sold',
  },
  // ── 6 · Mercedes-Benz Classe C — professionnel → régime normal ──
  {
    brand: 'Mercedes-Benz', model: 'Classe C', version: '220d 194 AMG Line 9G-Tronic',
    year: 2020, mileage: 47_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Blanc Polaire', doors: 4,
    purchase_price: 21_000, purchase_date: '2026-01-19',
    seller_type: 'professional', seller_name: 'Mercedes-Benz Certified Bruxelles',
    seller_phone: '+32 2 612 50 00',
    vat_regime: 'normal', seller_vat_number: 'BE 0432.876.543',
    notes: '[SEED] Véhicule certifié Mercedes, garantie constructeur résiduelle.',
    status: 'sold',
  },
  // ── 7 · Citroën C5 Aircross — particulier → régime marge ──
  {
    brand: 'Citroën', model: 'C5 Aircross', version: '1.5 BlueHDi 130 EAT8 Shine',
    year: 2021, mileage: 44_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Bleu Cobalt métallisé', doors: 5,
    purchase_price: 15_000, purchase_date: '2026-01-21',
    seller_type: 'particular', seller_name: 'François Charlier', seller_phone: '+32 496 22 11 00',
    vat_regime: 'margin', seller_vat_number: null,
    notes: '[SEED] Options cuir + toit panoramique, état impeccable.',
    status: 'sold',
  },
] as const;

// ─── Historique des statuts ────────────────────────────────────────────────────
// Chaque véhicule passe par TOUS les statuts, dans l'ordre chronologique.
// purchased → technical_control → bodywork → mechanic → cleaning → ready_for_sale → sold
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_HISTORY: Record<number, { from: string | null; to: string; date: string; notes?: string }[]> = {
  // 0 · VW Golf — acheté jan 5, vendu fév 12
  0: [
    { from: null,              to: 'purchased',       date: '2026-01-05' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-07' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-10' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-14' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-01-18' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-01-20' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-02-12', notes: 'Vente FAC-2026-001' },
  ],
  // 1 · BMW 118d — acheté jan 7, vendu fév 18
  1: [
    { from: null,              to: 'purchased',       date: '2026-01-07' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-09' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-13' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-17' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-01-21' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-01-23' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-02-18', notes: 'Vente FAC-2026-002' },
  ],
  // 2 · Peugeot 308 SW — acheté jan 9, vendu fév 28
  2: [
    { from: null,              to: 'purchased',       date: '2026-01-09' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-12' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-15' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-19' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-01-23' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-01-25' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-02-28', notes: 'Vente FAC-2026-003' },
  ],
  // 3 · Renault Clio V — acheté jan 12, vendu mar 5
  3: [
    { from: null,              to: 'purchased',       date: '2026-01-12' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-14' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-17' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-21' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-01-25' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-01-27' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-03-05', notes: 'Vente FAC-2026-004' },
  ],
  // 4 · Audi A4 Avant — acheté jan 14, vendu mar 10
  4: [
    { from: null,              to: 'purchased',       date: '2026-01-14' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-16' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-20' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-24' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-01-28' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-01-30' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-03-10', notes: 'Vente FAC-2026-005' },
  ],
  // 5 · Toyota Corolla — acheté jan 16, vendu mar 16
  5: [
    { from: null,              to: 'purchased',       date: '2026-01-16' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-19' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-23' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-27' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-02-01' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-02-03' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-03-16', notes: 'Vente FAC-2026-006' },
  ],
  // 6 · Mercedes Classe C — acheté jan 19, vendu mar 22
  6: [
    { from: null,              to: 'purchased',       date: '2026-01-19' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-21' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-25' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-29' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-02-03' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-02-05' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-03-22', notes: 'Vente FAC-2026-007' },
  ],
  // 7 · Citroën C5 Aircross — acheté jan 21, vendu mar 28
  7: [
    { from: null,              to: 'purchased',       date: '2026-01-21' },
    { from: 'purchased',       to: 'technical_control', date: '2026-01-23' },
    { from: 'technical_control', to: 'bodywork',      date: '2026-01-27' },
    { from: 'bodywork',        to: 'mechanic',         date: '2026-01-31' },
    { from: 'mechanic',        to: 'cleaning',         date: '2026-02-05' },
    { from: 'cleaning',        to: 'ready_for_sale',   date: '2026-02-07' },
    { from: 'ready_for_sale',  to: 'sold',             date: '2026-03-28', notes: 'Vente FAC-2026-008' },
  ],
};

// ─── Dépenses par véhicule (TVA belge 21 %) ───────────────────────────────────

type Expense = {
  category: string;
  provider?: string;
  amount_ht: number;
  vat_rate: number;
  amount_ttc: number;
  expense_date: string;
  payment_status: string;
  invoice_ref?: string;
  notes?: string;
};

const EXPENSES: Record<number, Expense[]> = {
  // ── 0 · VW Golf ──
  0: [
    {
      category: 'administrative', provider: 'SPW — Namur (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-06', payment_status: 'paid', notes: 'Carte grise au nom de la société',
    },
    {
      category: 'technical_control', provider: 'DEKRA Liège',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-08', payment_status: 'paid', invoice_ref: 'DK-2026-4821',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Leclercq & Fils',
      amount_ht: 330.00, vat_rate: 21, amount_ttc: 399.30,
      expense_date: '2026-01-11', payment_status: 'paid', invoice_ref: 'CLF-2026-112',
      notes: 'Retouche peinture aile arrière droite + lustrage',
    },
    {
      category: 'mechanic', provider: 'Auto Expert Garage Liège',
      amount_ht: 180.00, vat_rate: 21, amount_ttc: 217.80,
      expense_date: '2026-01-15', payment_status: 'paid', invoice_ref: 'AEG-2026-308',
      notes: 'Vidange + filtre à huile + filtre à air',
    },
    {
      category: 'cleaning', provider: 'Auto Shine Liège',
      amount_ht: 100.00, vat_rate: 21, amount_ttc: 121.00,
      expense_date: '2026-01-19', payment_status: 'paid',
      notes: 'Nettoyage intérieur/extérieur + polissage',
    },
  ],
  // ── 1 · BMW 118d ──
  1: [
    {
      category: 'administrative', provider: 'DIV Bruxelles (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-08', payment_status: 'paid', notes: 'Immatriculation',
    },
    {
      category: 'technical_control', provider: 'AUTOVISION Bruxelles-Laeken',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-10', payment_status: 'paid', invoice_ref: 'AV-2026-2204',
    },
    {
      category: 'bodywork', provider: 'Brussels Body Works',
      amount_ht: 495.00, vat_rate: 21, amount_ttc: 598.95,
      expense_date: '2026-01-14', payment_status: 'paid', invoice_ref: 'BBW-2026-078',
      notes: 'Débosselage aile avant gauche + peinture au marbre',
    },
    {
      category: 'mechanic', provider: 'BMW Service Bruxelles-Est',
      amount_ht: 350.00, vat_rate: 21, amount_ttc: 423.50,
      expense_date: '2026-01-18', payment_status: 'paid', invoice_ref: 'BMW-2026-9901',
      notes: 'Révision complète + remplacement disques/plaquettes AV',
    },
    {
      category: 'cleaning', provider: 'Premium Détailing BXL',
      amount_ht: 125.00, vat_rate: 21, amount_ttc: 151.25,
      expense_date: '2026-01-22', payment_status: 'paid',
      notes: 'Polissage carrosserie + traitement céramique',
    },
  ],
  // ── 2 · Peugeot 308 SW ──
  2: [
    {
      category: 'administrative', provider: 'SPW — Namur (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-10', payment_status: 'paid', notes: 'Carte grise',
    },
    {
      category: 'technical_control', provider: 'AUTOVISION Namur',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-13', payment_status: 'paid', invoice_ref: 'AV-2026-3301',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Maes Namur',
      amount_ht: 280.00, vat_rate: 21, amount_ttc: 338.80,
      expense_date: '2026-01-16', payment_status: 'paid', invoice_ref: 'CMN-2026-054',
      notes: 'Réparation rayure portière conducteur + peinture',
    },
    {
      category: 'mechanic', provider: 'Garage Premium Auto Namur',
      amount_ht: 200.00, vat_rate: 21, amount_ttc: 242.00,
      expense_date: '2026-01-20', payment_status: 'paid', invoice_ref: 'GPA-2026-177',
      notes: 'Vidange + pneumatiques AR (2 pneus)',
    },
    {
      category: 'cleaning', provider: 'Auto Brillant Namur',
      amount_ht: 95.00, vat_rate: 21, amount_ttc: 114.95,
      expense_date: '2026-01-24', payment_status: 'paid',
      notes: 'Nettoyage complet + désodorisation',
    },
  ],
  // ── 3 · Renault Clio V ──
  3: [
    {
      category: 'administrative', provider: 'SPW — Charleroi (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-13', payment_status: 'paid',
    },
    {
      category: 'technical_control', provider: 'DEKRA Charleroi',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-15', payment_status: 'paid', invoice_ref: 'DK-2026-6632',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Charlier Frères',
      amount_ht: 195.00, vat_rate: 21, amount_ttc: 235.95,
      expense_date: '2026-01-18', payment_status: 'paid', invoice_ref: 'CCF-2026-041',
      notes: 'Retouche pare-chocs arrière + rayure capot',
    },
    {
      category: 'mechanic', provider: 'Renault Service Charleroi',
      amount_ht: 160.00, vat_rate: 21, amount_ttc: 193.60,
      expense_date: '2026-01-22', payment_status: 'paid', invoice_ref: 'RSC-2026-889',
      notes: 'Vidange + remplacement filtre habitacle',
    },
    {
      category: 'cleaning', provider: 'Shine Pro Charleroi',
      amount_ht: 85.00, vat_rate: 21, amount_ttc: 102.85,
      expense_date: '2026-01-26', payment_status: 'paid',
    },
  ],
  // ── 4 · Audi A4 Avant ──
  4: [
    {
      category: 'administrative', provider: 'DIV Anvers (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-15', payment_status: 'paid',
    },
    {
      category: 'technical_control', provider: 'AUTOVISION Anvers-Noord',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-17', payment_status: 'paid', invoice_ref: 'AV-2026-5501',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Janssen Anvers',
      amount_ht: 420.00, vat_rate: 21, amount_ttc: 508.20,
      expense_date: '2026-01-21', payment_status: 'paid', invoice_ref: 'CJA-2026-233',
      notes: 'Réparation bosse toit + remplacement jonc de toit',
    },
    {
      category: 'mechanic', provider: 'Audi Service Anvers',
      amount_ht: 550.00, vat_rate: 21, amount_ttc: 665.50,
      expense_date: '2026-01-25', payment_status: 'paid', invoice_ref: 'ASA-2026-4420',
      notes: 'Révision longue + remplacement 4 plaquettes de freins + disques AV',
    },
    {
      category: 'cleaning', provider: 'VIP Car Spa Anvers',
      amount_ht: 140.00, vat_rate: 21, amount_ttc: 169.40,
      expense_date: '2026-01-29', payment_status: 'paid',
      notes: 'Full detailing intérieur + polissage carrosserie',
    },
  ],
  // ── 5 · Toyota Corolla Hybride ──
  5: [
    {
      category: 'administrative', provider: 'DIV Gand (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-17', payment_status: 'paid',
    },
    {
      category: 'technical_control', provider: 'AUTOVISION Gand-Centre',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-20', payment_status: 'paid', invoice_ref: 'AV-2026-7712',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Van den Berg Gand',
      amount_ht: 385.00, vat_rate: 21, amount_ttc: 465.85,
      expense_date: '2026-01-24', payment_status: 'paid', invoice_ref: 'CVG-2026-099',
      notes: 'Remplacement pare-chocs avant + peinture',
    },
    {
      category: 'mechanic', provider: 'Toyota Service Gand',
      amount_ht: 280.00, vat_rate: 21, amount_ttc: 338.80,
      expense_date: '2026-01-28', payment_status: 'paid', invoice_ref: 'TSG-2026-3310',
      notes: 'Révision hybride + remplacement filtre à air + filtre habitacle',
    },
    {
      category: 'cleaning', provider: 'Clean & Shine Gand',
      amount_ht: 110.00, vat_rate: 21, amount_ttc: 133.10,
      expense_date: '2026-02-02', payment_status: 'paid',
    },
  ],
  // ── 6 · Mercedes Classe C ──
  6: [
    {
      category: 'administrative', provider: 'DIV Bruxelles (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-20', payment_status: 'paid',
    },
    {
      category: 'technical_control', provider: 'DEKRA Bruxelles-Ixelles',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-22', payment_status: 'paid', invoice_ref: 'DK-2026-8844',
    },
    {
      category: 'bodywork', provider: 'Premium Carrosserie Bruxelles',
      amount_ht: 640.00, vat_rate: 21, amount_ttc: 774.40,
      expense_date: '2026-01-26', payment_status: 'paid', invoice_ref: 'PCB-2026-155',
      notes: 'Rénovation pare-chocs arrière + remplacement feu arrière gauche + peinture',
    },
    {
      category: 'mechanic', provider: 'Mercedes-Benz Service Bruxelles',
      amount_ht: 480.00, vat_rate: 21, amount_ttc: 580.80,
      expense_date: '2026-01-30', payment_status: 'paid', invoice_ref: 'MBS-2026-7721',
      notes: 'Révision A + vidange boîte DSG + remplacement courroies accessoires',
    },
    {
      category: 'cleaning', provider: 'Luxury Auto Detail BXL',
      amount_ht: 160.00, vat_rate: 21, amount_ttc: 193.60,
      expense_date: '2026-02-04', payment_status: 'paid',
      notes: 'Detailing complet niveau showroom',
    },
  ],
  // ── 7 · Citroën C5 Aircross ──
  7: [
    {
      category: 'administrative', provider: 'SPW — Liège (carte grise)',
      amount_ht: 50.00, vat_rate: 21, amount_ttc: 60.50,
      expense_date: '2026-01-22', payment_status: 'paid',
    },
    {
      category: 'technical_control', provider: 'DEKRA Liège-Ougrée',
      amount_ht: 75.00, vat_rate: 21, amount_ttc: 90.75,
      expense_date: '2026-01-24', payment_status: 'paid', invoice_ref: 'DK-2026-9102',
    },
    {
      category: 'bodywork', provider: 'Carrosserie Renard Liège',
      amount_ht: 490.00, vat_rate: 21, amount_ttc: 592.90,
      expense_date: '2026-01-28', payment_status: 'paid', invoice_ref: 'CRL-2026-081',
      notes: 'Réparation bosse portière arrière gauche + peinture + lustrage',
    },
    {
      category: 'mechanic', provider: 'Garage Leclerc Auto Liège',
      amount_ht: 310.00, vat_rate: 21, amount_ttc: 375.10,
      expense_date: '2026-02-01', payment_status: 'paid', invoice_ref: 'GLA-2026-614',
      notes: 'Vidange + pneumatiques AV (2 pneus Michelin) + équilibrage',
    },
    {
      category: 'cleaning', provider: 'Premium Detailing Liège',
      amount_ht: 120.00, vat_rate: 21, amount_ttc: 145.20,
      expense_date: '2026-02-06', payment_status: 'paid',
    },
  ],
};

// ─── Ventes (8 transactions, T1 2026) ─────────────────────────────────────────

const SALES = [
  // 0 · VW Golf → Jean-Pierre Renard (particulier, Liège)
  {
    vehicleIndex: 0,
    invoice_number: 'FAC-2026-001',
    sale_date: '2026-02-12',
    sale_price: 13_400,
    payment_method: 'transfer',
    mileage_at_sale: 78_350,
    warranty: '3_months',
    client_civility: 'mr',
    client_firstname: 'Jean-Pierre',
    client_lastname: 'Renard',
    client_address: '18 rue des Pitteurs',
    client_zip: '4020',
    client_city: 'Liège',
    client_country: 'Belgique',
    client_phone: '+32 487 33 22 11',
    client_email: 'jp.renard@gmail.com',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
  // 1 · BMW 118d → Sophie Dubois (particulière, Bruxelles)
  {
    vehicleIndex: 1,
    invoice_number: 'FAC-2026-002',
    sale_date: '2026-02-18',
    sale_price: 19_500,
    payment_method: 'transfer',
    mileage_at_sale: 52_280,
    warranty: '3_months',
    client_civility: 'mrs',
    client_firstname: 'Sophie',
    client_lastname: 'Dubois',
    client_address: 'Avenue Louise 87',
    client_zip: '1050',
    client_city: 'Bruxelles',
    client_country: 'Belgique',
    client_phone: '+32 476 88 55 44',
    client_email: 'sophie.dubois@outlook.be',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
  // 2 · Peugeot 308 SW → Entreprises Collin SA (professionnel, Namur)
  {
    vehicleIndex: 2,
    invoice_number: 'FAC-2026-003',
    sale_date: '2026-02-28',
    sale_price: 16_200,
    payment_method: 'transfer',
    mileage_at_sale: 39_420,
    warranty: '6_months',
    client_civility: 'mr',
    client_firstname: 'Arnaud',
    client_lastname: 'Collin',
    client_address: 'Chaussée de Liège 234',
    client_zip: '5100',
    client_city: 'Namur',
    client_country: 'Belgique',
    client_phone: '+32 81 44 55 66',
    client_email: 'a.collin@entreprises-collin.be',
    client_type: 'professional',
    company_name: 'Entreprises Collin SA',
    siret: '0499.456.123',
    vat_number: 'BE 0499.456.123',
  },
  // 3 · Renault Clio V → Marie Lecomte (particulière, Charleroi)
  {
    vehicleIndex: 3,
    invoice_number: 'FAC-2026-004',
    sale_date: '2026-03-05',
    sale_price: 10_500,
    payment_method: 'cash',
    mileage_at_sale: 22_150,
    warranty: 'none',
    client_civility: 'mrs',
    client_firstname: 'Marie',
    client_lastname: 'Lecomte',
    client_address: 'Rue de la Montagne 12',
    client_zip: '6000',
    client_city: 'Charleroi',
    client_country: 'Belgique',
    client_phone: '+32 472 66 77 88',
    client_email: 'marie.lecomte@hotmail.com',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
  // 4 · Audi A4 Avant → Logistics West BVBA (professionnel, Anvers)
  {
    vehicleIndex: 4,
    invoice_number: 'FAC-2026-005',
    sale_date: '2026-03-10',
    sale_price: 24_500,
    payment_method: 'transfer',
    mileage_at_sale: 58_600,
    warranty: '6_months',
    client_civility: 'mr',
    client_firstname: 'Pieter',
    client_lastname: 'Van Damme',
    client_address: 'Scheldelaan 400',
    client_zip: '2040',
    client_city: 'Anvers',
    client_country: 'Belgique',
    client_phone: '+32 3 288 10 20',
    client_email: 'p.vandamme@logistics-west.be',
    client_type: 'professional',
    company_name: 'Logistics West BVBA',
    siret: '0612.345.678',
    vat_number: 'BE 0612.345.678',
  },
  // 5 · Toyota Corolla → Laurent Fontaine (particulier, Gand)
  {
    vehicleIndex: 5,
    invoice_number: 'FAC-2026-006',
    sale_date: '2026-03-16',
    sale_price: 22_800,
    payment_method: 'transfer',
    mileage_at_sale: 31_180,
    warranty: '3_months',
    client_civility: 'mr',
    client_firstname: 'Laurent',
    client_lastname: 'Fontaine',
    client_address: 'Korenmarkt 5',
    client_zip: '9000',
    client_city: 'Gand',
    client_country: 'Belgique',
    client_phone: '+32 468 99 11 22',
    client_email: 'laurent.fontaine@gmail.com',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
  // 6 · Mercedes Classe C → Nathalie Dumont (particulière, Bruxelles)
  {
    vehicleIndex: 6,
    invoice_number: 'FAC-2026-007',
    sale_date: '2026-03-22',
    sale_price: 28_500,
    payment_method: 'financing',
    mileage_at_sale: 47_320,
    warranty: '6_months',
    client_civility: 'mrs',
    client_firstname: 'Nathalie',
    client_lastname: 'Dumont',
    client_address: 'Place Sainte-Catherine 8',
    client_zip: '1000',
    client_city: 'Bruxelles',
    client_country: 'Belgique',
    client_phone: '+32 496 44 33 22',
    client_email: 'nathalie.dumont@yahoo.fr',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
  // 7 · Citroën C5 Aircross → Antoine Blanchard (particulier, Liège)
  {
    vehicleIndex: 7,
    invoice_number: 'FAC-2026-008',
    sale_date: '2026-03-28',
    sale_price: 19_800,
    payment_method: 'check',
    mileage_at_sale: 44_200,
    warranty: '3_months',
    client_civility: 'mr',
    client_firstname: 'Antoine',
    client_lastname: 'Blanchard',
    client_address: 'Quai de la Batte 22',
    client_zip: '4000',
    client_city: 'Liège',
    client_country: 'Belgique',
    client_phone: '+32 484 77 66 55',
    client_email: 'a.blanchard@live.be',
    client_type: 'particular',
    company_name: null,
    siret: null,
    vat_number: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(label: string) {
  console.log(`  ✅ ${label}`);
}

function fail(label: string, err: unknown) {
  console.error(`  ❌ ${label}:`, err);
  throw err;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  MMG Seed Script — T1 2026\n');

  // 1. Authentification
  console.log('🔐  Connexion...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL!,
    password: PASSWORD!,
  });
  if (authError || !authData.user) fail('Authentification', authError?.message);
  const userId = authData.user!.id;
  ok(`Connecté en tant que ${authData.user!.email}`);

  // 2. Suppression des données existantes (--clear)
  if (CLEAR) {
    console.log('\n🗑️   Suppression des données [SEED]...');
    const { data: garages } = await supabase
      .from('garages')
      .select('id')
      .eq('created_by', userId);

    if (garages && garages.length > 0) {
      for (const g of garages) {
        const { error } = await supabase.from('garages').delete().eq('id', g.id);
        if (error) fail('Suppression garage', error.message);
      }
    }
    ok('Données [SEED] supprimées');
    console.log('\n✅  Nettoyage terminé.\n');
    return;
  }

  // 3. Création du garage (contexte belge)
  console.log('\n🏢  Création du garage...');
  const { data: garageData, error: garageError } = await supabase
    .from('garages')
    .insert({
      name: 'MMG Auto & Services',
      address: 'Rue de la Régence 14, 4000 Liège',
      siret: '0725.456.123',
      phone: '+32 4 250 12 34',
      email: 'contact@mmg-auto.be',
      created_by: userId,
    })
    .select()
    .single();
  if (garageError || !garageData) fail('Création garage', garageError?.message);
  const garageId = garageData!.id;
  ok(`Garage créé : ${garageData!.name} (code: ${garageData!.invite_code})`);

  // 4. Membership owner
  console.log('\n👤  Création du membership owner...');
  const { error: memberError } = await supabase
    .from('garage_members')
    .insert({
      garage_id: garageId,
      user_id: userId,
      user_email: authData.user!.email,
      role: 'owner',
      status: 'active',
    });
  if (memberError) fail('Membership owner', memberError.message);
  ok('Membre owner ajouté');

  // 5. Insertion des véhicules
  console.log('\n🚗  Insertion des véhicules...');
  const vehicleIds: string[] = [];

  for (const [i, v] of VEHICLES.entries()) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({ ...v, garage_id: garageId })
      .select('id')
      .single();
    if (error || !data) fail(`Véhicule ${i + 1} (${v.brand} ${v.model})`, error?.message);
    vehicleIds.push(data!.id);
    ok(`${v.brand} ${v.model} — ${v.vat_regime === 'normal' ? 'régime normal' : 'régime marge'}`);
  }

  // 6. Historique des statuts
  console.log('\n📋  Insertion de l\'historique des statuts...');
  for (const [i, steps] of Object.entries(STATUS_HISTORY)) {
    const vehicleId = vehicleIds[Number(i)];
    const rows = steps.map((s) => ({
      vehicle_id: vehicleId,
      from_status: s.from,
      to_status: s.to,
      changed_at: new Date(s.date).toISOString(),
      notes: s.notes ?? null,
    }));
    const { error } = await supabase.from('vehicle_status_history').insert(rows);
    if (error) fail(`Historique véhicule ${Number(i) + 1}`, error.message);
  }
  const totalSteps = Object.values(STATUS_HISTORY).flat().length;
  ok(`${totalSteps} entrées d'historique créées (7 étapes × 8 véhicules)`);

  // 7. Dépenses
  console.log('\n💶  Insertion des dépenses...');
  let totalExpenseCount = 0;
  let totalExpensesTTC = 0;

  for (const [i, expenses] of Object.entries(EXPENSES)) {
    const vehicleId = vehicleIds[Number(i)];
    const v = VEHICLES[Number(i)];
    const rows = expenses.map((e) => ({ ...e, vehicle_id: vehicleId }));
    const { error } = await supabase.from('expenses').insert(rows);
    if (error) fail(`Dépenses véhicule ${v.brand} ${v.model}`, error.message);
    const ttc = expenses.reduce((s, e) => s + e.amount_ttc, 0);
    totalExpenseCount += expenses.length;
    totalExpensesTTC += ttc;
    ok(`${v.brand} ${v.model} — ${expenses.length} dépenses (${ttc.toFixed(2)} € TTC)`);
  }

  // 8. Ventes
  console.log('\n💰  Insertion des ventes...');
  let totalSalesAmount = 0;

  for (const sale of SALES) {
    const { vehicleIndex, ...saleData } = sale;
    const vehicleId = vehicleIds[vehicleIndex];
    const { error } = await supabase.from('sales').insert({ ...saleData, vehicle_id: vehicleId });
    if (error) fail(`Vente ${saleData.invoice_number}`, error.message);
    const v = VEHICLES[vehicleIndex];
    totalSalesAmount += saleData.sale_price;
    ok(`${saleData.invoice_number} — ${v.brand} ${v.model} → ${saleData.sale_price.toLocaleString('fr-BE')} € (${saleData.client_type === 'professional' ? saleData.company_name : `${saleData.client_firstname} ${saleData.client_lastname}`})`);
  }

  // 9. Résumé comptable T1 2026
  const totalPurchases = VEHICLES.reduce((s, v) => s + v.purchase_price, 0);

  // Ventes régime marge (véhicules achetés à des particuliers)
  const margeVehicles = VEHICLES.map((v, i) => ({ v, i })).filter(({ v }) => v.vat_regime === 'margin');
  const normalVehicles = VEHICLES.map((v, i) => ({ v, i })).filter(({ v }) => v.vat_regime === 'normal');

  let tvaSurMarge = 0;
  let tvaRegimeNormal = 0;
  let tvaDeductibleAchats = 0;
  let tvaDeductibleFrais = 0;

  for (const { v, i } of margeVehicles) {
    const sale = SALES.find((s) => s.vehicleIndex === i)!;
    const marge = sale.sale_price - v.purchase_price;
    if (marge > 0) tvaSurMarge += marge * (21 / 121);
  }
  for (const { v, i } of normalVehicles) {
    const sale = SALES.find((s) => s.vehicleIndex === i)!;
    tvaRegimeNormal += sale.sale_price * (21 / 121);
    tvaDeductibleAchats += v.purchase_price * (21 / 121);
  }
  for (const expenses of Object.values(EXPENSES)) {
    tvaDeductibleFrais += expenses.reduce((s, e) => s + e.amount_ht * (e.vat_rate / 100), 0);
  }

  const grille54 = tvaSurMarge + tvaRegimeNormal;
  const grille59 = tvaDeductibleAchats + tvaDeductibleFrais;
  const grille71 = grille54 - grille59;

  console.log('\n─────────────────────────────────────────────');
  console.log('✅  Seed T1 2026 terminé avec succès !');
  console.log('─────────────────────────────────────────────');
  console.log(`  Garage              : MMG Auto & Services (Liège)`);
  console.log(`  Véhicules créés     : ${VEHICLES.length} (${margeVehicles.length} marge · ${normalVehicles.length} normal)`);
  console.log(`  Dépenses créées     : ${totalExpenseCount} (${totalExpensesTTC.toFixed(2)} € TTC)`);
  console.log(`  Ventes créées       : ${SALES.length} (${totalSalesAmount.toLocaleString('fr-BE')} €)`);
  console.log(`  Achats totaux       : ${totalPurchases.toLocaleString('fr-BE')} €`);
  console.log('');
  console.log('  ── Grilles TVA T1 2026 (estimatif) ──');
  console.log(`  Grille 03 (base)    : ${(totalSalesAmount * (100 / 121)).toFixed(2)} €`);
  console.log(`  Grille 54 (collectée): ${grille54.toFixed(2)} €`);
  console.log(`  Grille 59 (déductible): ${grille59.toFixed(2)} €`);
  console.log(`  Grille 71 (solde)   : ${grille71.toFixed(2)} € ${grille71 >= 0 ? '(à payer)' : '(crédit)'}`);
  console.log('─────────────────────────────────────────────\n');
  console.log('💡  Pour supprimer ces données : npm run seed -- --clear\n');
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
