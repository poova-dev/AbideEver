import { APP_CONFIG, isFirebaseConfigured } from './config.js';

let firebasePromise = null;

/**
 * Lazily initializes Firebase Modular SDK (v10.14.1) from gstatic CDN
 * only when Firebase configuration is present.
 */
export async function getFirebase() {
  if (!isFirebaseConfigured()) {
    return { configured: false, app: null, auth: null, db: null };
  }
  if (firebasePromise) return firebasePromise;

  firebasePromise = (async () => {
    const [appMod, authMod, fsMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),
    ]);

    const app = appMod.getApps().length
      ? appMod.getApp()
      : appMod.initializeApp(APP_CONFIG.firebase);

    const auth = authMod.getAuth(app);
    const db = fsMod.getFirestore(app);

    return {
      configured: true,
      app,
      auth,
      db,
      authMod,
      fsMod,
    };
  })();

  return firebasePromise;
}
