import { getFirebase } from './firebase.js';

export const ORDER_TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Payment Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export async function lookupOrder(orderId, contact) {
  const id = String(orderId || '').trim();
  const c = String(contact || '').trim().toLowerCase();
  if (!id || !c) throw new Error('Please enter both Order ID and Email or Phone.');

  const fb = await getFirebase();
  if (!fb.configured) {
    throw new Error('Order tracking requires Firebase to be connected.');
  }

  const { doc, getDoc } = fb.fsMod;
  const snap = await getDoc(doc(fb.db, 'orders', id));
  if (!snap.exists()) return null;

  const order = { id: snap.id, ...snap.data() };
  const email = String(order.customer?.email || '').toLowerCase();
  const phone = String(order.customer?.phone || '').replace(/\s+/g, '');
  const cleanContact = c.replace(/\s+/g, '');

  if (email !== cleanContact && phone !== cleanContact && !phone.endsWith(cleanContact)) {
    return null;
  }
  return order;
}

export async function fetchUserOrders(userId) {
  if (!userId) return [];
  const fb = await getFirebase();
  if (!fb.configured) return [];

  const { collection, query, where, orderBy, getDocs } = fb.fsMod;
  const q = query(collection(fb.db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
