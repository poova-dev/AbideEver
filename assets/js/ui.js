import { escapeHTML } from './utils.js';

let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.className = 'fixed bottom-5 right-5 z-[90] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto pointer-events-none';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, { type = 'default', duration = 3200 } = {}) {
  const container = ensureToastContainer();
  const item = document.createElement('div');
  const tone =
    type === 'error'
      ? 'bg-crimson text-white border-crimson'
      : type === 'success'
      ? 'bg-brand text-white border-brand'
      : 'bg-dark text-white border-dark';

  item.className = `toast-item pointer-events-auto border px-4 py-3 text-xs tracking-wide uppercase flex items-center justify-between gap-4 shadow-sm ${tone}`;
  item.innerHTML = `
    <span>${escapeHTML(message)}</span>
    <button type="button" aria-label="Dismiss notification" class="opacity-75 hover:opacity-100 text-xs">✕</button>
  `;

  item.querySelector('button').addEventListener('click', () => removeToast(item));
  container.appendChild(item);

  requestAnimationFrame(() => item.classList.add('is-visible'));
  setTimeout(() => removeToast(item), duration);
}

function removeToast(item) {
  if (!item || !item.parentNode) return;
  item.classList.remove('is-visible');
  setTimeout(() => item.remove(), 260);
}

export function flyToBag(sourceEl) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bagTarget = document.querySelector('[data-bag-trigger]');
  if (!sourceEl || !bagTarget) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const dstRect = bagTarget.getBoundingClientRect();
  if (!srcRect.width || !dstRect.width) return;

  const clone = sourceEl.cloneNode(true);
  clone.className = 'fly-to-bag-clone';
  clone.style.top = `${srcRect.top}px`;
  clone.style.left = `${srcRect.left}px`;
  clone.style.width = `${srcRect.width}px`;
  clone.style.height = `${srcRect.height}px`;
  clone.style.opacity = '0.9';
  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.top = `${dstRect.top + dstRect.height / 2 - 12}px`;
    clone.style.left = `${dstRect.left + dstRect.width / 2 - 12}px`;
    clone.style.width = '24px';
    clone.style.height = '24px';
    clone.style.opacity = '0.15';
  });

  setTimeout(() => clone.remove(), 540);
}

export function initRevealObserver() {
  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  els.forEach((el) => observer.observe(el));
}

export function renderProductGridSkeletons(container, count = 4) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="animate-pulse">
        <div class="aspect-[3/4] skeleton mb-3"></div>
        <div class="h-3.5 skeleton w-3/4 mb-2"></div>
        <div class="h-3.5 skeleton w-1/3"></div>
      </div>
    `
    )
    .join('');
}

export function friendlyErrorMessage(err) {
  const msg = String(err?.message || err || '');
  if (/network|fetch|offline/i.test(msg)) {
    return 'Unable to connect right now. Please check your internet connection.';
  }
  if (/permission-denied|unauthorized/i.test(msg)) {
    return 'You do not have permission to perform this action.';
  }
  if (/auth\/invalid-credential|wrong-password|user-not-found/i.test(msg)) {
    return 'Invalid email or password. Please try again.';
  }
  if (/auth\/email-already-in-use/i.test(msg)) {
    return 'An account with this email already exists.';
  }
  return 'Something went wrong. Please try again shortly.';
}
