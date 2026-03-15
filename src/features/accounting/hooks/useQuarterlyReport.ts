import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/stores/garageStore';
import type {
  QuarterlyReport,
  QuarterlyReportInsert,
  QuarterlyReportUpdate,
} from '@/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUARTERLY_REPORTS_KEY = ['quarterly_reports'] as const;

function reportKey(year: number, quarter: number) {
  return [...QUARTERLY_REPORTS_KEY, year, quarter] as const;
}

// ─── Fetch all quarterly reports for the current garage ──

export function useQuarterlyReports() {
  return useQuery({
    queryKey: QUARTERLY_REPORTS_KEY,
    queryFn: async (): Promise<QuarterlyReport[]> => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuarterlyReport[];
    },
  });
}

// ─── Fetch a specific quarterly report ───────────────

export function useQuarterlyReport(year: number, quarter: number) {
  return useQuery({
    queryKey: reportKey(year, quarter),
    queryFn: async (): Promise<QuarterlyReport | null> => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .eq('year', year)
        .eq('quarter', quarter)
        .maybeSingle();
      if (error) throw error;
      return data as QuarterlyReport | null;
    },
  });
}

// ─── Upsert a quarterly report ────────────────────────

export function useUpsertQuarterlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<QuarterlyReportInsert, 'garage_id'>,
    ): Promise<QuarterlyReport> => {
      const garage = useGarageStore.getState().currentGarage;
      if (!garage) throw new Error('Aucun garage sélectionné');

      const { data, error } = await supabase
        .from('quarterly_reports')
        .upsert({ ...payload, garage_id: garage.id } as unknown as Record<string, unknown>, {
          onConflict: 'garage_id,year,quarter',
        })
        .select()
        .single();

      if (error) throw error;
      return data as QuarterlyReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUARTERLY_REPORTS_KEY });
      queryClient.invalidateQueries({ queryKey: reportKey(data.year, data.quarter) });
    },
  });
}

// ─── Update report status ─────────────────────────────

export function useUpdateQuarterlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: QuarterlyReportUpdate;
    }): Promise<QuarterlyReport> => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as QuarterlyReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUARTERLY_REPORTS_KEY });
      queryClient.invalidateQueries({ queryKey: reportKey(data.year, data.quarter) });
    },
  });
}
