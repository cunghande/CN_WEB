import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import ManageOrders from '../pages/admin/ManageOrders.jsx';
import ManageProducts from '../pages/admin/ManageProducts.jsx';
import CartPage from '../pages/customer/CartPage.jsx';
import HomePage from '../pages/customer/HomePage.jsx';
import OrdersPage from '../pages/customer/OrdersPage.jsx';
import ProductsPage from '../pages/customer/ProductsPage.jsx';
import PrivateRoute from './PrivateRoute.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />

            <Route path="/admin/dashboard" element={<PrivateRoute requireAdmin><Dashboard /></PrivateRoute>} />
            <Route path="/admin/products" element={<PrivateRoute requireAdmin><ManageProducts /></PrivateRoute>} />
            <Route path="/admin/orders" element={<PrivateRoute requireAdmin><ManageOrders /></PrivateRoute>} />

            <Route
              path="*"
              element={(
                <div className="grid min-h-[60vh] place-items-center bg-slate-50 px-4 text-center">
                  <div>
                    <h2 className="text-5xl font-black text-slate-950">404</h2>
                    <p className="mt-3 text-sm text-slate-500">Trang bạn đang tìm kiếm không tồn tại.</p>
                    <a href="/" className="mt-5 inline-flex rounded-md bg-premium-700 px-4 py-2 text-sm font-bold text-white hover:bg-premium-800">
                      Về trang chủ
                    </a>
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
};

export default AppRouter;
