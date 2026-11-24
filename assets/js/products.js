import { getFirebase } from './firebase.js';

export const OVERSIZED_SIZE_CHART = {
  fitLabel: 'UNISEX · RELAXED FIT',
  unit: 'inches',
  image: 'assets/images/size-chart-oversized.jpg',
  rows: [
    { size: 'S', chest: 42, length: 27.5, shoulder: 20, sleeve: 8.5 },
    { size: 'M', chest: 44, length: 28, shoulder: 21, sleeve: 9 },
    { size: 'L', chest: 46, length: 28.5, shoulder: 22, sleeve: 9.5 },
    { size: 'XL', chest: 48, length: 29, shoulder: 23, sleeve: 10 },
    { size: 'XXL', chest: 50, length: 29.5, shoulder: 24, sleeve: 10.5 },
  ],
};

/**
 * Fallback catalog used ONLY when Firebase is not yet configured.
 * Uses strictly the supplied AbideEver product imagery and titles.
 */
export const SEED_PRODUCTS = [
  {
    id: 'he-left-the-99',
    name: '“He left the 99 to find Me” Oversized Tee',
    slug: 'he-left-the-99-oversized-tee',
    description:
      'Luke 15:1–7 graphic back print with subtle chest “1” shepherd emblem. Crafted in a relaxed, dropped-shoulder silhouette for everyday wear.',
    price: 1499,
    compareAtPrice: null,
    category: 'Oversized',
    collection: 'Faith Collection',
    sku: 'AE-FAITH-099',
    material: '100% Combed Cotton (Details editable in Admin)',
    fit: 'Unisex Relaxed Oversized Fit',
    care: 'Machine wash cold inside out. Do not iron directly on print. Dry flat in shade.',
    images: {
      front: 'assets/images/product-99-front.jpg',
      back: 'assets/images/product-99-back.jpg',
      lifestyle: 'assets/images/product-99-model.webp',
      detail: 'assets/images/product-99-black-details.webp',
    },
    thumbnail: 'assets/images/product-99-front.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Red', hex: '#B91C1C' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    stock: {
      'Black / S': 10,
      'Black / M': 12,
      'Black / L': 8,
      'Black / XL': 6,
      'Black / XXL': 4,
      'Red / S': 8,
      'Red / M': 10,
      'Red / L': 8,
      'Red / XL': 5,
      'Red / XXL': 3,
      'White / S': 8,
      'White / M': 10,
      'White / L': 8,
      'White / XL': 5,
      'White / XXL': 3,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['faith', 'luke 15', '99', 'oversized', 'black', 'red', 'white', 'christian', 'graphic'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'light-of-the-world-john-8-12',
    name: '“The Light of the World” John 8:12 Oversized Tee',
    slug: 'light-of-the-world-john-8-12',
    description:
      '“Whoever follows Me will never walk in darkness, but will have the light of life.” — John 8:12. Crafted in 210 GSM heavyweight bio-washed cotton.',
    price: 1499,
    compareAtPrice: null,
    category: 'Oversized',
    collection: 'Faith Collection',
    sku: 'AE-FAITH-812',
    material: '210 GSM Heavyweight 100% Bio-Washed Cotton',
    fit: 'Unisex Relaxed Oversized Fit',
    care: 'Machine wash cold inside out. Do not iron directly on print. Dry flat in shade.',
    images: {
      front: 'assets/images/product-light-of-the-world.webp',
      back: 'assets/images/product-light-of-the-world.webp',
      lifestyle: 'assets/images/lifestyle-banner.jpg',
      detail: 'assets/images/product-light-of-the-world.webp',
    },
    thumbnail: 'assets/images/product-light-of-the-world.webp',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }],
    stock: {
      'White / S': 10,
      'White / M': 12,
      'White / L': 10,
      'White / XL': 6,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['faith', 'john 8:12', 'light of the world', 'oversized', 'white', 'christian', '210 gsm'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'god-commands-his-angels-psalm-91',
    name: '“God Commands His Angels” Psalms 91:11 Oversized Tee',
    slug: 'god-commands-his-angels-psalm-91',
    description:
      'Psalms 91:11 statement back graphic on heavyweight black oversized cotton tee. Designed with bold street-editorial presence.',
    price: 1499,
    compareAtPrice: null,
    category: 'Oversized',
    collection: 'Faith Collection',
    sku: 'AE-FAITH-9111',
    material: '100% Combed Cotton (Details editable in Admin)',
    fit: 'Unisex Relaxed Oversized Fit',
    care: 'Machine wash cold inside out. Do not iron directly on print. Dry flat in shade.',
    images: {
      front: 'assets/images/product-psalms-91-angels.webp',
      back: 'assets/images/product-psalms-91-angels.webp',
      lifestyle: 'assets/images/product-psalms-91-angels.webp',
      detail: 'assets/images/product-psalms-91-angels.webp',
    },
    thumbnail: 'assets/images/product-psalms-91-angels.webp',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#111111' }],
    stock: {
      'Black / S': 8,
      'Black / M': 10,
      'Black / L': 8,
      'Black / XL': 5,
      'Black / XXL': 3,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['faith', 'psalms 91:11', 'angels', 'oversized', 'black', 'christian', 'streetwear'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'he-left-the-99-crimson-red',
    name: '“He left the 99 to find Me” Crimson Red Tee',
    slug: 'he-left-the-99-crimson-red',
    description:
      'Luke 15:1–7 “The One & The Ninety-Nine” edition in Crimson Red with white distressed back graphic and chest “1” shepherd emblem.',
    price: 1499,
    compareAtPrice: null,
    category: 'Oversized',
    collection: 'Faith Collection',
    sku: 'AE-FAITH-099-RED',
    material: '100% Cotton Blend (Details editable in Admin)',
    fit: 'Unisex Relaxed Oversized Fit',
    care: 'Machine wash cold inside out. Dry flat in shade.',
    images: {
      front: 'assets/images/product-99-red.webp',
      back: 'assets/images/product-99-red-details.webp',
      lifestyle: 'assets/images/product-99-red-flatlay.jpg',
      detail: 'assets/images/product-99-red-details.webp',
    },
    thumbnail: 'assets/images/product-99-red.webp',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Red', hex: '#B91C1C' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    stock: {
      'Red / S': 8,
      'Red / M': 10,
      'Red / L': 8,
      'Red / XL': 5,
      'Red / XXL': 3,
      'White / S': 8,
      'White / M': 8,
      'White / L': 6,
      'White / XL': 4,
      'White / XXL': 2,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['faith', 'luke 15', '99', 'red', 'oversized', 'christian'],
    featured: true,
    bestseller: false,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'essentials-oversized-tee',
    name: 'AbideEver Essentials — Oversized Tee',
    slug: 'essentials-oversized-tee',
    description:
      'Clean everyday oversized tee with a structured neckline and relaxed drape. Designed as a versatile foundation piece.',
    price: 1199,
    compareAtPrice: null,
    category: 'Oversized',
    collection: 'Essentials',
    sku: 'AE-ESS-OVS-01',
    material: '100% Cotton (Details editable in Admin)',
    fit: 'Unisex Relaxed Oversized Fit',
    care: 'Machine wash cold with similar colors. Tumble dry low.',
    images: {
      front: 'assets/images/hero-banner.jpg',
      back: 'assets/images/essentials-banner.jpg',
      lifestyle: 'assets/images/lifestyle-banner.jpg',
      detail: 'assets/images/hero-banner.jpg',
    },
    thumbnail: 'assets/images/hero-banner.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Cream', hex: '#EEE9DF' },
    ],
    stock: {
      'Black / S': 10,
      'Black / M': 10,
      'Black / L': 8,
      'Black / XL': 5,
      'Black / XXL': 0,
      'Cream / S': 12,
      'Cream / M': 10,
      'Cream / L': 8,
      'Cream / XL': 4,
      'Cream / XXL': 4,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['essentials', 'oversized', 'minimal', 'everyday'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'essentials-round-neck-tee',
    name: 'AbideEver Essentials — Round Neck Tee',
    slug: 'essentials-round-neck-tee',
    description:
      'Classic tailored round neck T-shirt built for daily comfort and clean layering.',
    price: 999,
    compareAtPrice: null,
    category: 'Round Neck',
    collection: 'Essentials',
    sku: 'AE-ESS-RND-02',
    material: '100% Cotton (Details editable in Admin)',
    fit: 'Regular Everyday Fit',
    care: 'Machine wash cold. Line dry.',
    images: {
      front: 'assets/images/lifestyle-banner.jpg',
      back: 'assets/images/essentials-banner.jpg',
      lifestyle: 'assets/images/lifestyle-banner.jpg',
      detail: 'assets/images/essentials-banner.jpg',
    },
    thumbnail: 'assets/images/lifestyle-banner.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Olive', hex: '#5E6850' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#111111' },
    ],
    stock: {
      'Olive / S': 8,
      'Olive / M': 12,
      'Olive / L': 10,
      'Olive / XL': 6,
      'Olive / XXL': 3,
      'White / S': 10,
      'White / M': 10,
      'White / L': 8,
      'White / XL': 5,
      'White / XXL': 4,
      'Black / S': 10,
      'Black / M': 8,
      'Black / L': 4,
      'Black / XL': 0,
      'Black / XXL': 2,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['essentials', 'round neck', 'everyday', 'casual'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
  {
    id: 'essentials-polo-tshirt',
    name: 'AbideEver Essentials — Polo T-Shirt',
    slug: 'essentials-polo-tshirt',
    description:
      'Refined knit polo T-shirt with a structured collar and clean placket, bridging casualwear and smart everyday dressing.',
    price: 1399,
    compareAtPrice: null,
    category: 'Polo T-shirts',
    collection: 'Essentials',
    sku: 'AE-ESS-POL-03',
    material: 'Cotton Piqué (Details editable in Admin)',
    fit: 'Structured Regular Fit',
    care: 'Gentle machine wash cold. Reshape while damp.',
    images: {
      front: 'assets/images/essentials-banner.jpg',
      back: 'assets/images/hero-banner.jpg',
      lifestyle: 'assets/images/lifestyle-banner.jpg',
      detail: 'assets/images/essentials-banner.jpg',
    },
    thumbnail: 'assets/images/essentials-banner.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Sand', hex: '#D6C7B2' },
      { name: 'Navy', hex: '#1B2838' },
    ],
    stock: {
      'Sand / S': 6,
      'Sand / M': 9,
      'Sand / L': 7,
      'Sand / XL': 4,
      'Sand / XXL': 2,
      'Navy / S': 8,
      'Navy / M': 8,
      'Navy / L': 6,
      'Navy / XL': 3,
      'Navy / XXL': 0,
    },
    sizeChart: OVERSIZED_SIZE_CHART,
    tags: ['essentials', 'polo', 'smart casual', 'collar'],
    featured: true,
    bestseller: true,
    newArrival: true,
    active: true,
    rating: null,
  },
];

let cachedProducts = null;

export async function fetchProducts({ includeInactive = false, forceRefresh = false } = {}) {
  if (cachedProducts && !forceRefresh && !includeInactive) {
    return cachedProducts;
  }

  const fb = await getFirebase();
  if (!fb.configured) {
    const list = includeInactive ? SEED_PRODUCTS : SEED_PRODUCTS.filter((p) => p.active !== false);
    if (!includeInactive) cachedProducts = list;
    return list;
  }

  const { collection, getDocs, query, where, orderBy } = fb.fsMod;
  const colRef = collection(fb.db, 'products');
  const q = includeInactive
    ? query(colRef, orderBy('createdAt', 'desc'))
    : query(colRef, where('active', '==', true));

  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (!includeInactive) cachedProducts = list;
  return list;
}

export async function fetchProductById(id) {
  if (!id) return null;
  const fb = await getFirebase();
  if (!fb.configured) {
    return SEED_PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
  }

  const { doc, getDoc, collection, query, where, getDocs, limit } = fb.fsMod;
  const docRef = doc(fb.db, 'products', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  const q = query(collection(fb.db, 'products'), where('slug', '==', id), limit(1));
  const qSnap = await getDocs(q);
  if (!qSnap.empty) {
    const first = qSnap.docs[0];
    return { id: first.id, ...first.data() };
  }
  return null;
}

export function getVariantStock(product, colorName, size) {
  if (!product) return 0;
  const stock = product.stock;
  if (typeof stock === 'number') return stock;
  if (stock && typeof stock === 'object') {
    const key = `${colorName} / ${size}`;
    if (key in stock) return Number(stock[key] ?? 0);
    if (size in stock) return Number(stock[size] ?? 0);
  }
  return 0;
}

export function getTotalStock(product) {
  if (!product) return 0;
  if (typeof product.stock === 'number') return product.stock;
  if (product.stock && typeof product.stock === 'object') {
    return Object.values(product.stock).reduce((sum, v) => sum + Number(v || 0), 0);
  }
  return 0;
}

export function getProductImages(product) {
  if (!product) return [];
  if (Array.isArray(product.images)) return product.images.filter(Boolean);
  if (product.images && typeof product.images === 'object') {
    const ordered = [
      product.images.front,
      product.images.back,
      product.images.lifestyle,
      product.images.detail,
    ].filter(Boolean);
    return [...new Set(ordered)];
  }
  return product.thumbnail ? [product.thumbnail] : [];
}
