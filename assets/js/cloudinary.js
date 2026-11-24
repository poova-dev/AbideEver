import { APP_CONFIG, isCloudinaryConfigured } from './config.js';
import { resolveAssetPath } from './utils.js';

/**
 * Generates an optimized Cloudinary URL with f_auto, q_auto, and responsive width,
 * or falls back gracefully to local/direct URLs when not a Cloudinary asset.
 */
export function getOptimizedImageUrl(source, { width = 800, quality = 'auto', crop = 'limit' } = {}) {
  if (!source) return resolveAssetPath('assets/images/product-99-front.jpg');

  // If already a full non-cloudinary URL or local relative path
  if (!source.includes('res.cloudinary.com') && !isCloudinaryPublicId(source)) {
    return resolveAssetPath(source);
  }

  // If full Cloudinary URL, inject transformation
  if (source.includes('res.cloudinary.com') && source.includes('/upload/')) {
    const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
    return source.replace('/upload/', `/upload/${transform}/`);
  }

  // If Cloudinary public ID
  if (isCloudinaryConfigured()) {
    const cloudName = APP_CONFIG.cloudinary.cloudName;
    const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${source}`;
  }

  return resolveAssetPath(source);
}

function isCloudinaryPublicId(str) {
  return typeof str === 'string' && !str.startsWith('http') && !str.startsWith('assets/') && !str.startsWith('/');
}

/**
 * Unsigned upload to Cloudinary from Admin UI only.
 * Requires CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in config.
 */
export async function uploadImageToCloudinary(file, folder = 'abideever/products') {
  if (!isCloudinaryConfigured() || !APP_CONFIG.cloudinary.uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured. Add your cloudName and unsigned uploadPreset in assets/js/config.js.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', APP_CONFIG.cloudinary.uploadPreset);
  formData.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${APP_CONFIG.cloudinary.cloudName}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Cloudinary upload failed');
  }
  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}
