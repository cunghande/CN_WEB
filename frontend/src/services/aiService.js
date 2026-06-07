import api from './api.js';

export const chatWithStylistAPI = async ({ message, history }) => {
  const response = await api.post('/ai/stylist', { message, history });
  return response.data;
};
