export function formatPrice(price: number, decimals: 0 | 2 = 0): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('fr-BE').format(km) + ' km';
}

export function formatDate(dateStr: string, style: 'long' | 'short' = 'long'): string {
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: style,
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDays(days: number): string {
  if (days <= 1) return `${days} jour`;
  return `${days} jours`;
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatMonthShort(dateStr: string): string {
  const d = new Date(dateStr + '-01');
  return d.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
}

export function formatCompactPrice(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return String(Math.round(value));
}
