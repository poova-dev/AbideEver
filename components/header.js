import { APP_CONFIG } from '../assets/js/config.js';
import { getCartCount } from '../assets/js/cart.js';
import { getCurrentUser, initAuth, signInWithEmail, signUpWithEmail, signInWithGoogle } from '../assets/js/auth.js';
import { getWishlistIds } from '../assets/js/wishlist.js';
import { searchProducts, getRecentSearches, saveRecentSearch } from '../assets/js/search.js';
import { getOptimizedImageUrl } from '../assets/js/cloudinary.js';
import { debounce, escapeHTML, formatINR, resolveAssetPath } from '../assets/js/utils.js';
import { friendlyErrorMessage, showToast } from '../assets/js/ui.js';

export function mountHeader() {
  const host = document.getElementById('site-header');
  if (!host) return;

  const currentPath = window.location.pathname;
  const isShop = currentPath.endsWith('shop.html');
  const isAbout = currentPath.endsWith('about.html');
  const isHome = currentPath === '/' || currentPath.endsWith('index.html');

  host.innerHTML = `
    <div class="bg-brand-deep text-cream text-[11px] tracking-[0.14em] uppercase py-2 px-4 text-center">
      <span>Free shipping on orders above ₹1,999 · Wear Your Values. Live Your Way.</span>
    </div>
    <header id="main-navbar" class="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-border transition-colors">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <!-- Mobile Left: Menu -->
        <div class="flex items-center lg:hidden">
          <button type="button" id="mobile-menu-open" aria-label="Open menu" class="p-2 -ml-2 text-ink hover:text-brand transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" />
            </svg>
          </button>
        </div>

        <!-- Logo (Left on Desktop, Center on Mobile) -->
        <a href="${resolveAssetPath('index.html')}" class="flex items-center gap-2.5 group" aria-label="AbideEver Home">
          <img src="${resolveAssetPath('assets/images/logo.png')}" alt="AbideEver Logo" class="w-8 h-8 object-cover rounded-[2px]" width="32" height="32" />
          <span class="font-serif text-xl sm:text-2xl tracking-tight text-ink font-semibold">AbideEver<sup class="text-[10px] font-sans ml-0.5">™</sup></span>
        </a>

        <!-- Desktop Center Nav -->
        <nav aria-label="Main navigation" class="hidden lg:flex items-center gap-8 text-[13px] tracking-[0.08em] uppercase font-medium">
          <a href="${resolveAssetPath('index.html')}" class="${isHome ? 'text-brand border-b border-brand pb-0.5' : 'text-ink hover:text-brand'} transition-colors">Home</a>
          <a href="${resolveAssetPath('shop.html')}" class="${isShop ? 'text-brand border-b border-brand pb-0.5' : 'text-ink hover:text-brand'} transition-colors">Shop</a>
          <a href="${resolveAssetPath('shop.html?collection=Faith+Collection')}" class="text-ink hover:text-brand transition-colors">Collections</a>
          <a href="${resolveAssetPath('about.html')}" class="${isAbout ? 'text-brand border-b border-brand pb-0.5' : 'text-ink hover:text-brand'} transition-colors">About</a>
        </nav>

        <!-- Right Utility Actions -->
        <div class="flex items-center gap-2 sm:gap-4">
          <button type="button" id="search-trigger" aria-label="Search products" class="hidden lg:inline-flex items-center gap-1.5 p-2 text-ink hover:text-brand transition-colors text-xs uppercase tracking-[0.08em]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
            </svg>
            <span class="hidden xl:inline">Search</span>
          </button>

          <button type="button" id="account-trigger" aria-label="Account" class="hidden lg:inline-flex items-center gap-1.5 p-2 text-ink hover:text-brand transition-colors text-xs uppercase tracking-[0.08em]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span id="header-account-label" class="hidden xl:inline">Account</span>
          </button>

          <a href="${resolveAssetPath('account.html#wishlist')}" aria-label="Wishlist" class="hidden lg:inline-flex items-center gap-1 p-2 text-ink hover:text-brand transition-colors relative">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <span id="wishlist-badge" class="hidden text-[10px] font-semibold bg-brand text-white w-4 h-4 rounded-full items-center justify-center">0</span>
          </a>

          <button type="button" data-bag-trigger aria-label="Shopping bag" class="inline-flex items-center gap-1.5 p-2 -mr-2 sm:mr-0 text-ink hover:text-brand transition-colors relative">
            <svg class="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
            <span class="hidden lg:inline text-xs uppercase tracking-[0.08em]">Bag</span>
            <span id="bag-badge" class="text-[10px] font-semibold bg-brand text-white min-w-[18px] h-[18px] px-1 rounded-full inline-flex items-center justify-center">0</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Drawer -->
    <div id="mobile-nav-drawer" class="drawer-backdrop fixed inset-0 z-50 bg-black/40" aria-hidden="true">
      <div class="drawer-panel-left w-full max-w-xs h-full bg-canvas border-r border-border flex flex-col justify-between p-6 overflow-y-auto">
        <div>
          <div class="flex items-center justify-between pb-5 border-b border-border">
            <span class="font-serif text-xl font-semibold">AbideEver™</span>
            <button type="button" id="mobile-menu-close" aria-label="Close menu" class="p-2 -mr-2 text-ink">✕</button>
          </div>
          <nav class="mt-6 flex flex-col gap-4 text-sm uppercase tracking-[0.08em] font-medium">
            <a href="${resolveAssetPath('index.html')}" class="py-1 text-ink hover:text-brand">Home</a>
            <a href="${resolveAssetPath('shop.html')}" class="py-1 text-ink hover:text-brand">Shop All</a>
            <a href="${resolveAssetPath('shop.html?collection=Essentials')}" class="py-1 text-ink hover:text-brand">Essentials</a>
            <a href="${resolveAssetPath('shop.html?collection=Faith+Collection')}" class="py-1 text-ink hover:text-brand">Faith Collection</a>
            <a href="${resolveAssetPath('about.html')}" class="py-1 text-ink hover:text-brand">About</a>
            <a href="${resolveAssetPath('order-tracking.html')}" class="py-1 text-ink hover:text-brand">Track Order</a>
            <a href="${resolveAssetPath('contact.html')}" class="py-1 text-ink hover:text-brand">Contact</a>
          </nav>
          <div class="mt-8 pt-6 border-t border-border flex flex-col gap-3">
            <button type="button" id="mobile-search-trigger" class="w-full py-2.5 px-4 border border-border bg-surface text-left text-xs uppercase tracking-[0.08em] flex items-center justify-between">
              <span>Search Catalog</span>
              <span>→</span>
            </button>
            <a href="${resolveAssetPath('account.html')}" class="w-full py-2.5 px-4 border border-border bg-surface text-xs uppercase tracking-[0.08em] flex items-center justify-between">
              <span>Account & Wishlist</span>
              <span>→</span>
            </a>
          </div>
        </div>
        <p class="text-[11px] text-muted tracking-wide uppercase pt-6">${APP_CONFIG.tagline}</p>
      </div>
    </div>

    <!-- Search Overlay -->
    <div id="search-overlay" class="modal-backdrop fixed inset-0 z-50 bg-black/45 flex items-start justify-center pt-0 sm:pt-16 px-0 sm:px-4" aria-hidden="true">
      <div class="modal-panel bg-canvas w-full sm:max-w-2xl border border-border shadow-lg max-h-[90vh] flex flex-col">
        <div class="p-4 sm:p-5 border-b border-border flex items-center gap-3 bg-surface">
          <svg class="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
          </svg>
          <input id="global-search-input" type="search" placeholder="Search by product, collection, category, or SKU..." class="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none" autocomplete="off" />
          <button type="button" id="search-close" aria-label="Close search" class="text-xs uppercase tracking-wider text-muted hover:text-ink px-2 py-1">Esc</button>
        </div>
        <div id="search-results-body" class="p-5 overflow-y-auto space-y-5"></div>
      </div>
    </div>

    <!-- Auth Modal -->
    <div id="auth-modal" class="modal-backdrop fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4" aria-hidden="true">
      <div class="modal-panel bg-surface w-full max-w-md border border-border p-6 sm:p-8 relative">
        <button type="button" id="auth-modal-close" aria-label="Close sign in" class="absolute top-4 right-4 text-muted hover:text-ink p-1">✕</button>
        <p class="text-[11px] uppercase tracking-[0.14em] text-muted mb-1">AbideEver™ Account</p>
        <h2 id="auth-modal-title" class="font-serif text-2xl font-semibold text-ink mb-5">Sign In</h2>
        <form id="auth-modal-form" class="space-y-4">
          <div id="auth-name-wrap" class="hidden">
            <label class="block text-xs uppercase tracking-wider text-muted mb-1.5" for="auth-name">Full Name</label>
            <input id="auth-name" type="text" class="w-full border border-border bg-canvas px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand" placeholder="Your name" />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-muted mb-1.5" for="auth-email">Email</label>
            <input id="auth-email" type="email" required class="w-full border border-border bg-canvas px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand" placeholder="you@example.com" />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-muted mb-1.5" for="auth-password">Password</label>
            <input id="auth-password" type="password" required minlength="6" class="w-full border border-border bg-canvas px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand" placeholder="••••••••" />
          </div>
          <button type="submit" id="auth-submit-btn" class="btn-primary w-full py-3 text-xs uppercase tracking-[0.14em] font-semibold">Sign In</button>
        </form>
        <div class="my-4 flex items-center gap-3 text-xs text-muted">
          <span class="h-px flex-1 bg-border"></span>
          <span>OR</span>
          <span class="h-px flex-1 bg-border"></span>
        </div>
        <button type="button" id="auth-google-btn" class="btn-secondary w-full py-2.5 text-xs uppercase tracking-[0.12em] font-medium">Continue with Google</button>
        <p class="text-xs text-muted text-center mt-5">
          <span id="auth-toggle-prompt">New to AbideEver?</span>
          <button type="button" id="auth-mode-toggle" class="text-brand font-medium underline ml-1">Create an account</button>
        </p>
      </div>
    </div>
  `;

  setupHeaderInteractions();
}

function setupHeaderInteractions() {
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');

  const closeMobile = () => {
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
  };
  openBtn?.addEventListener('click', () => {
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
  });
  closeBtn?.addEventListener('click', closeMobile);
  mobileDrawer?.addEventListener('click', (e) => {
    if (e.target === mobileDrawer) closeMobile();
  });

  // Bag badge updates
  const syncBagBadge = () => {
    const count = getCartCount();
    const badge = document.getElementById('bag-badge');
    if (badge) {
      badge.textContent = String(count);
      badge.classList.toggle('opacity-60', count === 0);
    }
  };
  syncBagBadge();
  window.addEventListener('abideever:cart-updated', syncBagBadge);

  // Wishlist badge
  const syncWishlistBadge = async () => {
    const user = getCurrentUser();
    const ids = await getWishlistIds(user?.uid || null).catch(() => []);
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      badge.textContent = String(ids.length);
      badge.classList.toggle('hidden', ids.length === 0);
      badge.classList.toggle('inline-flex', ids.length > 0);
    }
  };
  syncWishlistBadge();
  window.addEventListener('abideever:wishlist-updated', syncWishlistBadge);

  // Auth state
  initAuth();
  window.addEventListener('abideever:auth-changed', (e) => {
    const user = e.detail?.user;
    const label = document.getElementById('header-account-label');
    if (label) {
      label.textContent = user ? (user.displayName?.split(' ')[0] || 'Account') : 'Account';
    }
    syncWishlistBadge();
  });

  // Account trigger
  const authModal = document.getElementById('auth-modal');
  const accountBtn = document.getElementById('account-trigger');
  accountBtn?.addEventListener('click', () => {
    if (getCurrentUser()) {
      window.location.href = resolveAssetPath('account.html');
    } else {
      authModal.classList.add('is-open');
      authModal.setAttribute('aria-hidden', 'false');
    }
  });

  document.getElementById('auth-modal-close')?.addEventListener('click', () => {
    authModal.classList.remove('is-open');
    authModal.setAttribute('aria-hidden', 'true');
  });
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.remove('is-open');
      authModal.setAttribute('aria-hidden', 'true');
    }
  });

  let isSignUp = false;
  document.getElementById('auth-mode-toggle')?.addEventListener('click', () => {
    isSignUp = !isSignUp;
    document.getElementById('auth-modal-title').textContent = isSignUp ? 'Create Account' : 'Sign In';
    document.getElementById('auth-submit-btn').textContent = isSignUp ? 'Create Account' : 'Sign In';
    document.getElementById('auth-name-wrap').classList.toggle('hidden', !isSignUp);
    document.getElementById('auth-toggle-prompt').textContent = isSignUp ? 'Already have an account?' : 'New to AbideEver?';
    document.getElementById('auth-mode-toggle').textContent = isSignUp ? 'Sign in' : 'Create an account';
  });

  document.getElementById('auth-modal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    try {
      if (isSignUp) {
        await signUpWithEmail(name, email, password);
        showToast('Welcome to AbideEver™', { type: 'success' });
      } else {
        await signInWithEmail(email, password);
        showToast('Signed in successfully', { type: 'success' });
      }
      authModal.classList.remove('is-open');
      authModal.setAttribute('aria-hidden', 'true');
    } catch (err) {
      showToast(friendlyErrorMessage(err), { type: 'error' });
    }
  });

  document.getElementById('auth-google-btn')?.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
      authModal.classList.remove('is-open');
      authModal.setAttribute('aria-hidden', 'true');
      showToast('Signed in with Google', { type: 'success' });
    } catch (err) {
      showToast(friendlyErrorMessage(err), { type: 'error' });
    }
  });

  // Search overlay
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('global-search-input');
  const resultsBody = document.getElementById('search-results-body');

  const openSearch = () => {
    closeMobile();
    searchOverlay.classList.add('is-open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    renderDefaultSearchState();
    setTimeout(() => searchInput?.focus(), 60);
  };
  const closeSearch = () => {
    searchOverlay.classList.remove('is-open');
    searchOverlay.setAttribute('aria-hidden', 'true');
  };

  document.getElementById('search-trigger')?.addEventListener('click', openSearch);
  document.getElementById('mobile-search-trigger')?.addEventListener('click', openSearch);
  document.getElementById('search-close')?.addEventListener('click', closeSearch);
  searchOverlay?.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeMobile();
      authModal?.classList.remove('is-open');
    }
  });

  function renderDefaultSearchState() {
    const recent = getRecentSearches();
    resultsBody.innerHTML = `
      <div>
        <p class="text-[11px] uppercase tracking-[0.12em] text-muted mb-2.5">${recent.length ? 'Recent Searches' : 'Popular Collections'}</p>
        <div class="flex flex-wrap gap-2">
          ${(recent.length ? recent : ['Oversized', 'Faith Collection', 'Round Neck', 'Polo T-shirts', '99'])
            .map(
              (term) =>
                `<button type="button" data-search-chip="${escapeHTML(term)}" class="px-3 py-1.5 border border-border bg-surface text-xs hover:border-brand transition-colors">${escapeHTML(term)}</button>`
            )
            .join('')}
        </div>
      </div>
    `;
    resultsBody.querySelectorAll('[data-search-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        searchInput.value = btn.dataset.searchChip;
        runSearch(searchInput.value);
      });
    });
  }

  const runSearch = debounce(async (query) => {
    const q = query.trim();
    if (!q) {
      renderDefaultSearchState();
      return;
    }
    const matches = await searchProducts(q);
    if (!matches.length) {
      resultsBody.innerHTML = `
        <div class="py-8 text-center">
          <p class="text-sm text-ink font-medium">No products found for “${escapeHTML(q)}”</p>
          <p class="text-xs text-muted mt-1">Try searching for Oversized, Round Neck, Polo, or Faith Collection.</p>
        </div>
      `;
      return;
    }

    saveRecentSearch(q);
    resultsBody.innerHTML = `
      <div class="flex items-center justify-between text-xs text-muted pb-2 border-b border-border">
        <span>${matches.length} result${matches.length === 1 ? '' : 's'}</span>
        <a href="${resolveAssetPath(`shop.html?q=${encodeURIComponent(q)}`)}" class="text-brand underline">View all in Shop →</a>
      </div>
      <div class="divide-y divide-border">
        ${matches
          .slice(0, 6)
          .map(
            (p) => `
            <a href="${resolveAssetPath(`product.html?id=${encodeURIComponent(p.id)}`)}" class="py-3 flex items-center gap-4 hover:bg-cream/40 px-2 -mx-2 transition-colors">
              <img src="${getOptimizedImageUrl(p.thumbnail || p.images?.front, { width: 140 })}" alt="${escapeHTML(p.name)}" class="w-14 h-16 object-cover bg-cream shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] uppercase tracking-wider text-muted">${escapeHTML(p.collection || p.category || '')}</p>
                <p class="text-sm font-medium text-ink truncate">${escapeHTML(p.name)}</p>
                <p class="text-xs font-semibold text-ink mt-0.5">${formatINR(p.price)}</p>
              </div>
            </a>
          `
          )
          .join('')}
      </div>
    `;
  }, 220);

  searchInput?.addEventListener('input', (e) => runSearch(e.target.value));
}
