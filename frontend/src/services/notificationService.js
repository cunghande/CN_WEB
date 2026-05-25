import api from './api.js';

export const getNotificationsAPI = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationReadAPI = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadAPI = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
