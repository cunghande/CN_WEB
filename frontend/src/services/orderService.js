import api from './api.js';

export const createOrderAPI = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrdersAPI = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderByIdAPI = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getAllOrdersAPI = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatusAPI = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};
