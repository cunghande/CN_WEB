import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Gift, LogOut, Menu, Moon, Search, ShoppingBag, ShieldCheck, Sun, User, X } from 'lucide-react';
import ReviewRequestModal from '../product/ReviewRequestModal.jsx';
import { logout, setTheme } from '../../redux/slices/authSlice.js';
import { fetchNotifications, markAllNotificationsReadLocal, markNotificationReadLocal } from '../../redux/slices/notificationSlice.js';
import { markAllNotificationsReadAPI, markNotificationReadAPI } from '../../services/notificationService.js';
import { addProductCommentAPI, addProductReviewAPI } from '../../services/productService.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const getReviewProductId = (notification) => {
  if (notification.type === 'product_review_request' && notification.entity_type === 'product' && notification.entity_id) {
    return notification.entity_id;
  }

  const target = notification.target_url || '';
  const isReviewTarget = notification.type === 'product_review_request'
    || target.includes('review=1')
    || target.includes('review-form')
    || `${notification.title || ''} ${notification.message || ''}`.toLowerCase().includes('đánh giá');
  if (!isReviewTarget) return null;

  const productMatch = target.match(/\/products\/(\d+)/);
  if (productMatch) return productMatch[1];

  const productParam = new URLSearchParams(target.split('?')[1] || '').get('productId');
  return productParam || null;
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState(null);
  const { user, theme } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { items: notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const navLinks = useMemo(() => [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Săn voucher', path: '/events', icon: Gift }
  ], []);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
    setNotificationOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeMenus();
    navigate('/');
  };

  const getNotificationTarget = (notification) => {
    const reviewProductId = getReviewProductId(notification);
    if (reviewProductId) {
      return `/products/${reviewProductId}#comments`;
    }

    return notification.target_url;
  };

  const handleNotificationClick = async (notification) => {
    dispatch(markNotificationReadLocal(notification.id));
    await markNotificationReadAPI(notification.id);
    dispatch(fetchNotifications());
    setNotificationOpen(false);
    const reviewProductId = getReviewProductId(notification);
    if (reviewProductId) {
      setReviewRequest({ ...notification, entity_id: reviewProductId });
      return;
    }
    const target = getNotificationTarget(notification);
    if (target) navigate(target);
  };

  const handleSubmitReviewRequest = async ({ rating, content, image }) => {
    if (!reviewRequest?.entity_id) return;

    const formData = new FormData();
    formData.append('rating', String(rating));
    formData.append('content', content);
    if (image) formData.append('image', image);

    await addProductReviewAPI(reviewRequest.entity_id, formData);
    const commentResponse = await addProductCommentAPI(reviewRequest.entity_id, content);
    const commentId = commentResponse?.data?.id;
    navigate(`/products/${reviewRequest.entity_id}${commentId ? `#comment-${commentId}` : '#comments'}`);
  };

  const handleReadAll = async () => {
    dispatch(markAllNotificationsReadLocal());
    await markAllNotificationsReadAPI();
    dispatch(fetchNotifications());
  };

  const renderLink = (link) => {
    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
    const Icon = link.icon;

    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={closeMenus}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition ${
          isActive
            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {link.name}
      </Link>
    );
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/82 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/88">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-soft dark:bg-white dark:text-slate-950">LW</span>
            <span className="leading-tight">
              <span className="block text-lg font-black text-slate-950 dark:text-white">LuxuryWear</span>
              <span className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">modern retail</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:flex">
            {navLinks.map(renderLink)}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Quản trị
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link to="/products" className="hidden rounded-full p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex" aria-label="Tìm sản phẩm">
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Đổi giao diện sáng tối"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen((open) => !open)}
                  className="relative rounded-full p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">{unreadCount}</span>}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div className="text-sm font-black text-slate-950 dark:text-white">Thông báo</div>
                      {notifications.length > 0 && <button onClick={handleReadAll} className="text-xs font-black text-emerald-700 dark:text-emerald-300">Đọc tất cả</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">Chưa có thông báo mới.</div>
                      ) : notifications.slice(0, 8).map((item) => (
                        <button key={item.id} onClick={() => handleNotificationClick(item)} className={`block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${item.is_read ? '' : 'bg-emerald-50/70 dark:bg-emerald-500/10'}`}>
                          <div className="text-sm font-black text-slate-950 dark:text-white">{item.title}</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.message}</div>
                        </button>
                      ))}
                    </div>
                    <Link to="/account/notifications" onClick={closeMenus} className="block bg-slate-50 px-4 py-3 text-center text-xs font-black text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">Xem tất cả</Link>
                  </div>
                )}
              </div>
            )}

            <Link to="/cart" className="relative rounded-full p-2.5 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Giỏ hàng">
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-slate-950 px-1 text-[10px] font-black text-white dark:bg-white dark:text-slate-950">{totalCartItems}</span>}
            </Link>

            {user ? (
              <div className="hidden md:block">
                <div className="relative" onMouseEnter={() => setAccountOpen(true)} onMouseLeave={() => setAccountOpen(false)}>
                  <button onClick={() => setAccountOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                    {user.avatar_url ? <img src={getImageUrl(user.avatar_url)} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-xs font-black text-slate-950">{user.full_name?.charAt(0) || 'U'}</span>}
                    <span className="max-w-28 truncate pr-1 text-xs font-black text-slate-950 dark:text-white">{user.full_name}</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full z-50 pt-3">
                      <div className="w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                          <div className="truncate text-sm font-black text-slate-950 dark:text-white">{user.full_name}</div>
                          <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>
                        <Link onClick={closeMenus} to="/account/profile" className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Tài khoản của tôi</Link>
                        <Link onClick={closeMenus} to="/orders" className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Đơn hàng</Link>
                        {user.role === 'admin' && <Link onClick={closeMenus} to="/admin/dashboard" className="block px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30">Bảng quản trị</Link>}
                        {user.role === 'admin' && <Link onClick={closeMenus} to="/admin/users" className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Quản lý người dùng</Link>}
                        <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">Đăng xuất</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/?login=true" className="hidden items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:inline-flex">
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}

            <button onClick={() => setMobileOpen((open) => !open)} className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden" aria-label="Mở menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-3 border-t border-slate-100 py-4 dark:border-slate-800 md:hidden">
            <nav className="grid gap-2">{navLinks.map(renderLink)}{user && renderLink({ name: 'Tài khoản', path: '/account' })}{user && renderLink({ name: 'Đơn hàng', path: '/orders' })}{user?.role === 'admin' && renderLink({ name: 'Quản trị', path: '/admin/dashboard' })}</nav>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              {user ? <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-black text-rose-600 dark:text-rose-300"><LogOut className="h-4 w-4" />Đăng xuất</button> : <Link onClick={closeMenus} to="/?login=true" className="inline-flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white"><User className="h-4 w-4" />Đăng nhập</Link>}
            </div>
          </div>
        )}
      </div>

    </header>
      <ReviewRequestModal
        isOpen={Boolean(reviewRequest)}
        onClose={() => setReviewRequest(null)}
        onSubmit={handleSubmitReviewRequest}
      />
    </>
  );
};

export default Navbar;



