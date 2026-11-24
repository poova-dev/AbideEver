import { getCartTotals, removeCartItem, updateCartItemQuantity } from '../assets/js/cart.js';
import { getOptimizedImageUrl } from '../assets/js/cloudinary.js';
import { escapeHTML, formatINR, resolveAssetPath } from '../assets/js/utils.js';

export function mountCartDrawer() {
  if (document.getElementById('cart-drawer')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'cart-drawer';
  wrapper.className = 'drawer-backdrop fixed inset-0 z-50 bg-black/45 flex justify-end';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = `
    <aside aria-label="Shopping bag" class="drawer-panel-right w-full sm:max-w-md h-full bg-canvas border-l border-border flex flex-col">
      <div class="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
        <h2 class="text-xs uppercase tracking-[0.16em] font-semibold text-ink">Your Bag (<span id="drawer-bag-count">0</span>)</h2>
        <button type="button" id="cart-drawer-close" aria-label="Close bag" class="p-1.5 text-muted hover:text-ink">✕</button>
      </div>
      <div id="cart-drawer-items" class="flex-1 overflow-y-auto p-5 space-y-4"></div>
      <div id="cart-drawer-footer" class="border-t border-border bg-surface p-5 space-y-3"></div>
    </aside>
  `;
  document.body.appendChild(wrapper);

  const openDrawer = () => {
    renderCartDrawer();
    wrapper.classList.add('is-open');
    wrapper.setAttribute('aria-hidden', 'false');
  };
  const closeDrawer = () => {
    wrapper.classList.remove('is-open');
    wrapper.setAttribute('aria-hidden', 'true');
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-bag-trigger]')) {
      openDrawer();
    }
  });
  document.getElementById('cart-drawer-close')?.addEventListener('click', closeDrawer);
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) closeDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrapper.classList.contains('is-open')) closeDrawer();
  });

  window.addEventListener('abideever:cart-updated', () => {
    if (wrapper.classList.contains('is-open')) renderCartDrawer();
  });
}

export function renderCartDrawer() {
  const itemsEl = document.getElementById('cart-drawer-items');
  const footerEl = document.getElementById('cart-drawer-footer');
  const countEl = document.getElementById('drawer-bag-count');
  if (!itemsEl || !footerEl) return;

  const { items, subtotal, discount, shipping, total, freeShippingRemaining } = getCartTotals();
  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  if (countEl) countEl.textContent = String(totalCount);

  if (!items.length) {
    itemsEl.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center py-12">
        <p class="font-serif text-2xl text-ink mb-2">Your bag is empty</p>
        <p class="text-xs text-muted mb-6 max-w-xs">Explore our everyday essentials and faith-inspired pieces.</p>
        <a href="${resolveAssetPath('shop.html')}" class="btn-primary px-6 py-3 text-xs uppercase tracking-[0.14em] font-semibold">Shop Collection</a>
      </div>
    `;
    footerEl.innerHTML = '';
    return;
  }

  const shippingNote =
    freeShippingRemaining > 0
      ? `<p class="text-[11px] text-muted bg-cream px-3 py-2 text-center">Add <strong>${formatINR(freeShippingRemaining)}</strong> more for complimentary shipping.</p>`
      : `<p class="text-[11px] text-brand bg-brand/5 border border-brand/20 px-3 py-2 text-center">You have unlocked complimentary shipping.</p>`;

  itemsEl.innerHTML =
    shippingNote +
    items
      .map(
        (item) => `
      <div class="flex gap-3.5 pb-4 border-b border-border">
        <img src="${getOptimizedImageUrl(item.thumbnail, { width: 160 })}" alt="${escapeHTML(item.name)}" class="w-20 h-24 object-cover bg-cream border border-border/60 shrink-0" />
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium text-ink leading-snug truncate">${escapeHTML(item.name)}</p>
              <button type="button" data-remove-key="${escapeHTML(item.key)}" aria-label="Remove item" class="text-xs text-muted hover:text-crimson">✕</button>
            </div>
            <p class="text-xs text-muted mt-0.5">${escapeHTML(item.color)} · Size ${escapeHTML(item.size)}</p>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="inline-flex items-center border border-border bg-surface">
              <button type="button" data-qty-minus="${escapeHTML(item.key)}" aria-label="Decrease quantity" class="w-7 h-7 text-xs hover:bg-cream">−</button>
              <span class="w-8 text-center text-xs font-medium">${item.quantity}</span>
              <button type="button" data-qty-plus="${escapeHTML(item.key)}" aria-label="Increase quantity" class="w-7 h-7 text-xs hover:bg-cream">+</button>
            </div>
            <span class="text-sm font-semibold text-ink">${formatINR(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    `
      )
      .join('');

  itemsEl.querySelectorAll('[data-qty-minus]').forEach((b) =>
    b.addEventListener('click', () => updateCartItemQuantity(b.dataset.qtyMinus, -1))
  );
  itemsEl.querySelectorAll('[data-qty-plus]').forEach((b) =>
    b.addEventListener('click', () => updateCartItemQuantity(b.dataset.qtyPlus, 1))
  );
  itemsEl.querySelectorAll('[data-remove-key]').forEach((b) =>
    b.addEventListener('click', () => removeCartItem(b.dataset.removeKey))
  );

  footerEl.innerHTML = `
    <div class="space-y-1.5 text-xs">
      <div class="flex justify-between text-muted"><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
      ${discount > 0 ? `<div class="flex justify-between text-brand"><span>Discount</span><span>−${formatINR(discount)}</span></div>` : ''}
      <div class="flex justify-between text-muted"><span>Estimated Shipping</span><span>${shipping === 0 ? 'Complimentary' : formatINR(shipping)}</span></div>
      <div class="flex justify-between text-sm font-semibold text-ink pt-2 border-t border-border"><span>Estimated Total</span><span>${formatINR(total)}</span></div>
    </div>
    <div class="grid grid-cols-1 gap-2 pt-1">
      <a href="${resolveAssetPath('checkout.html')}" class="btn-primary w-full py-3.5 text-center text-xs uppercase tracking-[0.14em] font-semibold">Checkout</a>
      <a href="${resolveAssetPath('cart.html')}" class="btn-secondary w-full py-2.5 text-center text-xs uppercase tracking-[0.12em] font-medium">View Full Bag</a>
    </div>
  `;
}
