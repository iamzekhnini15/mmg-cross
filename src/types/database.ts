export interface Database {
  public: {
    Tables: {
      garages: {
        Row: Garage;
        Insert: GarageInsert;
        Update: GarageUpdate;
        Relationships: [];
      };
      garage_members: {
        Row: GarageMember;
        Insert: GarageMemberInsert;
        Update: GarageMemberUpdate;
        Relationships: [];
      };
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
        Relationships: [];
      };
      vehicle_status_history: {
        Row: VehicleStatusHistory;
        Insert: VehicleStatusHistoryInsert;
        Update: VehicleStatusHistoryUpdate;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
        Relationships: [];
      };
      media: {
        Row: Media;
        Insert: MediaInsert;
        Update: MediaUpdate;
        Relationships: [];
      };
      sales: {
        Row: Sale;
        Insert: SaleInsert;
        Update: SaleUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Garages ─────────────────────────────────────────

export interface Garage {
  id: string;
  name: string;
  address: string | null;
  siret: string | null;
  phone: string | null;
  email: string | null;
  invite_code: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GarageInsert {
  id?: string;
  name: string;
  address?: string | null;
  siret?: string | null;
  phone?: string | null;
  email?: string | null;
  invite_code?: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GarageUpdate {
  id?: string;
  name?: string;
  address?: string | null;
  siret?: string | null;
  phone?: string | null;
  email?: string | null;
  invite_code?: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ─── Garage Members ─────────────────────────────────

export interface GarageMember {
  id: string;
  garage_id: string;
  user_id: string;
  user_email: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GarageMemberInsert {
  id?: string;
  garage_id: string;
  user_id: string;
  user_email?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GarageMemberUpdate {
  id?: string;
  garage_id?: string;
  user_id?: string;
  user_email?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Vehicles ────────────────────────────────────────

export interface Vehicle {
  id: string;
  garage_id: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  vin: string | null;
  license_plate: string | null;
  fuel_type: string;
  transmission: string;
  color: string | null;
  doors: number | null;
  purchase_price: number;
  purchase_date: string;
  seller_type: string;
  seller_name: string | null;
  seller_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsert {
  id?: string;
  garage_id?: string;
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  mileage: number;
  vin?: string | null;
  license_plate?: string | null;
  fuel_type: string;
  transmission: string;
  color?: string | null;
  doors?: number | null;
  purchase_price: number;
  purchase_date: string;
  seller_type: string;
  seller_name?: string | null;
  seller_phone?: string | null;
  notes?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleUpdate {
  id?: string;
  garage_id?: string;
  brand?: string;
  model?: string;
  version?: string | null;
  year?: number;
  mileage?: number;
  vin?: string | null;
  license_plate?: string | null;
  fuel_type?: string;
  transmission?: string;
  color?: string | null;
  doors?: number | null;
  purchase_price?: number;
  purchase_date?: string;
  seller_type?: string;
  seller_name?: string | null;
  seller_phone?: string | null;
  notes?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Vehicle Status History ──────────────────────────

export interface VehicleStatusHistory {
  id: string;
  vehicle_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  notes: string | null;
}

export interface VehicleStatusHistoryInsert {
  id?: string;
  vehicle_id: string;
  from_status?: string | null;
  to_status: string;
  changed_at?: string;
  notes?: string | null;
}

export interface VehicleStatusHistoryUpdate {
  id?: string;
  vehicle_id?: string;
  from_status?: string | null;
  to_status?: string;
  changed_at?: string;
  notes?: string | null;
}

// ─── Expenses ────────────────────────────────────────

export interface Expense {
  id: string;
  vehicle_id: string;
  category: string;
  provider: string | null;
  amount_ht: number;
  vat_rate: number;
  amount_ttc: number;
  expense_date: string;
  payment_status: string;
  invoice_ref: string | null;
  notes: string | null;
  created_at: string;
}

export interface ExpenseInsert {
  id?: string;
  vehicle_id: string;
  category: string;
  provider?: string | null;
  amount_ht: number;
  vat_rate?: number;
  amount_ttc: number;
  expense_date: string;
  payment_status?: string;
  invoice_ref?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface ExpenseUpdate {
  id?: string;
  vehicle_id?: string;
  category?: string;
  provider?: string | null;
  amount_ht?: number;
  vat_rate?: number;
  amount_ttc?: number;
  expense_date?: string;
  payment_status?: string;
  invoice_ref?: string | null;
  notes?: string | null;
  created_at?: string;
}

// ─── Media ───────────────────────────────────────────

export interface Media {
  id: string;
  vehicle_id: string;
  type: 'photo' | 'document';
  category: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

export interface MediaInsert {
  id?: string;
  vehicle_id: string;
  type: 'photo' | 'document';
  category?: string | null;
  file_path: string;
  file_name: string;
  file_size?: number | null;
  created_at?: string;
}

export interface MediaUpdate {
  id?: string;
  vehicle_id?: string;
  type?: 'photo' | 'document';
  category?: string | null;
  file_path?: string;
  file_name?: string;
  file_size?: number | null;
  created_at?: string;
}

// ─── Sales ───────────────────────────────────────────

export interface Sale {
  id: string;
  vehicle_id: string;
  invoice_number: string;
  sale_date: string;
  sale_price: number;
  payment_method: string;
  mileage_at_sale: number | null;
  warranty: string | null;
  client_civility: string | null;
  client_firstname: string;
  client_lastname: string;
  client_address: string | null;
  client_zip: string | null;
  client_city: string | null;
  client_country: string;
  client_phone: string | null;
  client_email: string | null;
  client_type: string;
  company_name: string | null;
  siret: string | null;
  vat_number: string | null;
  invoice_pdf_path: string | null;
  created_at: string;
}

export interface SaleInsert {
  id?: string;
  vehicle_id: string;
  invoice_number: string;
  sale_date: string;
  sale_price: number;
  payment_method: string;
  mileage_at_sale?: number | null;
  warranty?: string | null;
  client_civility?: string | null;
  client_firstname: string;
  client_lastname: string;
  client_address?: string | null;
  client_zip?: string | null;
  client_city?: string | null;
  client_country?: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_type?: string;
  company_name?: string | null;
  siret?: string | null;
  vat_number?: string | null;
  invoice_pdf_path?: string | null;
  created_at?: string;
}

export interface SaleUpdate {
  id?: string;
  vehicle_id?: string;
  invoice_number?: string;
  sale_date?: string;
  sale_price?: number;
  payment_method?: string;
  mileage_at_sale?: number | null;
  warranty?: string | null;
  client_civility?: string | null;
  client_firstname?: string;
  client_lastname?: string;
  client_address?: string | null;
  client_zip?: string | null;
  client_city?: string | null;
  client_country?: string;
  client_phone?: string | null;
  client_email?: string | null;
  client_type?: string;
  company_name?: string | null;
  siret?: string | null;
  vat_number?: string | null;
  invoice_pdf_path?: string | null;
  created_at?: string;
}
