import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (category = '', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products${category ? `?category=${category}` : ''}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách sản phẩm');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: ''
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCategory } = productSlice.actions;
export default productSlice.reducer;
