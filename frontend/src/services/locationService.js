import api from './api.js';

export const getProvincesAPI = async () => {
  const response = await api.get('/locations/provinces');
  return response.data;
};

export const getDistrictsAPI = async (provinceCode) => {
  const response = await api.get(`/locations/districts?provinceCode=${provinceCode}`);
  return response.data;
};

export const getWardsAPI = async (districtCode) => {
  const response = await api.get(`/locations/wards?districtCode=${districtCode}`);
  return response.data;
};
