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
  reducers: {
    markNotificationReadLocal: (state, action) => {
      state.items = state.items.map((item) => (
        item.id === action.payload ? { ...item, is_read: true } : item
      ));
    },
    markAllNotificationsReadLocal: (state) => {
      state.items = state.items.map((item) => ({ ...item, is_read: true }));
    }
  },
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

export const { markNotificationReadLocal, markAllNotificationsReadLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
