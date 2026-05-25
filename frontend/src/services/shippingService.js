import api from './api.js';

export const quoteShippingAPI = async (payload) => {
  const response = await api.post('/shipping/quote', payload);
  return response.data;
};
