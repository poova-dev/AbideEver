import { fetchProducts } from './products.js';

const RECENT_SEARCHES_KEY = 'abideever_recent_searches_v1';

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term) {
  const cleaned = String(term || '').trim();
  if (!cleaned) return;
  const list = getRecentSearches().filter((t) => t.toLowerCase() !== cleaned.toLowerCase());
  list.unshift(cleaned);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, 6)));
}

export async function searchProducts(queryStr) {
  const q = String(queryStr || '').trim().toLowerCase();
  if (!q) return [];
  const products = await fetchProducts();
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.category,
      p.collection,
      p.sku,
      ...(Array.isArray(p.tags) ? p.tags : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
