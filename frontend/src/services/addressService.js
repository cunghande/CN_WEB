import api from './api.js';

export const getAddressesAPI = async () => {
  const response = await api.get('/user/addresses');
  return response.data;
};

export const createAddressAPI = async (addressData) => {
  const response = await api.post('/user/addresses', addressData);
  return response.data;
};

export const updateAddressAPI = async (id, addressData) => {
  const response = await api.put(`/user/addresses/${id}`, addressData);
  return response.data;
};

export const deleteAddressAPI = async (id) => {
  const response = await api.delete(`/user/addresses/${id}`);
  return response.data;
};
