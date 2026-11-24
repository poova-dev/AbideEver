import { getFirebase } from './firebase.js';
import { mergeGuestWishlistToUser } from './wishlist.js';

let currentUser = null;
let authInitialized = false;
const listeners = new Set();

export async function initAuth() {
  if (authInitialized) return currentUser;
  const fb = await getFirebase();
  if (!fb.configured) {
    authInitialized = true;
    return null;
  }

  return new Promise((resolve) => {
    fb.authMod.onAuthStateChanged(fb.auth, async (user) => {
      currentUser = user;
      authInitialized = true;
      if (user) {
        await mergeGuestWishlistToUser(user.uid).catch(() => {});
      }
      listeners.forEach((cb) => cb(user));
      window.dispatchEvent(new CustomEvent('abideever:auth-changed', { detail: { user } }));
      resolve(user);
    });
  });
}

export function onAuthChange(cb) {
  listeners.add(cb);
  if (authInitialized) cb(currentUser);
  return () => listeners.delete(cb);
}

export function getCurrentUser() {
  return currentUser;
}

export async function signInWithEmail(email, password) {
  const fb = await getFirebase();
  if (!fb.configured) throw new Error('Firebase Authentication is not configured.');
  const cred = await fb.authMod.signInWithEmailAndPassword(fb.auth, email, password);
  return cred.user;
}

export async function signUpWithEmail(name, email, password) {
  const fb = await getFirebase();
  if (!fb.configured) throw new Error('Firebase Authentication is not configured.');
  const cred = await fb.authMod.createUserWithEmailAndPassword(fb.auth, email, password);
  if (name) {
    await fb.authMod.updateProfile(cred.user, { displayName: name });
  }
  const { doc, setDoc, serverTimestamp } = fb.fsMod;
  await setDoc(
    doc(fb.db, 'users', cred.user.uid),
    {
      name: name || '',
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return cred.user;
}

export async function signInWithGoogle() {
  const fb = await getFirebase();
  if (!fb.configured) throw new Error('Firebase Authentication is not configured.');
  const provider = new fb.authMod.GoogleAuthProvider();
  const cred = await fb.authMod.signInWithPopup(fb.auth, provider);
  const { doc, setDoc, serverTimestamp } = fb.fsMod;
  await setDoc(
    doc(fb.db, 'users', cred.user.uid),
    {
      name: cred.user.displayName || '',
      email: cred.user.email || '',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return cred.user;
}

export async function signOutUser() {
  const fb = await getFirebase();
  if (!fb.configured) return;
  await fb.authMod.signOut(fb.auth);
}

export async function isCurrentUserAdmin() {
  if (!currentUser) return false;
  const fb = await getFirebase();
  if (!fb.configured) return false;
  try {
    const { doc, getDoc } = fb.fsMod;
    const snap = await getDoc(doc(fb.db, 'admins', currentUser.uid));
    return snap.exists() && snap.data()?.active !== false;
  } catch {
    return false;
  }
}
