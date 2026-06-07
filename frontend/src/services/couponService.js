import api from './api.js';

export const validateCouponAPI = async (payload) => {
  const response = await api.post('/coupons/validate', payload);
  return response.data;
};

export const getEventCouponsAPI = async (params = {}) => {
  const response = await api.get('/coupons/events', { params });
  return response.data;
};

export const getMyCouponsAPI = async (params = {}) => {
  const response = await api.get('/coupons/my', { params });
  return response.data;
};

export const claimCouponAPI = async (couponId, payload = {}) => {
  const response = await api.post(`/coupons/${couponId}/claim`, payload);
  return response.data;
};

export const adminGetCouponsAPI = async () => {
  const response = await api.get('/coupons/admin');
  return response.data;
};

export const adminCreateCouponAPI = async (data) => {
  const response = await api.post('/coupons/admin', data);
  return response.data;
};

export const adminUpdateCouponAPI = async (id, data) => {
  const response = await api.put(`/coupons/admin/${id}`, data);
  return response.data;
};

export const adminDeleteCouponAPI = async (id) => {
  const response = await api.delete(`/coupons/admin/${id}`);
  return response.data;
};
