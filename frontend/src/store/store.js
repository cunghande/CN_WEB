import { createStore } from 'zustand';

export const useStore = createStore((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  orders: [],
  setOrders: (orders) => set({ orders }),
  user: null,
  setUser: (user) => set({ user }),
  cart: [],
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId),
  })),
  clearCart: () => set({ cart: [] }),
}));
