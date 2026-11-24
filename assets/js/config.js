/**
 * AbideEver™ Public Frontend Configuration
 *
 * SECURITY:
 * Only public client configuration belongs here.
 * NEVER place Firebase Admin credentials, Razorpay Key Secret,
 * Cloudinary API Secret, or admin passwords in frontend code.
 */
export const APP_CONFIG = {
  brandName: 'AbideEver™',
  tagline: 'WEAR YOUR VALUES. LIVE YOUR WAY.',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  supportEmail: 'care@abideever.com',
  supportPhone: '+91 98000 00000',
  social: {
    instagram: 'https://instagram.com/abideever',
    facebook: 'https://facebook.com/abideever',
    youtube: 'https://youtube.com/@abideever',
    amazon: 'https://www.amazon.in',
    flipkart: 'https://www.flipkart.com',
  },
  // Populate with your Firebase project web config
  firebase: {
    apiKey: window.__ABIDEEVER_ENV__?.FIREBASE_API_KEY || '',
    authDomain: window.__ABIDEEVER_ENV__?.FIREBASE_AUTH_DOMAIN || '',
    projectId: window.__ABIDEEVER_ENV__?.FIREBASE_PROJECT_ID || '',
    storageBucket: window.__ABIDEEVER_ENV__?.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: window.__ABIDEEVER_ENV__?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: window.__ABIDEEVER_ENV__?.FIREBASE_APP_ID || '',
  },
  // Cloudinary public delivery config (unsigned upload preset for admin only)
  cloudinary: {
    cloudName: window.__ABIDEEVER_ENV__?.CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: window.__ABIDEEVER_ENV__?.CLOUDINARY_UPLOAD_PRESET || '',
  },
  // Razorpay public Key ID (secret key stays strictly on backend)
  razorpay: {
    keyId: window.__ABIDEEVER_ENV__?.RAZORPAY_KEY_ID || '',
    createOrderEndpoint: window.__ABIDEEVER_ENV__?.CREATE_ORDER_ENDPOINT || '/api/create-razorpay-order',
    verifyPaymentEndpoint: window.__ABIDEEVER_ENV__?.VERIFY_PAYMENT_ENDPOINT || '/api/verify-razorpay-payment',
  },
};

export function isFirebaseConfigured() {
  const f = APP_CONFIG.firebase;
  return Boolean(f.apiKey && f.projectId && f.authDomain);
}

export function isCloudinaryConfigured() {
  return Boolean(APP_CONFIG.cloudinary.cloudName);
}

export function isRazorpayConfigured() {
  return Boolean(APP_CONFIG.razorpay.keyId);
}
