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

// ─── Data fictive ─────────────────────────────────────────────────────────────

const VEHICLES = [
  // ── purchased (2) ──
  {
    brand: 'Peugeot', model: '308', version: 'GT Line 1.5 BlueHDi 130',
    year: 2020, mileage: 45_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Gris Platinium', doors: 5,
    purchase_price: 12_500, purchase_date: '2026-01-15',
    seller_type: 'particular', seller_name: 'Jean Dupont', seller_phone: '06 12 34 56 78',
    notes: '[SEED] Bon état général, carnet d\'entretien complet.',
    status: 'purchased',
  },
  {
    brand: 'Renault', model: 'Clio', version: 'Intens TCe 90',
    year: 2021, mileage: 28_000, fuel_type: 'essence', transmission: 'manual',
    color: 'Rouge Flamme', doors: 5,
    purchase_price: 9_800, purchase_date: '2026-01-22',
    seller_type: 'professional', seller_name: 'Renault Lyon Confluence',
    notes: '[SEED] Véhicule de reprise, premier propriétaire.',
    status: 'purchased',
  },
  // ── technical_control (2) ──
  {
    brand: 'Volkswagen', model: 'Golf', version: 'TDI 115 Confortline',
    year: 2019, mileage: 72_000, fuel_type: 'diesel', transmission: 'manual',
    color: 'Blanc Candy', doors: 5,
    purchase_price: 11_000, purchase_date: '2026-01-10',
    seller_type: 'particular', seller_name: 'Marc Lefebvre',
    notes: '[SEED] Contrôle technique en cours.',
    status: 'technical_control',
  },
  {
    brand: 'Toyota', model: 'Yaris', version: 'Hybride 116h Dynamic',
    year: 2022, mileage: 15_000, fuel_type: 'hybrid', transmission: 'automatic',
    color: 'Noir Minuit', doors: 5,
    purchase_price: 14_200, purchase_date: '2026-01-20',
    seller_type: 'professional', seller_name: 'Toyota Grenoble Sud',
    notes: '[SEED] Très faible kilométrage.',
    status: 'technical_control',
  },
  // ── bodywork (2) ──
  {
    brand: 'BMW', model: 'Série 3', version: '318d 150 Business',
    year: 2018, mileage: 98_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Bleu Estoril', doors: 4,
    purchase_price: 15_800, purchase_date: '2026-01-05',
    seller_type: 'particular', seller_name: 'Sophie Marchand',
    notes: '[SEED] Carrosserie abîmée côté passager, en réparation.',
    status: 'bodywork',
  },
  {
    brand: 'Citroën', model: 'C3', version: 'Feel Pack PureTech 83',
    year: 2020, mileage: 41_000, fuel_type: 'essence', transmission: 'manual',
    color: 'Orange Física', doors: 5,
    purchase_price: 8_500, purchase_date: '2026-01-18',
    seller_type: 'particular', seller_name: 'Pierre Morel',
    notes: '[SEED] Légères rayures à reprendre.',
    status: 'bodywork',
  },
  // ── mechanic (1) ──
  {
    brand: 'Ford', model: 'Focus', version: 'Active 1.0 EcoBoost 125',
    year: 2021, mileage: 33_000, fuel_type: 'essence', transmission: 'manual',
    color: 'Vert Boyard', doors: 5,
    purchase_price: 13_500, purchase_date: '2026-01-12',
    seller_type: 'professional', seller_name: 'Ford Occasions Certifiées Bordeaux',
    notes: '[SEED] Courroie de distribution à changer.',
    status: 'mechanic',
  },
  // ── cleaning (1) ──
  {
    brand: 'Audi', model: 'A3', version: 'Sportback 35 TFSI 150',
    year: 2020, mileage: 55_000, fuel_type: 'essence', transmission: 'automatic',
    color: 'Gris Manhattan', doors: 5,
    purchase_price: 18_500, purchase_date: '2026-01-08',
    seller_type: 'particular', seller_name: 'Isabelle Fontaine',
    notes: '[SEED] Préparation esthétique en cours.',
    status: 'cleaning',
  },
  // ── ready_for_sale (1) ──
  {
    brand: 'Mercedes', model: 'Classe A', version: '200d 150 AMG Line',
    year: 2021, mileage: 38_000, fuel_type: 'diesel', transmission: 'automatic',
    color: 'Blanc Polaire', doors: 5,
    purchase_price: 22_000, purchase_date: '2025-12-15',
    seller_type: 'professional', seller_name: 'Mercedes-Benz Paris Est',
    notes: '[SEED] Prêt à la vente, prix demandé 26 900€.',
    status: 'ready_for_sale',
  },
  // ── sold (1) ──
  {
    brand: 'Peugeot', model: '2008', version: 'GT 1.2 PureTech 130 EAT8',
    year: 2019, mileage: 62_000, fuel_type: 'essence', transmission: 'automatic',
    color: 'Rouge Ultimate', doors: 5,
    purchase_price: 13_200, purchase_date: '2025-12-01',
    seller_type: 'particular', seller_name: 'Antoine Bernard',
    notes: '[SEED] Vendu avec 3 mois de garantie.',
    status: 'sold',
  },
] as const;

// Progression des statuts pour chaque véhicule (index => étapes)
const STATUS_HISTORY: Record<number, { from: string | null; to: string; date: string }[]> = {
  0: [{ from: null, to: 'purchased', date: '2026-01-15' }],
  1: [{ from: null, to: 'purchased', date: '2026-01-22' }],
  2: [
    { from: null, to: 'purchased', date: '2026-01-10' },
    { from: 'purchased', to: 'technical_control', date: '2026-01-14' },
  ],
  3: [
    { from: null, to: 'purchased', date: '2026-01-20' },
    { from: 'purchased', to: 'technical_control', date: '2026-01-23' },
  ],
  4: [
    { from: null, to: 'purchased', date: '2026-01-05' },
    { from: 'purchased', to: 'technical_control', date: '2026-01-07' },
    { from: 'technical_control', to: 'bodywork', date: '2026-01-10' },
  ],
  5: [
    { from: null, to: 'purchased', date: '2026-01-18' },
    { from: 'purchased', to: 'bodywork', date: '2026-01-21' },
  ],
  6: [
    { from: null, to: 'purchased', date: '2026-01-12' },
    { from: 'purchased', to: 'technical_control', date: '2026-01-15' },
    { from: 'technical_control', to: 'mechanic', date: '2026-01-19' },
  ],
  7: [
    { from: null, to: 'purchased', date: '2026-01-08' },
    { from: 'purchased', to: 'technical_control', date: '2026-01-10' },
    { from: 'technical_control', to: 'bodywork', date: '2026-01-14' },
    { from: 'bodywork', to: 'mechanic', date: '2026-01-22' },
    { from: 'mechanic', to: 'cleaning', date: '2026-02-01' },
  ],
  8: [
    { from: null, to: 'purchased', date: '2025-12-15' },
    { from: 'purchased', to: 'technical_control', date: '2025-12-18' },
    { from: 'technical_control', to: 'bodywork', date: '2025-12-22' },
    { from: 'bodywork', to: 'mechanic', date: '2026-01-05' },
    { from: 'mechanic', to: 'cleaning', date: '2026-01-18' },
    { from: 'cleaning', to: 'ready_for_sale', date: '2026-01-25' },
  ],
  9: [
    { from: null, to: 'purchased', date: '2025-12-01' },
    { from: 'purchased', to: 'technical_control', date: '2025-12-04' },
    { from: 'technical_control', to: 'bodywork', date: '2025-12-08' },
    { from: 'bodywork', to: 'mechanic', date: '2025-12-18' },
    { from: 'mechanic', to: 'cleaning', date: '2025-12-28' },
    { from: 'cleaning', to: 'ready_for_sale', date: '2026-01-05' },
    { from: 'ready_for_sale', to: 'sold', date: '2026-01-20' },
  ],
};

// Dépenses par véhicule (index => dépenses)
const EXPENSES: Record<number, Array<{
  category: string;
  provider?: string;
  amount_ht: number;
  vat_rate: number;
  amount_ttc: number;
  expense_date: string;
  payment_status: string;
  invoice_ref?: string;
  notes?: string;
}>> = {
  // Peugeot 308 — pas encore de dépenses
  0: [],
  // Renault Clio — pas encore de dépenses
  1: [],
  // VW Golf — contrôle technique
  2: [
    {
      category: 'technical_control',
      provider: 'DEKRA Lyon',
      amount_ht: 75.00, vat_rate: 20, amount_ttc: 90.00,
      expense_date: '2026-01-16', payment_status: 'paid',
      invoice_ref: 'DK-2026-4821',
    },
    {
      category: 'administrative',
      provider: 'Préfecture du Rhône',
      amount_ht: 79.17, vat_rate: 20, amount_ttc: 95.00,
      expense_date: '2026-01-17', payment_status: 'paid',
      notes: 'Carte grise',
    },
  ],
  // Toyota Yaris — contrôle technique
  3: [
    {
      category: 'technical_control',
      provider: 'Autovision Grenoble',
      amount_ht: 62.50, vat_rate: 20, amount_ttc: 75.00,
      expense_date: '2026-01-24', payment_status: 'paid',
      invoice_ref: 'AV-2026-1147',
    },
  ],
  // BMW Série 3 — carrosserie + admin
  4: [
    {
      category: 'bodywork',
      provider: 'Carrosserie Michelin & Fils',
      amount_ht: 975.00, vat_rate: 20, amount_ttc: 1_170.00,
      expense_date: '2026-01-13', payment_status: 'paid',
      invoice_ref: 'CMF-2026-298',
      notes: 'Remplacement aile avant droite + peinture',
    },
    {
      category: 'administrative',
      provider: 'Préfecture du Rhône',
      amount_ht: 79.17, vat_rate: 20, amount_ttc: 95.00,
      expense_date: '2026-01-09', payment_status: 'paid',
      notes: 'Carte grise',
    },
    {
      category: 'technical_control',
      provider: 'DEKRA Lyon',
      amount_ht: 75.00, vat_rate: 20, amount_ttc: 90.00,
      expense_date: '2026-01-11', payment_status: 'paid',
    },
  ],
  // Citroën C3 — petite carrosserie
  5: [
    {
      category: 'bodywork',
      provider: 'FIX AUTO Villeurbanne',
      amount_ht: 375.00, vat_rate: 20, amount_ttc: 450.00,
      expense_date: '2026-01-23', payment_status: 'pending',
      notes: 'Retouches peinture coffre + portière',
    },
  ],
  // Ford Focus — 2 dépenses méca
  6: [
    {
      category: 'mechanic',
      provider: 'Garage Dupont Auto',
      amount_ht: 583.33, vat_rate: 20, amount_ttc: 700.00,
      expense_date: '2026-01-22', payment_status: 'paid',
      invoice_ref: 'GDA-2026-561',
      notes: 'Courroie de distribution + pompe à eau',
    },
    {
      category: 'mechanic',
      provider: 'Garage Dupont Auto',
      amount_ht: 200.00, vat_rate: 20, amount_ttc: 240.00,
      expense_date: '2026-01-25', payment_status: 'pending',
      notes: 'Plaquettes freins AV + disques',
    },
  ],
  // Audi A3 — carrosserie + nettoyage
  7: [
    {
      category: 'bodywork',
      provider: 'Carrosserie Rhône Express',
      amount_ht: 625.00, vat_rate: 20, amount_ttc: 750.00,
      expense_date: '2026-01-17', payment_status: 'paid',
      invoice_ref: 'CRE-2026-089',
    },
    {
      category: 'technical_control',
      provider: 'DEKRA Lyon',
      amount_ht: 75.00, vat_rate: 20, amount_ttc: 90.00,
      expense_date: '2026-01-13', payment_status: 'paid',
    },
    {
      category: 'mechanic',
      provider: 'Audi Service Lyon',
      amount_ht: 416.67, vat_rate: 20, amount_ttc: 500.00,
      expense_date: '2026-01-25', payment_status: 'paid',
      notes: 'Révision complète + vidange',
    },
    {
      category: 'cleaning',
      provider: 'Shine Auto Détailing',
      amount_ht: 125.00, vat_rate: 20, amount_ttc: 150.00,
      expense_date: '2026-02-03', payment_status: 'pending',
      notes: 'Polissage + lustrage intégral',
    },
  ],
  // Mercedes Classe A — préparation complète
  8: [
    {
      category: 'technical_control',
      provider: 'Autovision Paris Est',
      amount_ht: 75.00, vat_rate: 20, amount_ttc: 90.00,
      expense_date: '2025-12-19', payment_status: 'paid',
    },
    {
      category: 'bodywork',
      provider: 'Mercedes-Benz Bodywork',
      amount_ht: 1_166.67, vat_rate: 20, amount_ttc: 1_400.00,
      expense_date: '2025-12-24', payment_status: 'paid',
      invoice_ref: 'MBB-2025-1422',
      notes: 'Rénovation pare-chocs avant + peinture capot',
    },
    {
      category: 'mechanic',
      provider: 'Mercedes-Benz Service Paris',
      amount_ht: 458.33, vat_rate: 20, amount_ttc: 550.00,
      expense_date: '2026-01-07', payment_status: 'paid',
      notes: 'Révision + remplacement filtres',
    },
    {
      category: 'cleaning',
      provider: 'Premium Auto Détailing',
      amount_ht: 150.00, vat_rate: 20, amount_ttc: 180.00,
      expense_date: '2026-01-22', payment_status: 'paid',
    },
    {
      category: 'administrative',
      provider: 'Préfecture de Paris',
      amount_ht: 79.17, vat_rate: 20, amount_ttc: 95.00,
      expense_date: '2025-12-17', payment_status: 'paid',
      notes: 'Carte grise',
    },
  ],
  // Peugeot 2008 (vendu) — préparation complète
  9: [
    {
      category: 'technical_control',
      provider: 'DEKRA Bordeaux',
      amount_ht: 62.50, vat_rate: 20, amount_ttc: 75.00,
      expense_date: '2025-12-05', payment_status: 'paid',
    },
    {
      category: 'bodywork',
      provider: 'Carrosserie Atlantique',
      amount_ht: 583.33, vat_rate: 20, amount_ttc: 700.00,
      expense_date: '2025-12-10', payment_status: 'paid',
      invoice_ref: 'CA-2025-872',
      notes: 'Réparation bosse aile AR gauche + peinture',
    },
    {
      category: 'mechanic',
      provider: 'Garage Central Bordeaux',
      amount_ht: 291.67, vat_rate: 20, amount_ttc: 350.00,
      expense_date: '2025-12-20', payment_status: 'paid',
      notes: 'Vidange + pneumatiques AV',
    },
    {
      category: 'cleaning',
      provider: 'Auto Brillant',
      amount_ht: 104.17, vat_rate: 20, amount_ttc: 125.00,
      expense_date: '2026-01-03', payment_status: 'paid',
    },
    {
      category: 'administrative',
      provider: 'Préfecture de la Gironde',
      amount_ht: 79.17, vat_rate: 20, amount_ttc: 95.00,
      expense_date: '2025-12-03', payment_status: 'paid',
      notes: 'Carte grise',
    },
  ],
};

// Vente du Peugeot 2008 (index 9)
const SALE = {
  invoice_number: 'FAC-2026-001',
  sale_date: '2026-01-20',
  sale_price: 17_500,
  payment_method: 'transfer',
  mileage_at_sale: 62_450,
  warranty: '3_months',
  client_civility: 'mr',
  client_firstname: 'Thomas',
  client_lastname: 'Martin',
  client_address: '14 rue de la Paix',
  client_zip: '75001',
  client_city: 'Paris',
  client_country: 'France',
  client_phone: '06 23 45 67 89',
  client_email: 'thomas.martin@email.fr',
  client_type: 'particular',
};

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
  console.log('\n🚀  MMG Seed Script\n');

  // 1. Authentification
  console.log('🔐  Connexion...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL!,
    password: PASSWORD!,
  });
  if (authError || !authData.user) fail('Authentification', authError?.message);
  const userId = authData.user!.id;
  ok(`Connecté en tant que ${authData.user!.email}`);

  // 2. Suppression des données de seed existantes (--clear)
  if (CLEAR) {
    console.log('\n🗑️   Suppression des données [SEED]...');
    // Find garage created by this user with seed notes
    const { data: garages } = await supabase
      .from('garages')
      .select('id')
      .eq('created_by', userId);

    if (garages && garages.length > 0) {
      for (const g of garages) {
        // Deleting garage cascades to vehicles, members, etc.
        const { error } = await supabase
          .from('garages')
          .delete()
          .eq('id', g.id);
        if (error) fail('Suppression garage', error.message);
      }
    }
    ok('Données [SEED] supprimées');
    console.log('\n✅  Nettoyage terminé.\n');
    return;
  }

  // 3. Création du garage
  console.log('\n🏢  Création du garage...');
  const { data: garageData, error: garageError } = await supabase
    .from('garages')
    .insert({
      name: 'Garage MMG Lyon',
      address: '42 avenue Jean Jaurès, 69007 Lyon',
      siret: '123 456 789 00012',
      phone: '04 78 12 34 56',
      email: 'contact@mmg-lyon.fr',
      created_by: userId,
    })
    .select()
    .single();
  if (garageError || !garageData) fail('Création garage', garageError?.message);
  const garageId = garageData!.id;
  ok(`Garage créé : ${garageData!.name} (code: ${garageData!.invite_code})`);

  // 4. Création du membership owner
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
  ok(`Membre owner ajouté`);

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
    ok(`${v.brand} ${v.model} ${v.version} [${v.status}]`);
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
    }));
    const { error } = await supabase.from('vehicle_status_history').insert(rows);
    if (error) fail(`Historique véhicule ${Number(i) + 1}`, error.message);
  }
  ok(`${Object.values(STATUS_HISTORY).flat().length} entrées d'historique créées`);

  // 7. Dépenses
  console.log('\n💶  Insertion des dépenses...');
  let totalExpenses = 0;
  for (const [i, expenses] of Object.entries(EXPENSES)) {
    if (expenses.length === 0) continue;
    const vehicleId = vehicleIds[Number(i)];
    const rows = expenses.map((e) => ({ ...e, vehicle_id: vehicleId }));
    const { error } = await supabase.from('expenses').insert(rows);
    const v = VEHICLES[Number(i)];
    if (error) fail(`Dépenses véhicule ${v.brand} ${v.model}`, error.message);
    totalExpenses += expenses.length;
    ok(`${v.brand} ${v.model} — ${expenses.length} dépense(s)`);
  }
  ok(`${totalExpenses} dépenses créées au total`);

  // 8. Vente du Peugeot 2008 (index 9)
  console.log('\n💰  Insertion de la vente...');
  const soldVehicleId = vehicleIds[9];
  const { error: saleError } = await supabase
    .from('sales')
    .insert({ ...SALE, vehicle_id: soldVehicleId });
  if (saleError) fail('Vente', saleError.message);
  ok(`Vente FAC-2026-001 — Peugeot 2008 → ${SALE.sale_price.toLocaleString('fr-FR')} €`);

  // 9. Résumé
  const totalExpensesAmount = Object.values(EXPENSES)
    .flat()
    .reduce((sum, e) => sum + e.amount_ttc, 0);
  const costPrice = 13_200 + EXPENSES[9].reduce((sum, e) => sum + e.amount_ttc, 0);
  const margin = SALE.sale_price - costPrice;

  console.log('\n─────────────────────────────────────────────');
  console.log('✅  Seed terminé avec succès !');
  console.log('─────────────────────────────────────────────');
  console.log(`  Véhicules créés     : ${VEHICLES.length}`);
  console.log(`  Dépenses créées     : ${totalExpenses} (${totalExpensesAmount.toLocaleString('fr-FR')} € TTC)`);
  console.log(`  Ventes créées       : 1`);
  console.log(`  Marge Peugeot 2008  : ${margin.toLocaleString('fr-FR')} €`);
  console.log('─────────────────────────────────────────────\n');
  console.log('💡  Pour supprimer ces données : npm run seed -- --clear\n');
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
