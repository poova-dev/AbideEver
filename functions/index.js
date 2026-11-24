const crypto = require('crypto');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const FREE_SHIPPING_THRESHOLD = 1999;
const STANDARD_SHIPPING_FEE = 99;

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay environment variables are not configured.');
  }
  return { client: new Razorpay({ key_id, key_secret }), key_secret };
}

/**
 * POST /api/create-razorpay-order
 * Validates product prices & variant stock directly from Firestore.
 * Never trusts prices submitted by the client.
 */
exports.createRazorpayOrder = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      const { userId = null, customer, shippingAddress, items, couponCode = null, notes = '' } = req.body || {};
      if (!Array.isArray(items) || !items.length) {
        return res.status(400).json({ error: 'Cart is empty.' });
      }
      if (!customer?.name || !customer?.email || !customer?.phone || !shippingAddress?.address || !shippingAddress?.pincode) {
        return res.status(400).json({ error: 'Incomplete customer or shipping details.' });
      }

      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const qty = Number(item.quantity || 0);
        if (qty <= 0 || !item.productId) {
          return res.status(400).json({ error: 'Invalid item quantity.' });
        }
        const prodSnap = await db.collection('products').doc(item.productId).get();
        if (!prodSnap.exists || prodSnap.data().active === false) {
          return res.status(400).json({ error: `Product ${item.productId} is unavailable.` });
        }
        const prod = prodSnap.data();
        const variantKey = `${item.color} / ${item.size}`;
        const available =
          typeof prod.stock === 'number'
            ? prod.stock
            : Number(prod.stock?.[variantKey] ?? prod.stock?.[item.size] ?? 0);

        if (available < qty) {
          return res.status(400).json({ error: `${prod.name} (${variantKey}) is out of stock.` });
        }

        const unitPrice = Number(prod.price);
        subtotal += unitPrice * qty;
        verifiedItems.push({
          productId: prodSnap.id,
          name: prod.name,
          sku: prod.sku || '',
          color: item.color,
          size: item.size,
          quantity: qty,
          price: unitPrice,
          thumbnail: prod.thumbnail || prod.images?.front || '',
        });
      }

      // Coupon validation
      let discount = 0;
      if (couponCode) {
        const couponSnap = await db.collection('coupons').doc(String(couponCode).toUpperCase()).get();
        if (couponSnap.exists && couponSnap.data().active) {
          const c = couponSnap.data();
          if (subtotal >= Number(c.minimumOrderValue || 0)) {
            discount =
              c.discountType === 'percentage'
                ? Math.round((subtotal * Number(c.discountValue || 0)) / 100)
                : Number(c.discountValue || 0);
            if (c.maximumDiscount) discount = Math.min(discount, Number(c.maximumDiscount));
            discount = Math.min(discount, subtotal);
          }
        }
      }

      const afterDiscount = Math.max(0, subtotal - discount);
      const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
      const total = afterDiscount + shipping;
      const amountPaise = Math.round(total * 100);

      const { client } = getRazorpayClient();
      const rzpOrder = await client.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `ae_${Date.now()}`,
      });

      const draftRef = await db.collection('draftOrders').add({
        userId,
        customer,
        shippingAddress,
        items: verifiedItems,
        subtotal,
        discount,
        shipping,
        total,
        couponCode: couponCode ? String(couponCode).toUpperCase() : null,
        notes,
        razorpayOrderId: rzpOrder.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        razorpayOrderId: rzpOrder.id,
        amountPaise,
        currency: 'INR',
        draftOrderId: draftRef.id,
      });
    } catch (err) {
      console.error('createRazorpayOrder error:', err);
      return res.status(500).json({ error: 'Unable to initiate payment.' });
    }
  });
});

/**
 * POST /api/verify-razorpay-payment
 * Verifies HMAC-SHA256 Razorpay signature before creating the confirmed order
 * and atomically decrementing variant stock.
 */
exports.verifyRazorpayPayment = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, draftOrderId } = req.body || {};
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !draftOrderId) {
        return res.status(400).json({ error: 'Missing payment verification parameters.' });
      }

      const { key_secret } = getRazorpayClient();
      const expectedSig = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ verified: false, error: 'Invalid payment signature.' });
      }

      const draftRef = db.collection('draftOrders').doc(draftOrderId);
      const draftSnap = await draftRef.get();
      if (!draftSnap.exists) {
        return res.status(404).json({ verified: false, error: 'Order draft not found.' });
      }
      const draft = draftSnap.data();
      if (draft.razorpayOrderId !== razorpay_order_id) {
        return res.status(400).json({ verified: false, error: 'Order mismatch.' });
      }

      const orderId = `AE-${Date.now().toString().slice(-6)}`;
      const orderRef = db.collection('orders').doc(orderId);

      await db.runTransaction(async (tx) => {
        for (const item of draft.items) {
          const pRef = db.collection('products').doc(item.productId);
          const pSnap = await tx.get(pRef);
          if (!pSnap.exists) continue;
          const pData = pSnap.data();
          const variantKey = `${item.color} / ${item.size}`;
          if (typeof pData.stock === 'number') {
            tx.update(pRef, { stock: Math.max(0, pData.stock - item.quantity) });
          } else if (pData.stock && variantKey in pData.stock) {
            tx.update(pRef, { [`stock.${variantKey}`]: Math.max(0, Number(pData.stock[variantKey]) - item.quantity) });
          }
        }

        tx.set(orderRef, {
          orderId,
          userId: draft.userId || null,
          customer: draft.customer,
          shippingAddress: draft.shippingAddress,
          items: draft.items,
          subtotal: draft.subtotal,
          discount: draft.discount,
          shipping: draft.shipping,
          total: draft.total,
          couponCode: draft.couponCode || null,
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          trackingNumber: '',
          notes: draft.notes || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        tx.delete(draftRef);
      });

      return res.status(200).json({ verified: true, orderId });
    } catch (err) {
      console.error('verifyRazorpayPayment error:', err);
      return res.status(500).json({ verified: false, error: 'Payment verification failed.' });
    }
  });
});
