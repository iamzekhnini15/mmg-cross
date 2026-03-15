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
