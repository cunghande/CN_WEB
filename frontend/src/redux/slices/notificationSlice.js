import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getNotificationsAPI } from '../../services/notificationService.js';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const response = await getNotificationsAPI();
  return response.data || [];
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default notificationSlice.reducer;
