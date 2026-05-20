import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
