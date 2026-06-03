import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import ManageOrders from '../pages/admin/ManageOrders.jsx';
import ManageProducts from '../pages/admin/ManageProducts.jsx';
import ManageCoupons from '../pages/admin/ManageCoupons.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import AccountPage from '../pages/customer/AccountPage.jsx';
import CartPage from '../pages/customer/CartPage.jsx';
import HomePage from '../pages/customer/HomePage.jsx';
import OrdersPage from '../pages/customer/OrdersPage.jsx';
import ProductDetailPage from '../pages/customer/ProductDetailPage.jsx';
import ProductsPage from '../pages/customer/ProductsPage.jsx';
import PublicProfilePage from '../pages/customer/PublicProfilePage.jsx';
import ResetPasswordPage from '../pages/customer/ResetPasswordPage.jsx';
import VoucherEventPage from '../pages/customer/VoucherEventPage.jsx';
import PrivateRoute from './PrivateRoute.jsx';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};

const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <div className="flex min-h-screen flex-col bg-[#f6f3ee] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/events" element={<VoucherEventPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/account/profile" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/account/addresses" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/account/security" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/account/notifications" element={<PrivateRoute><AccountPage /></PrivateRoute>} />

          <Route path="/admin/dashboard" element={<PrivateRoute requireAdmin><Dashboard /></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute requireAdmin><ManageProducts /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute requireAdmin><ManageOrders /></PrivateRoute>} />
          <Route path="/admin/coupons" element={<PrivateRoute requireAdmin><ManageCoupons /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute requireAdmin><ManageUsers /></PrivateRoute>} />

          <Route
            path="*"
            element={(
              <div className="grid min-h-[60vh] place-items-center bg-slate-50 px-4 text-center dark:bg-slate-950">
                <div>
                  <h2 className="text-5xl font-black text-slate-950 dark:text-white">404</h2>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{'Trang b\u1ea1n \u0111ang t\u00ecm ki\u1ebfm kh\u00f4ng t\u1ed3n t\u1ea1i.'}</p>
                  <a href="/" className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">{'V\u1ec1 trang ch\u1ee7'}</a>
                </div>
              </div>
            )}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default AppRouter;

