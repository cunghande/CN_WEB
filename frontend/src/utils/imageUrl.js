const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (imageUrl, fallback = '') => {
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${API_ORIGIN}${imageUrl}`;
  return `${API_ORIGIN}/${imageUrl}`;
};
