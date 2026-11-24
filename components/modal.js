import { getOptimizedImageUrl } from '../assets/js/cloudinary.js';
import { getProductImages, getVariantStock } from '../assets/js/products.js';
import { addToCart } from '../assets/js/cart.js';
import { escapeHTML, formatINR, getStockStatus, resolveAssetPath } from '../assets/js/utils.js';
import { showToast } from '../assets/js/ui.js';

let modalHost = null;

function ensureQuickViewHost() {
  if (modalHost) return modalHost;
  modalHost = document.createElement('div');
  modalHost.id = 'quick-view-modal';
  modalHost.className = 'modal-backdrop fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
  modalHost.setAttribute('aria-hidden', 'true');
  modalHost.setAttribute('role', 'dialog');
  modalHost.setAttribute('aria-modal', 'true');
  document.body.appendChild(modalHost);

  modalHost.addEventListener('click', (e) => {
    if (e.target === modalHost) closeQuickView();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalHost.classList.contains('is-open')) closeQuickView();
  });

  return modalHost;
}

export function closeQuickView() {
  if (!modalHost) return;
  modalHost.classList.remove('is-open');
  modalHost.setAttribute('aria-hidden', 'true');
}

export function openQuickView(product) {
  const host = ensureQuickViewHost();
  const images = getProductImages(product);
  const colors = product.colors?.length ? product.colors : [{ name: 'Black', hex: '#111111' }];
  const sizes = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  let selectedColor = colors[0].name;
  let selectedSize = sizes.find((s) => getVariantStock(product, selectedColor, s) > 0) || sizes[0];
  let quantity = 1;

  host.innerHTML = `
    <div class="modal-panel bg-surface w-full max-w-3xl border border-border grid grid-cols-1 md:grid-cols-2 overflow-hidden relative max-h-[90vh]">
      <button type="button" id="qv-close" aria-label="Close quick view" class="absolute top-3 right-3 z-10 w-8 h-8 bg-surface/90 border border-border flex items-center justify-center text-ink hover:text-brand">✕</button>
      <div class="bg-cream aspect-[3/4] md:aspect-auto">
        <img src="${getOptimizedImageUrl(images[0] || product.thumbnail, { width: 700 })}" alt="${escapeHTML(product.name)}" class="w-full h-full object-cover" />
      </div>
      <div class="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-5">
        <div class="space-y-4">
          <div>
            <p class="text-[11px] uppercase tracking-[0.14em] text-muted">${escapeHTML(product.collection || product.category || 'AbideEver')}</p>
            <h3 class="font-serif text-2xl font-semibold text-ink mt-1">${escapeHTML(product.name)}</h3>
            <p class="text-lg font-semibold text-ink mt-2">${formatINR(product.price)}</p>
          </div>
          <p class="text-xs text-muted leading-relaxed">${escapeHTML(product.description || '')}</p>

          <!-- Color -->
          <div>
            <p class="text-[11px] uppercase tracking-[0.12em] text-muted mb-2">Color: <span id="qv-color-label" class="text-ink font-medium">${escapeHTML(selectedColor)}</span></p>
            <div class="flex gap-2" id="qv-colors">
              ${colors
                .map(
                  (c, idx) => `
                  <button type="button" data-qv-color="${escapeHTML(c.name)}" class="w-7 h-7 rounded-full border ${idx === 0 ? 'ring-2 ring-brand ring-offset-2 border-ink' : 'border-border'}" style="background-color: ${escapeHTML(c.hex || '#111111')}" aria-label="${escapeHTML(c.name)}"></button>
                `
                )
                .join('')}
            </div>
          </div>

          <!-- Size -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] uppercase tracking-[0.12em] text-muted">Size</span>
              <span id="qv-stock-badge" class="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 border"></span>
            </div>
            <div class="grid grid-cols-5 gap-2" id="qv-sizes"></div>
          </div>

          <!-- Quantity -->
          <div>
            <p class="text-[11px] uppercase tracking-[0.12em] text-muted mb-2">Quantity</p>
            <div class="inline-flex items-center border border-border">
              <button type="button" id="qv-qty-minus" class="w-9 h-9 text-sm hover:bg-cream">−</button>
              <span id="qv-qty-val" class="w-10 text-center text-sm font-medium">1</span>
              <button type="button" id="qv-qty-plus" class="w-9 h-9 text-sm hover:bg-cream">+</button>
            </div>
          </div>
        </div>

        <div class="space-y-2.5 pt-2">
          <button type="button" id="qv-add-to-cart" class="btn-primary w-full py-3.5 text-xs uppercase tracking-[0.14em] font-semibold">Add to Cart</button>
          <a href="${resolveAssetPath(`product.html?id=${encodeURIComponent(product.id)}`)}" class="btn-secondary block w-full py-3 text-center text-xs uppercase tracking-[0.14em] font-medium">View Product</a>
        </div>
      </div>
    </div>
  `;

  const syncVariantUI = () => {
    const stock = getVariantStock(product, selectedColor, selectedSize);
    const status = getStockStatus(stock);
    const badge = host.querySelector('#qv-stock-badge');
    badge.textContent = status.label;
    badge.className = `text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 border ${status.className}`;

    const sizesWrap = host.querySelector('#qv-sizes');
    sizesWrap.innerHTML = sizes
      .map((sz) => {
        const sStock = getVariantStock(product, selectedColor, sz);
        const active = sz === selectedSize;
        return `
          <button
            type="button"
            data-qv-size="${escapeHTML(sz)}"
            class="py-2 text-xs font-medium border transition-colors ${
              active ? 'bg-ink text-white border-ink' : 'bg-surface text-ink border-border hover:border-ink'
            } ${sStock <= 0 ? 'opacity-40 line-through' : ''}"
          >${escapeHTML(sz)}</button>
        `;
      })
      .join('');

    sizesWrap.querySelectorAll('[data-qv-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedSize = btn.dataset.qvSize;
        syncVariantUI();
      });
    });

    const addBtn = host.querySelector('#qv-add-to-cart');
    addBtn.disabled = stock <= 0;
    addBtn.textContent = stock <= 0 ? 'Out of Stock' : 'Add to Cart';
  };

  host.querySelector('#qv-close')?.addEventListener('click', closeQuickView);
  host.querySelectorAll('[data-qv-color]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedColor = btn.dataset.qvColor;
      host.querySelector('#qv-color-label').textContent = selectedColor;
      host.querySelectorAll('[data-qv-color]').forEach((b) => b.classList.remove('ring-2', 'ring-brand', 'ring-offset-2', 'border-ink'));
      btn.classList.add('ring-2', 'ring-brand', 'ring-offset-2', 'border-ink');
      syncVariantUI();
    });
  });

  host.querySelector('#qv-qty-minus')?.addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    host.querySelector('#qv-qty-val').textContent = String(quantity);
  });
  host.querySelector('#qv-qty-plus')?.addEventListener('click', () => {
    const max = Math.max(1, getVariantStock(product, selectedColor, selectedSize));
    quantity = Math.min(max, quantity + 1);
    host.querySelector('#qv-qty-val').textContent = String(quantity);
  });

  host.querySelector('#qv-add-to-cart')?.addEventListener('click', () => {
    const stock = getVariantStock(product, selectedColor, selectedSize);
    if (stock <= 0) {
      showToast('This variant is out of stock', { type: 'error' });
      return;
    }
    addToCart(product, { size: selectedSize, color: selectedColor, quantity, maxStock: stock });
    closeQuickView();
  });

  syncVariantUI();
  host.classList.add('is-open');
  host.setAttribute('aria-hidden', 'false');
}
