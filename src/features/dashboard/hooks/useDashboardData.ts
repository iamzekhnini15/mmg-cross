import { useMemo } from 'react';
import { useVehicles } from '@/features/vehicles/hooks/useVehicles';
import { useAllExpenses, buildExpenseMap } from './useAllExpenses';
import { useAllSales } from './useAllSales';
import { useVehicleThumbnails } from './useVehicleThumbnails';
import { VEHICLE_STATUS_ORDER, STATUS_LABELS } from '@/lib/constants';
import type { Vehicle } from '@/types/database';
import type { Sale } from '@/types/database';
import type { VehicleStatus } from '@/lib/constants';

export interface KanbanVehicle {
  vehicle: Vehicle;
  totalExpenses: number;
  costPrice: number;
  margin: number | null;
  thumbnailUrl: string | null;
}

export interface KanbanColumn {
  status: VehicleStatus;
  label: string;
  vehicles: KanbanVehicle[];
  count: number;
}

export function useDashboardData() {
  const vehiclesQuery = useVehicles();
  const expensesQuery = useAllExpenses();
  const salesQuery = useAllSales();
  const thumbnailsQuery = useVehicleThumbnails();

  const columns = useMemo((): KanbanColumn[] => {
    const vehicles = vehiclesQuery.data ?? [];
    const expenseMap = buildExpenseMap(expensesQuery.data ?? []);
    const saleMap = new Map<string, Sale>((salesQuery.data ?? []).map((s) => [s.vehicle_id, s]));
    const thumbnails = thumbnailsQuery.data ?? new Map<string, string>();

    const grouped = new Map<VehicleStatus, KanbanVehicle[]>();
    for (const status of VEHICLE_STATUS_ORDER) {
      grouped.set(status, []);
    }

    for (const vehicle of vehicles) {
      const status = vehicle.status as VehicleStatus;
      const totalExpenses = expenseMap.get(vehicle.id) ?? 0;
      const costPrice = Number(vehicle.purchase_price) + totalExpenses;
      const sale = saleMap.get(vehicle.id);

      const kanbanVehicle: KanbanVehicle = {
        vehicle,
        totalExpenses,
        costPrice,
        margin: sale ? Number(sale.sale_price) - costPrice : null,
        thumbnailUrl: thumbnails.get(vehicle.id) ?? null,
      };

      const list = grouped.get(status);
      if (list) {
        list.push(kanbanVehicle);
      }
    }

    return VEHICLE_STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      vehicles: grouped.get(status) ?? [],
      count: (grouped.get(status) ?? []).length,
    }));
  }, [vehiclesQuery.data, expensesQuery.data, salesQuery.data, thumbnailsQuery.data]);

  return {
    columns,
    isLoading: vehiclesQuery.isLoading || expensesQuery.isLoading,
    isRefetching: vehiclesQuery.isRefetching,
    error: vehiclesQuery.error || expensesQuery.error,
    refetch: () => {
      vehiclesQuery.refetch();
      expensesQuery.refetch();
      salesQuery.refetch();
      thumbnailsQuery.refetch();
    },
  };
}
