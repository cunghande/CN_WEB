import { createSlice } from '@reduxjs/toolkit';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const storedUser = readStoredUser();
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  theme: storedUser?.theme_preference || localStorage.getItem('theme') || 'light',
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.theme = action.payload.user?.theme_preference || 'light';
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('theme', state.theme);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      state.theme = action.payload?.theme_preference || state.theme;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (state.user) {
        state.user.theme_preference = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, setTheme } = authSlice.actions;
export default authSlice.reducer;
