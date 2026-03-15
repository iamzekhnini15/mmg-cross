// ─── Mindee v2 API types ────────────────────────────

export interface MindeeEnqueueResponse {
  job: {
    id: string;
    polling_url: string;
    status: string;
  };
}

export interface MindeeJobResponse {
  job: {
    id: string;
    status: 'Processing' | 'Processed' | 'Failed';
    result_url?: string;
    inference_id?: string;
  };
}

export interface MindeeResultResponse {
  inference: {
    result: {
      supplier_name: { value: string | null };
      invoice_number: { value: string | null };
      date: { value: string | null };
      total_net: { value: number | null };
      total_amount: { value: number | null };
      total_tax: { value: number | null };
      taxes: Array<{
        amount: number | null;
        rate: number | null;
      }>;
    };
  };
}

// ─── Mapped result for the expense form ─────────────

export interface InvoiceScanResult {
  provider?: string;
  invoice_ref?: string;
  expense_date?: string;
  amount_ht?: number;
  amount_ttc?: number;
  vat_rate?: number;
}
