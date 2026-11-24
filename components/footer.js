import { APP_CONFIG } from '../assets/js/config.js';
import { getFirebase } from '../assets/js/firebase.js';
import { showToast } from '../assets/js/ui.js';
import { resolveAssetPath } from '../assets/js/utils.js';

export function mountFooter() {
  const host = document.getElementById('site-footer');
  if (!host) return;

  host.innerHTML = `
    <footer class="bg-brand-deep text-cream border-t border-brand mt-20">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/15">
          <!-- Brand Identity -->
          <div class="md:col-span-4 space-y-4">
            <a href="${resolveAssetPath('index.html')}" class="inline-flex items-center gap-3">
              <img src="${resolveAssetPath('assets/images/logo.png')}" alt="AbideEver" class="w-9 h-9 object-cover rounded-[2px] border border-white/20" width="36" height="36" />
              <span class="font-serif text-2xl font-semibold tracking-tight text-white">AbideEver™</span>
            </a>
            <p class="text-xs tracking-[0.16em] uppercase text-cream/85">${APP_CONFIG.tagline}</p>
            <p class="text-sm text-cream/75 max-w-xs leading-relaxed">
              Modern everyday essentials inspired by faith, designed for the way you live.
            </p>
          </div>

          <!-- Storefront Links -->
          <div class="md:col-span-2 space-y-3">
            <h3 class="text-[11px] uppercase tracking-[0.16em] text-cream/60 font-semibold">Store</h3>
            <ul class="space-y-2.5 text-sm text-cream/85">
              <li><a href="${resolveAssetPath('shop.html')}" class="hover:text-white transition-colors">Shop All</a></li>
              <li><a href="${resolveAssetPath('shop.html?collection=Essentials')}" class="hover:text-white transition-colors">Essentials</a></li>
              <li><a href="${resolveAssetPath('shop.html?collection=Faith+Collection')}" class="hover:text-white transition-colors">Faith Collection</a></li>
              <li><a href="${resolveAssetPath('order-tracking.html')}" class="hover:text-white transition-colors">Order Tracking</a></li>
              <li><a href="${resolveAssetPath('about.html')}" class="hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          <!-- Policies & Support -->
          <div class="md:col-span-2 space-y-3">
            <h3 class="text-[11px] uppercase tracking-[0.16em] text-cream/60 font-semibold">Support</h3>
            <ul class="space-y-2.5 text-sm text-cream/85">
              <li><a href="${resolveAssetPath('contact.html')}" class="hover:text-white transition-colors">Contact</a></li>
              <li><a href="${resolveAssetPath('shipping.html')}" class="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="${resolveAssetPath('returns.html')}" class="hover:text-white transition-colors">Returns</a></li>
              <li><a href="${resolveAssetPath('privacy.html')}" class="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="${resolveAssetPath('terms.html')}" class="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>

          <!-- Newsletter & Channels -->
          <div class="md:col-span-4 space-y-4">
            <h3 class="text-[11px] uppercase tracking-[0.16em] text-cream/60 font-semibold">Stay Connected</h3>
            <p class="text-sm text-cream/80">Receive early access to new drops and editorial releases.</p>
            <form id="footer-newsletter-form" class="flex flex-col sm:flex-row gap-2">
              <label for="newsletter-email" class="sr-only">Email address</label>
              <input id="newsletter-email" type="email" required placeholder="Enter your email" class="flex-1 bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder:text-cream/55 focus:outline-none focus:border-cream" />
              <button type="submit" class="bg-cream text-ink px-5 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold hover:bg-white transition-colors">Join</button>
            </form>
            <div class="pt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.12em] text-cream/75">
              <a href="${APP_CONFIG.social.instagram}" target="_blank" rel="noopener noreferrer" class="hover:text-white">Instagram</a>
              <a href="${APP_CONFIG.social.facebook}" target="_blank" rel="noopener noreferrer" class="hover:text-white">Facebook</a>
              <a href="${APP_CONFIG.social.youtube}" target="_blank" rel="noopener noreferrer" class="hover:text-white">YouTube</a>
              <a href="${APP_CONFIG.social.amazon}" target="_blank" rel="noopener noreferrer" class="hover:text-white">Amazon</a>
              <a href="${APP_CONFIG.social.flipkart}" target="_blank" rel="noopener noreferrer" class="hover:text-white">Flipkart</a>
            </div>
          </div>
        </div>

        <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
          <p>© ${new Date().getFullYear()} AbideEver™. All rights reserved.</p>
          <p>Direct-to-Consumer Storefront · India</p>
        </div>
      </div>
    </footer>
  `;

  document.getElementById('footer-newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletter-email');
    const email = input.value.trim();
    if (!email) return;
    try {
      const fb = await getFirebase();
      if (fb.configured) {
        const { doc, setDoc, serverTimestamp } = fb.fsMod;
        await setDoc(doc(fb.db, 'newsletter', email.toLowerCase()), {
          email: email.toLowerCase(),
          createdAt: serverTimestamp(),
        });
      }
      input.value = '';
      showToast('Subscribed to AbideEver updates', { type: 'success' });
    } catch {
      showToast('Unable to subscribe right now', { type: 'error' });
    }
  });
}
