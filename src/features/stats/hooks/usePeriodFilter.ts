import { useState } from 'react';
import type { PeriodFilter, PeriodType } from '../types';

function computePeriod(type: PeriodType): PeriodFilter {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  switch (type) {
    case 'month': {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      const label = start.toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' });
      return {
        type,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
    }
    case 'quarter': {
      const q = Math.floor(m / 3);
      const start = new Date(y, q * 3, 1);
      const end = new Date(y, q * 3 + 3, 0);
      return {
        type,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        label: `T${q + 1} ${y}`,
      };
    }
    case 'year': {
      return {
        type,
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`,
        label: String(y),
      };
    }
    case 'all': {
      return {
        type,
        startDate: '2000-01-01',
        endDate: '2099-12-31',
        label: 'Tout',
      };
    }
  }
}

export function usePeriodFilter() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(() => computePeriod('all'));

  const setPeriodType = (type: PeriodType) => {
    setPeriodFilter(computePeriod(type));
  };

  return { periodFilter, setPeriodType };
}
