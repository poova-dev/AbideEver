# AbideEver™ — D2C Fashion Storefront

**Wear Your Values. Live Your Way.**

## Stack
- **Frontend:** HTML5, CSS3, Tailwind CSS, Vanilla JavaScript (ES Modules)
- **Backend / Data:** Firebase Auth, Cloud Firestore, Firebase Cloud Functions (Node.js)
- **Media:** Cloudinary (`f_auto, q_auto` responsive transforms)
- **Payments:** Razorpay (server-verified HMAC-SHA256 signatures)
- **Hosting:** Vercel (Frontend) + Cloudflare (DNS/CDN)

## Configuration
1. **Frontend Public Keys:** Populate `window.__ABIDEEVER_ENV__` or `assets/js/config.js` with your public Firebase Web Config, Cloudinary `cloudName` + unsigned `uploadPreset` (for admin uploads), and Razorpay `keyId`.
2. **Backend Secrets:** Never place `RAZORPAY_KEY_SECRET` or Firebase Admin credentials in frontend files. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Firebase Cloud Functions environment variables (`functions/.env` or `firebase functions:secrets:set`).
3. **Admin Access:** Add your Firebase Auth user UID as a document in Firestore at `admins/{uid}` with `{ active: true }`.
4. **Deploy Security Rules & Indexes:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,functions
   ```
5. **Local Preview:**
   ```bash
   python3 -m http.server 8080
   ```
# AbideEver
