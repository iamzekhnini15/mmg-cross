// ─── Vehicle Statuses ────────────────────────────────

export const VEHICLE_STATUSES = {
  PURCHASED: 'purchased',
  TECHNICAL_CONTROL: 'technical_control',
  BODYWORK: 'bodywork',
  MECHANIC: 'mechanic',
  CLEANING: 'cleaning',
  READY_FOR_SALE: 'ready_for_sale',
  SOLD: 'sold',
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[keyof typeof VEHICLE_STATUSES];

export const VEHICLE_STATUS_ORDER: VehicleStatus[] = [
  VEHICLE_STATUSES.PURCHASED,
  VEHICLE_STATUSES.TECHNICAL_CONTROL,
  VEHICLE_STATUSES.BODYWORK,
  VEHICLE_STATUSES.MECHANIC,
  VEHICLE_STATUSES.CLEANING,
  VEHICLE_STATUSES.READY_FOR_SALE,
  VEHICLE_STATUSES.SOLD,
];

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  [VEHICLE_STATUSES.PURCHASED]: 'Acheté',
  [VEHICLE_STATUSES.TECHNICAL_CONTROL]: 'Contrôle technique',
  [VEHICLE_STATUSES.BODYWORK]: 'Carrosserie',
  [VEHICLE_STATUSES.MECHANIC]: 'Mécanique',
  [VEHICLE_STATUSES.CLEANING]: 'Nettoyage',
  [VEHICLE_STATUSES.READY_FOR_SALE]: 'Prêt à la vente',
  [VEHICLE_STATUSES.SOLD]: 'Vendu',
};

export const STATUS_COLORS: Record<VehicleStatus, string> = {
  [VEHICLE_STATUSES.PURCHASED]: 'bg-status-purchased',
  [VEHICLE_STATUSES.TECHNICAL_CONTROL]: 'bg-status-technical-control',
  [VEHICLE_STATUSES.BODYWORK]: 'bg-status-bodywork',
  [VEHICLE_STATUSES.MECHANIC]: 'bg-status-mechanic',
  [VEHICLE_STATUSES.CLEANING]: 'bg-status-cleaning',
  [VEHICLE_STATUSES.READY_FOR_SALE]: 'bg-status-ready',
  [VEHICLE_STATUSES.SOLD]: 'bg-status-sold',
};

export const STATUS_TEXT_COLORS: Record<VehicleStatus, string> = {
  [VEHICLE_STATUSES.PURCHASED]: 'text-status-purchased',
  [VEHICLE_STATUSES.TECHNICAL_CONTROL]: 'text-status-technical-control',
  [VEHICLE_STATUSES.BODYWORK]: 'text-status-bodywork',
  [VEHICLE_STATUSES.MECHANIC]: 'text-status-mechanic',
  [VEHICLE_STATUSES.CLEANING]: 'text-status-cleaning',
  [VEHICLE_STATUSES.READY_FOR_SALE]: 'text-status-ready',
  [VEHICLE_STATUSES.SOLD]: 'text-status-sold',
};

// ─── Fuel Types ──────────────────────────────────────

export const FUEL_TYPES = {
  ESSENCE: 'essence',
  DIESEL: 'diesel',
  HYBRID: 'hybrid',
  ELECTRIC: 'electric',
} as const;

export type FuelType = (typeof FUEL_TYPES)[keyof typeof FUEL_TYPES];

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FUEL_TYPES.ESSENCE]: 'Essence',
  [FUEL_TYPES.DIESEL]: 'Diesel',
  [FUEL_TYPES.HYBRID]: 'Hybride',
  [FUEL_TYPES.ELECTRIC]: 'Électrique',
};

// ─── Transmission Types ──────────────────────────────

export const TRANSMISSION_TYPES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
} as const;

export type TransmissionType = (typeof TRANSMISSION_TYPES)[keyof typeof TRANSMISSION_TYPES];

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  [TRANSMISSION_TYPES.MANUAL]: 'Manuelle',
  [TRANSMISSION_TYPES.AUTOMATIC]: 'Automatique',
};

// ─── Expense Categories ──────────────────────────────

export const EXPENSE_CATEGORIES = {
  BODYWORK: 'bodywork',
  MECHANIC: 'mechanic',
  TECHNICAL_CONTROL: 'technical_control',
  CLEANING: 'cleaning',
  ADMINISTRATIVE: 'administrative',
  OTHER: 'other',
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[keyof typeof EXPENSE_CATEGORIES];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [EXPENSE_CATEGORIES.BODYWORK]: 'Carrosserie',
  [EXPENSE_CATEGORIES.MECHANIC]: 'Mécanique',
  [EXPENSE_CATEGORIES.TECHNICAL_CONTROL]: 'Contrôle technique',
  [EXPENSE_CATEGORIES.CLEANING]: 'Nettoyage',
  [EXPENSE_CATEGORIES.ADMINISTRATIVE]: 'Administratif',
  [EXPENSE_CATEGORIES.OTHER]: 'Autre',
};

// ─── Payment Statuses ────────────────────────────────

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUSES.PENDING]: 'À payer',
  [PAYMENT_STATUSES.PAID]: 'Payé',
};

// ─── Client Types ────────────────────────────────────

export const CLIENT_TYPES = {
  PARTICULAR: 'particular',
  PROFESSIONAL: 'professional',
} as const;

export type ClientType = (typeof CLIENT_TYPES)[keyof typeof CLIENT_TYPES];

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  [CLIENT_TYPES.PARTICULAR]: 'Particulier',
  [CLIENT_TYPES.PROFESSIONAL]: 'Professionnel',
};

// ─── Payment Methods ─────────────────────────────────

export const PAYMENT_METHODS = {
  TRANSFER: 'transfer',
  CHECK: 'check',
  CASH: 'cash',
  FINANCING: 'financing',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHODS.TRANSFER]: 'Virement',
  [PAYMENT_METHODS.CHECK]: 'Chèque',
  [PAYMENT_METHODS.CASH]: 'Espèces',
  [PAYMENT_METHODS.FINANCING]: 'Financement',
};

// ─── Warranty Options ────────────────────────────────

export const WARRANTY_OPTIONS = {
  NONE: 'none',
  THREE_MONTHS: '3_months',
  SIX_MONTHS: '6_months',
  ONE_YEAR: '1_year',
} as const;

export type WarrantyOption = (typeof WARRANTY_OPTIONS)[keyof typeof WARRANTY_OPTIONS];

export const WARRANTY_LABELS: Record<WarrantyOption, string> = {
  [WARRANTY_OPTIONS.NONE]: 'Sans garantie',
  [WARRANTY_OPTIONS.THREE_MONTHS]: '3 mois',
  [WARRANTY_OPTIONS.SIX_MONTHS]: '6 mois',
  [WARRANTY_OPTIONS.ONE_YEAR]: '1 an',
};

// ─── Seller Types ────────────────────────────────────

export const SELLER_TYPES = {
  PARTICULAR: 'particular',
  PROFESSIONAL: 'professional',
} as const;

export type SellerType = (typeof SELLER_TYPES)[keyof typeof SELLER_TYPES];

export const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  [SELLER_TYPES.PARTICULAR]: 'Particulier',
  [SELLER_TYPES.PROFESSIONAL]: 'Professionnel',
};

// ─── Media Categories ────────────────────────────────

export const MEDIA_CATEGORIES = {
  EXTERIOR: 'exterior',
  INTERIOR: 'interior',
  MECHANIC: 'mechanic',
  DAMAGES: 'damages',
} as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[keyof typeof MEDIA_CATEGORIES];

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  [MEDIA_CATEGORIES.EXTERIOR]: 'Extérieur',
  [MEDIA_CATEGORIES.INTERIOR]: 'Intérieur',
  [MEDIA_CATEGORIES.MECHANIC]: 'Mécanique',
  [MEDIA_CATEGORIES.DAMAGES]: 'Dommages',
};

// ─── Civilities ──────────────────────────────────────

export const CIVILITIES = {
  MR: 'mr',
  MRS: 'mrs',
  MS: 'ms',
} as const;

export type Civility = (typeof CIVILITIES)[keyof typeof CIVILITIES];

export const CIVILITY_LABELS: Record<Civility, string> = {
  [CIVILITIES.MR]: 'M.',
  [CIVILITIES.MRS]: 'Mme',
  [CIVILITIES.MS]: 'Mlle',
};

// ─── Default VAT Rate ────────────────────────────────

export const DEFAULT_VAT_RATE = 20.0;

// ─── Belgian VAT Rate ────────────────────────────────

export const BELGIAN_VAT_RATE = 21.0;

// ─── VAT Regimes (Belgian used-vehicle dealer) ───────

export const VAT_REGIMES = {
  MARGIN: 'margin',
  NORMAL: 'normal',
} as const;

export type VatRegime = (typeof VAT_REGIMES)[keyof typeof VAT_REGIMES];

export const VAT_REGIME_LABELS: Record<VatRegime, string> = {
  [VAT_REGIMES.MARGIN]: 'Régime de la marge',
  [VAT_REGIMES.NORMAL]: 'Régime normal',
};

// ─── Quarterly Report Statuses ───────────────────────

export const QUARTERLY_REPORT_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
} as const;

export type QuarterlyReportStatus =
  (typeof QUARTERLY_REPORT_STATUSES)[keyof typeof QUARTERLY_REPORT_STATUSES];

export const QUARTERLY_REPORT_STATUS_LABELS: Record<QuarterlyReportStatus, string> = {
  [QUARTERLY_REPORT_STATUSES.DRAFT]: 'En cours',
  [QUARTERLY_REPORT_STATUSES.SUBMITTED]: 'Transmis au comptable',
};

// ─── Garage Roles ───────────────────────────────────

export const GARAGE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type GarageRole = (typeof GARAGE_ROLES)[keyof typeof GARAGE_ROLES];

export const GARAGE_ROLE_LABELS: Record<GarageRole, string> = {
  [GARAGE_ROLES.OWNER]: 'Propriétaire',
  [GARAGE_ROLES.ADMIN]: 'Administrateur',
  [GARAGE_ROLES.MEMBER]: 'Membre',
};

// ─── Member Statuses ────────────────────────────────

export const MEMBER_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
} as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[keyof typeof MEMBER_STATUSES];

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MEMBER_STATUSES.PENDING]: 'En attente',
  [MEMBER_STATUSES.ACTIVE]: 'Actif',
  [MEMBER_STATUSES.REJECTED]: 'Refusé',
};
