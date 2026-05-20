import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('cart_items');

const initialState = {
  items: storedCart ? JSON.parse(storedCart) : []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      // Kiểm tra xem variant_id đã có trong giỏ chưa
      const existingIndex = state.items.findIndex(item => item.variant_id === newItem.variant_id);
      
      if (existingIndex !== -1) {
        state.items[existingIndex].quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    removeItem: (state, action) => {
      const variantId = action.payload;
      state.items = state.items.filter(item => item.variant_id !== variantId);
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { variant_id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.variant_id === variant_id);
      if (existingItem) {
        existingItem.quantity = Math.max(1, quantity);
      }
      localStorage.setItem('cart_items', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart_items');
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
