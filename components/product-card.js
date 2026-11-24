import { getOptimizedImageUrl } from '../assets/js/cloudinary.js';
import { getProductImages, getTotalStock, getVariantStock } from '../assets/js/products.js';
import { addToCart } from '../assets/js/cart.js';
import { toggleWishlist } from '../assets/js/wishlist.js';
import { getCurrentUser } from '../assets/js/auth.js';
import { escapeHTML, formatINR, resolveAssetPath } from '../assets/js/utils.js';
import { flyToBag, showToast } from '../assets/js/ui.js';
import { openQuickView } from './modal.js';

export function renderProductCard(product, { wishlistIds = [] } = {}) {
  const images = getProductImages(product);
  const primaryImg = getOptimizedImageUrl(images[0] || product.thumbnail, { width: 700 });
  const secondaryImg = images[1] ? getOptimizedImageUrl(images[1], { width: 700 }) : null;
  const totalStock = getTotalStock(product);
  const isOutOfStock = totalStock <= 0;
  const isWishlisted = wishlistIds.includes(product.id);
  const defaultColor = product.colors?.[0]?.name || 'Black';
  const defaultSize = (product.sizes || ['M']).find((s) => getVariantStock(product, defaultColor, s) > 0) || product.sizes?.[0] || 'M';

  const card = document.createElement('article');
  card.className = 'product-card group flex flex-col';
  card.dataset.productId = product.id;

  card.innerHTML = `
    <div class="product-card-media aspect-[3/4] mb-3 border border-border/60">
      <a href="${resolveAssetPath(`product.html?id=${encodeURIComponent(product.id)}`)}" class="block w-full h-full relative" aria-label="${escapeHTML(product.name)}">
        <img
          src="${primaryImg}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          class="product-card-img-primary w-full h-full object-cover"
        />
        ${
          secondaryImg
            ? `<img
                src="${secondaryImg}"
                alt="${escapeHTML(product.name)} alternate view"
                loading="lazy"
                class="product-card-img-secondary absolute inset-0 w-full h-full object-cover opacity-0"
              />`
            : ''
        }
      </a>

      <!-- Wishlist Button -->
      <button
        type="button"
        data-wishlist-btn
        aria-label="Save to wishlist"
        class="absolute top-3 right-3 z-10 w-8 h-8 bg-surface/90 border border-border flex items-center justify-center text-ink hover:text-brand transition-colors ${isWishlisted ? 'text-brand' : ''}"
      >
        <svg class="w-4 h-4" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </button>

      ${
        isOutOfStock
          ? `<span class="absolute top-3 left-3 bg-dark text-white text-[10px] uppercase tracking-[0.12em] px-2 py-1">Sold Out</span>`
          : product.newArrival
          ? `<span class="absolute top-3 left-3 bg-surface/95 text-ink border border-border text-[10px] uppercase tracking-[0.12em] px-2 py-1">New</span>`
          : ''
      }

      <!-- Desktop Hover Actions (always accessible on touch via below-card or visible bar) -->
      <div class="product-card-actions hidden sm:flex absolute inset-x-3 bottom-3 z-10 gap-2">
        <button
          type="button"
          data-quick-add
          ${isOutOfStock ? 'disabled' : ''}
          class="flex-1 bg-surface/95 hover:bg-brand hover:text-white text-ink border border-border py-2.5 text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors disabled:opacity-50"
        >
          ${isOutOfStock ? 'Out of Stock' : `Quick Add · ${escapeHTML(defaultSize)}`}
        </button>
        <button
          type="button"
          data-quick-view
          class="bg-surface/95 hover:bg-ink hover:text-white text-ink border border-border px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] font-medium transition-colors"
        >
          View
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col justify-between gap-1.5">
      <div>
        <div class="flex items-start justify-between gap-2">
          <a href="${resolveAssetPath(`product.html?id=${encodeURIComponent(product.id)}`)}" class="text-[13px] sm:text-sm font-medium text-ink hover:text-brand transition-colors leading-snug">
            ${escapeHTML(product.name)}
          </a>
        </div>
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-center gap-2">
            <span class="text-[13px] sm:text-sm font-semibold text-ink">${formatINR(product.price)}</span>
            ${
              product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
                ? `<span class="text-xs text-muted line-through">${formatINR(product.compareAtPrice)}</span>`
                : ''
            }
          </div>
          ${
            product.rating
              ? `<span class="text-[11px] text-muted">★ ${Number(product.rating).toFixed(1)}</span>`
              : ''
          }
        </div>
      </div>

      <!-- Colors + Mobile Quick Add -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-1.5" aria-label="Available colors">
          ${(product.colors || [])
            .map(
              (c) => `<span title="${escapeHTML(c.name)}" class="w-3 h-3 rounded-full border border-border inline-block" style="background-color: ${escapeHTML(c.hex || '#111111')}"></span>`
            )
            .join('')}
        </div>
        <button
          type="button"
          data-mobile-quick-add
          ${isOutOfStock ? 'disabled' : ''}
          class="sm:hidden text-[11px] uppercase tracking-[0.1em] font-semibold text-brand underline underline-offset-4 disabled:text-muted"
        >
          ${isOutOfStock ? 'Sold Out' : '+ Add'}
        </button>
      </div>
    </div>
  `;

  const handleQuickAdd = () => {
    const stock = getVariantStock(product, defaultColor, defaultSize);
    if (stock <= 0) {
      showToast('This variant is currently out of stock', { type: 'error' });
      return;
    }
    const imgEl = card.querySelector('.product-card-img-primary');
    flyToBag(imgEl);
    addToCart(product, { size: defaultSize, color: defaultColor, quantity: 1, maxStock: stock });
  };

  card.querySelector('[data-quick-add]')?.addEventListener('click', handleQuickAdd);
  card.querySelector('[data-mobile-quick-add]')?.addEventListener('click', handleQuickAdd);
  card.querySelector('[data-quick-view]')?.addEventListener('click', () => openQuickView(product));

  card.querySelector('[data-wishlist-btn]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const svg = btn.querySelector('svg');
    const saved = await toggleWishlist(product.id, getCurrentUser()?.uid || null);
    btn.classList.toggle('text-brand', saved);
    svg?.setAttribute('fill', saved ? 'currentColor' : 'none');
  });

  return card;
}
