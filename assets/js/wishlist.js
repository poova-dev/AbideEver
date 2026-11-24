import { getFirebase } from './firebase.js';
import { showToast } from './ui.js';

const GUEST_WISHLIST_KEY = 'abideever_wishlist_v1';

export function getGuestWishlist() {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestWishlist(ids) {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent('abideever:wishlist-updated'));
}

export async function getWishlistIds(userId = null) {
  if (!userId) return getGuestWishlist();

  const fb = await getFirebase();
  if (!fb.configured) return getGuestWishlist();

  const { collection, getDocs } = fb.fsMod;
  const snap = await getDocs(collection(fb.db, 'users', userId, 'wishlist'));
  return snap.docs.map((d) => d.id);
}

export async function isInWishlist(productId, userId = null) {
  const ids = await getWishlistIds(userId);
  return ids.includes(productId);
}

export async function toggleWishlist(productId, userId = null) {
  if (!productId) return false;

  if (!userId) {
    const list = getGuestWishlist();
    const exists = list.includes(productId);
    const next = exists ? list.filter((id) => id !== productId) : [...list, productId];
    saveGuestWishlist(next);
    showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist');
    return !exists;
  }

  const fb = await getFirebase();
  if (!fb.configured) return false;

  const { doc, getDoc, setDoc, deleteDoc, serverTimestamp } = fb.fsMod;
  const ref = doc(fb.db, 'users', userId, 'wishlist', productId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    window.dispatchEvent(new CustomEvent('abideever:wishlist-updated'));
    showToast('Removed from wishlist');
    return false;
  } else {
    await setDoc(ref, { productId, createdAt: serverTimestamp() });
    window.dispatchEvent(new CustomEvent('abideever:wishlist-updated'));
    showToast('Saved to wishlist', { type: 'success' });
    return true;
  }
}

export async function mergeGuestWishlistToUser(userId) {
  if (!userId) return;
  const guestIds = getGuestWishlist();
  if (!guestIds.length) return;

  const fb = await getFirebase();
  if (!fb.configured) return;

  const { doc, setDoc, serverTimestamp } = fb.fsMod;
  await Promise.all(
    guestIds.map((id) =>
      setDoc(doc(fb.db, 'users', userId, 'wishlist', id), { productId: id, createdAt: serverTimestamp() }, { merge: true })
    )
  );
  localStorage.removeItem(GUEST_WISHLIST_KEY);
  window.dispatchEvent(new CustomEvent('abideever:wishlist-updated'));
}
