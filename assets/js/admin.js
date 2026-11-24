import { initAuth, isCurrentUserAdmin, signInWithEmail, signOutUser } from './auth.js';
import { getFirebase } from './firebase.js';
import { friendlyErrorMessage, showToast } from './ui.js';

export function mountAdminShell(activePage = 'dashboard') {
  const nav = document.getElementById('admin-sidebar');
  if (!nav) return;

  const links = [
    { id: 'dashboard', label: 'Overview', href: 'index.html' },
    { id: 'products', label: 'Products', href: 'products.html' },
    { id: 'orders', label: 'Orders', href: 'orders.html' },
    { id: 'customers', label: 'Customers', href: 'customers.html' },
    { id: 'coupons', label: 'Coupons', href: 'coupons.html' },
    { id: 'settings', label: 'Settings', href: 'settings.html' },
  ];

  nav.innerHTML = `
    <div class="p-6 border-b border-white/15 flex items-center justify-between">
      <div>
        <span class="font-serif text-xl font-semibold text-white">AbideEver™</span>
        <p class="text-[10px] uppercase tracking-[0.18em] text-cream/70 mt-0.5">Admin Console</p>
      </div>
    </div>
    <nav class="p-4 space-y-1 flex-1">
      ${links
        .map(
          (l) => `
          <a href="${l.href}" class="block px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium transition-colors ${
            l.id === activePage ? 'bg-white/15 text-white' : 'text-cream/75 hover:text-white hover:bg-white/5'
          }">${l.label}</a>
        `
        )
        .join('')}
    </nav>
    <div class="p-4 border-t border-white/15 space-y-2">
      <a href="../index.html" class="block px-3.5 py-2 text-xs text-cream/75 hover:text-white">← View Storefront</a>
      <button type="button" id="admin-logout-btn" class="w-full text-left px-3.5 py-2 text-xs text-cream/75 hover:text-white">Sign Out</button>
    </div>
  `;

  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await signOutUser();
    window.location.reload();
  });
}

export async function requireAdminAccess(onAuthorized) {
  const gate = document.getElementById('admin-auth-gate');
  const content = document.getElementById('admin-main-content');

  const user = await initAuth();
  const fb = await getFirebase();

  if (!fb.configured) {
    gate?.classList.remove('hidden');
    gate.innerHTML = `
      <div class="max-w-md w-full border border-border bg-surface p-8 space-y-4">
        <p class="text-[11px] uppercase tracking-[0.18em] text-brand font-semibold">Setup Required</p>
        <h1 class="font-serif text-2xl font-semibold text-ink">Connect Firebase to Activate Admin</h1>
        <p class="text-xs text-muted leading-relaxed">
          Configure your Firebase project credentials in <code>assets/js/config.js</code> and add your admin UID to the Firestore <code>admins/{uid}</code> collection.
        </p>
        <a href="../index.html" class="btn-secondary inline-block px-5 py-2.5 text-xs uppercase tracking-wider">Return to Storefront</a>
      </div>
    `;
    return;
  }

  const isAdmin = user ? await isCurrentUserAdmin() : false;
  if (!isAdmin) {
    gate?.classList.remove('hidden');
    content?.classList.add('hidden');
    gate.innerHTML = `
      <div class="max-w-md w-full border border-border bg-surface p-8 space-y-5">
        <div>
          <p class="text-[11px] uppercase tracking-[0.18em] text-brand font-semibold">Protected Area</p>
          <h1 class="font-serif text-2xl font-semibold text-ink mt-1">Admin Sign In</h1>
          <p class="text-xs text-muted mt-1">${user ? 'Signed-in account does not have admin privileges.' : 'Sign in with an authorized admin account.'}</p>
        </div>
        <form id="admin-login-form" class="space-y-4">
          <div>
            <label class="block text-xs uppercase tracking-wider text-muted mb-1" for="adm-email">Email</label>
            <input id="adm-email" type="email" required class="w-full border border-border bg-canvas px-3.5 py-2.5 text-sm" />
          </div>
          <div>
            <label class="block text-xs uppercase tracking-wider text-muted mb-1" for="adm-pass">Password</label>
            <input id="adm-pass" type="password" required class="w-full border border-border bg-canvas px-3.5 py-2.5 text-sm" />
          </div>
          <button type="submit" class="btn-primary w-full py-3 text-xs uppercase tracking-[0.14em] font-semibold">Sign In</button>
        </form>
      </div>
    `;

    document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await signInWithEmail(
          document.getElementById('adm-email').value.trim(),
          document.getElementById('adm-pass').value
        );
        window.location.reload();
      } catch (err) {
        showToast(friendlyErrorMessage(err), { type: 'error' });
      }
    });
    return;
  }

  gate?.classList.add('hidden');
  content?.classList.remove('hidden');
  onAuthorized(fb);
}
