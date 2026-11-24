import { APP_CONFIG } from './config.js';

export function formatINR(amount) {
  const num = Number(amount || 0);
  if (Number.isNaN(num)) return `${APP_CONFIG.currencySymbol}0`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function debounce(fn, wait = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function formatDate(input) {
  if (!input) return '—';
  const date = input?.toDate ? input.toDate() : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getRootPrefix() {
  return window.location.pathname.includes('/admin/') ? '../' : '';
}

export function resolveAssetPath(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('/')) {
    return path;
  }
  return `${getRootPrefix()}${path}`;
}

export function getStockStatus(quantity) {
  const qty = Number(quantity ?? 0);
  if (qty <= 0) {
    return { code: 'out', label: 'OUT OF STOCK', className: 'text-crimson border-crimson/30 bg-crimson/5' };
  }
  if (qty <= 5) {
    return { code: 'low', label: 'LOW STOCK', className: 'text-amber-800 border-amber-700/30 bg-amber-50' };
  }
  return { code: 'in', label: 'IN STOCK', className: 'text-brand border-brand/30 bg-brand/5' };
}
