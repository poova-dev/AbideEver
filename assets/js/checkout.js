import { APP_CONFIG, isRazorpayConfigured } from './config.js';
import { getFirebase } from './firebase.js';
import { clearCart, getAppliedCoupon, getCart, setAppliedCoupon } from './cart.js';
import { getCurrentUser } from './auth.js';

export async function validateAndApplyCoupon(code, subtotal) {
  const cleaned = String(code || '').trim().toUpperCase();
  if (!cleaned) throw new Error('Enter a coupon code');

  const fb = await getFirebase();
  if (!fb.configured) {
    throw new Error('Coupons require Firebase to be connected.');
  }

  const { collection, query, where, getDocs, limit } = fb.fsMod;
  const q = query(collection(fb.db, 'coupons'), where('code', '==', cleaned), where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error('Invalid or inactive coupon code.');
  }

  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };
  if (coupon.expiryDate) {
    const exp = coupon.expiryDate?.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
    if (exp < new Date()) throw new Error('This coupon has expired.');
  }
  if (coupon.usageLimit && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) {
    throw new Error('This coupon has reached its usage limit.');
  }
  if (subtotal < Number(coupon.minimumOrderValue || 0)) {
    throw new Error(`Minimum order of ₹${coupon.minimumOrderValue} required for this coupon.`);
  }

  setAppliedCoupon(coupon);
  return coupon;
}

/**
 * Initiates Razorpay Checkout through the secure backend.
 * - Never trusts frontend prices: backend reads Firestore product prices & stock.
 * - Never marks order PAID on frontend: backend verifies razorpay_signature
 *   before writing orders/{orderId} as paid.
 */
export async function initiateRazorpayCheckout({ customer, shippingAddress, notes = '' }) {
  const items = getCart();
  if (!items.length) throw new Error('Your bag is empty.');

  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay Key ID is not configured in assets/js/config.js.');
  }
  if (typeof window.Razorpay !== 'function') {
    throw new Error('Razorpay checkout script failed to load. Please refresh and try again.');
  }

  const coupon = getAppliedCoupon();
  const user = getCurrentUser();

  // Step 1: Request backend to validate stock/prices & create Razorpay order
  const orderRes = await fetch(APP_CONFIG.razorpay.createOrderEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user?.uid || null,
      customer,
      shippingAddress,
      items: items.map((i) => ({
        productId: i.productId,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      })),
      couponCode: coupon?.code || null,
      notes,
    }),
  });

  const orderData = await orderRes.json().catch(() => ({}));
  if (!orderRes.ok || !orderData.razorpayOrderId) {
    throw new Error(orderData.error || 'Unable to create payment order. Please check item availability.');
  }

  // Step 2: Open Razorpay Checkout Modal
  return new Promise((resolve, reject) => {
    const options = {
      key: APP_CONFIG.razorpay.keyId,
      amount: orderData.amountPaise,
      currency: orderData.currency || 'INR',
      name: 'AbideEver™',
      description: 'Wear Your Values. Live Your Way.',
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: {
        color: '#003D2B',
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user.')),
      },
      handler: async function (response) {
        try {
          // Step 3: Verify payment signature & create Firestore order on backend
          const verifyRes = await fetch(APP_CONFIG.razorpay.verifyPaymentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              draftOrderId: orderData.draftOrderId,
            }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok || !verifyData.verified) {
            reject(new Error(verifyData.error || 'Payment verification failed.'));
            return;
          }
          clearCart();
          resolve(verifyData);
        } catch (err) {
          reject(err);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'));
    });
    rzp.open();
  });
}
