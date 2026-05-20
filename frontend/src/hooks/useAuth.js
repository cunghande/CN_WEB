import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';

const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const isAdmin = user?.role === 'admin';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isAdmin,
    logout: handleLogout
  };
};

export default useAuth;
