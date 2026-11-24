import { APP_CONFIG } from './config.js';
import { showToast } from './ui.js';

const CART_STORAGE_KEY = 'abideever_cart_v1';
const COUPON_STORAGE_KEY = 'abideever_coupon_v1';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('abideever:cart-updated', { detail: { items } }));
}

export function getAppliedCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAppliedCoupon(coupon) {
  if (!coupon) {
    localStorage.removeItem(COUPON_STORAGE_KEY);
  } else {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
  }
  window.dispatchEvent(new CustomEvent('abideever:cart-updated', { detail: { items: getCart() } }));
}

export function addToCart(product, { size = 'M', color = 'Black', quantity = 1, maxStock = 99 } = {}) {
  const items = getCart();
  const key = `${product.id}__${color}__${size}`;
  const existing = items.find((i) => i.key === key);

  if (existing) {
    const nextQty = Math.min(existing.quantity + quantity, maxStock);
    if (nextQty === existing.quantity && existing.quantity >= maxStock) {
      showToast('Maximum available stock reached for this variant', { type: 'error' });
      return items;
    }
    existing.quantity = nextQty;
  } else {
    items.push({
      key,
      productId: product.id,
      name: product.name,
      price: Number(product.price || 0),
      thumbnail: product.thumbnail || product.images?.front || '',
      color,
      size,
      quantity: Math.min(quantity, maxStock),
      maxStock,
      sku: product.sku || '',
    });
  }

  saveCart(items);
  showToast('Added to bag', { type: 'success' });
  return items;
}

export function updateCartItemQuantity(key, delta) {
  const items = getCart();
  const idx = items.findIndex((i) => i.key === key);
  if (idx === -1) return items;

  const next = items[idx].quantity + delta;
  if (next <= 0) {
    items.splice(idx, 1);
  } else {
    const limit = items[idx].maxStock || 99;
    items[idx].quantity = Math.min(next, limit);
  }
  saveCart(items);
  return items;
}

export function removeCartItem(key) {
  const items = getCart().filter((i) => i.key !== key);
  saveCart(items);
  return items;
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(COUPON_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('abideever:cart-updated', { detail: { items: [] } }));
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

export function getCartTotals() {
  const items = getCart();
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const coupon = getAppliedCoupon();

  let discount = 0;
  if (coupon && subtotal >= Number(coupon.minimumOrderValue || 0)) {
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * Number(coupon.discountValue || 0)) / 100);
      if (coupon.maximumDiscount) {
        discount = Math.min(discount, Number(coupon.maximumDiscount));
      }
    } else {
      discount = Number(coupon.discountValue || 0);
    }
    discount = Math.min(discount, subtotal);
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    items.length === 0
      ? 0
      : afterDiscount >= APP_CONFIG.freeShippingThreshold
      ? 0
      : APP_CONFIG.standardShippingFee;

  const total = afterDiscount + shipping;

  return {
    items,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    freeShippingRemaining: Math.max(0, APP_CONFIG.freeShippingThreshold - afterDiscount),
  };
}
