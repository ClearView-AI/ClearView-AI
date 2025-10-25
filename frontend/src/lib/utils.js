import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercentage(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function getRiskColor(risk) {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'text-danger';
    case 'warning':
      return 'text-warning';
    case 'safe':
      return 'text-success';
    default:
      return 'text-gray-400';
  }
}

export function getRiskBadgeClass(risk) {
  switch (risk?.toLowerCase()) {
    case 'critical':
      return 'badge-critical';
    case 'warning':
      return 'badge-warning';
    case 'safe':
      return 'badge-safe';
    default:
      return 'badge';
  }
}

