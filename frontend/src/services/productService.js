import api from './api.js';

export const getProductsAPI = async (category = '') => {
  const response = await api.get(`/products${category ? `?category=${category}` : ''}`);
  return response.data;
};

export const getProductByIdAPI = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProductAPI = async (formData) => {
  // formData hỗ trợ upload ảnh (multipart/form-data)
  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateProductAPI = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteProductAPI = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const toggleProductLikeAPI = async (id) => {
  const response = await api.post(`/products/${id}/like`);
  return response.data;
};

export const addProductCommentAPI = async (id, content) => {
  const response = await api.post(`/products/${id}/comments`, { content });
  return response.data;
};

export const updateProductCommentAPI = async (productId, commentId, content) => {
  const response = await api.put(`/products/${productId}/comments/${commentId}`, { content });
  return response.data;
};

export const deleteProductCommentAPI = async (productId, commentId) => {
  const response = await api.delete(`/products/${productId}/comments/${commentId}`);
  return response.data;
};

export const setCommentReactionAPI = async (productId, commentId, reaction) => {
  const response = await api.post(`/products/${productId}/comments/${commentId}/reaction`, { reaction });
  return response.data;
};

export const deleteCommentReactionAPI = async (productId, commentId) => {
  const response = await api.delete(`/products/${productId}/comments/${commentId}/reaction`);
  return response.data;
};

export const addCommentReplyAPI = async (productId, commentId, content) => {
  const response = await api.post(`/products/${productId}/comments/${commentId}/replies`, { content });
  return response.data;
};

export const setReplyReactionAPI = async (productId, commentId, replyId, reaction) => {
  const response = await api.post(`/products/${productId}/comments/${commentId}/replies/${replyId}/reaction`, { reaction });
  return response.data;
};

export const addProductReviewAPI = async (id, reviewData) => {
  const response = await api.post(`/products/${id}/reviews`, reviewData, reviewData instanceof FormData ? {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  } : undefined);
  return response.data;
};
