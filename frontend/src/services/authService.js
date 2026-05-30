import api from './api.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const loginAPI = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordAPI = async (passwordData) => {
  const response = await api.post('/auth/reset-password', passwordData);
  return response.data;
};

export const getMeAPI = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfileAPI = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const changePasswordAPI = async (passwordData) => {
  const response = await api.put('/auth/password', passwordData);
  return response.data;
};

export const updateAvatarAPI = async (formData) => {
  const response = await api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getUsersAPI = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const getPublicUserProfileAPI = async (id) => {
  const response = await api.get(`/auth/users/${id}/public`);
  return response.data;
};

export const getSocialLoginUrl = (provider) => `${API_URL}/auth/${provider}`;
