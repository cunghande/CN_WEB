import axiosClient from './axiosInstance';

export const getOrders = () => axiosClient.get('/orders');
export const getOrderById = (id) => axiosClient.get(`/orders/${id}`);
export const createOrder = (data) => axiosClient.post('/orders', data);
export const updateOrder = (id, data) => axiosClient.put(`/orders/${id}`, data);
export const deleteOrder = (id) => axiosClient.delete(`/orders/${id}`);
