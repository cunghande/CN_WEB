import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, LogOut, Menu, Moon, ShoppingBag, ShieldCheck, Sun, User, X } from 'lucide-react';
import { logout, setTheme } from '../../redux/slices/authSlice.js';
import { fetchNotifications } from '../../redux/slices/notificationSlice.js';
import { markAllNotificationsReadAPI, markNotificationReadAPI } from '../../services/notificationService.js';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
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
    { name: 'Đơn hàng', path: '/orders', private: true }
  ], []);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate('/');
  };

  const handleToggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenNotifications = async () => {
    setNotificationOpen((open) => !open);
  };

  const handleNotificationClick = async (notification) => {
    await markNotificationReadAPI(notification.id);
    dispatch(fetchNotifications());
    setNotificationOpen(false);
    if (notification.target_url) navigate(notification.target_url);
  };

  const handleReadAll = async () => {
    await markAllNotificationsReadAPI();
    dispatch(fetchNotifications());
  };

  const renderLink = (link) => {
    if (link.private && !user) return null;
    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));

    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={() => setMobileOpen(false)}
        className={`text-sm font-semibold transition ${
          isActive
            ? 'text-premium-700 dark:text-premium-300'
            : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-premium-700 text-sm font-black text-white dark:bg-premium-500">LW</span>
            <span className="text-lg font-black tracking-wide text-slate-950 dark:text-white">
              LUXURY<span className="text-premium-700 dark:text-premium-300">WEAR</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map(renderLink)}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-premium-50 px-3 py-2 text-sm font-bold text-premium-800 hover:bg-premium-100 dark:bg-premium-500/15 dark:text-premium-200 dark:hover:bg-premium-500/25"
              >
                <ShieldCheck className="h-4 w-4" />
                Quản trị
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTheme}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Đổi giao diện sáng/tối"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Thông báo"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div className="text-sm font-black text-slate-950 dark:text-white">Thông báo</div>
                      {notifications.length > 0 && (
                        <button onClick={handleReadAll} className="text-xs font-bold text-premium-700 hover:text-premium-900 dark:text-premium-300">
                          Đọc tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">Chưa có thông báo mới.</div>
                      ) : notifications.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                            item.is_read ? '' : 'bg-premium-50/60 dark:bg-premium-500/10'
                          }`}
                        >
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                          <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.message}</div>
                          {item.actor_name && <div className="mt-1 text-[11px] font-bold text-premium-700 dark:text-premium-300">Từ: {item.actor_name}</div>}
                        </button>
                      ))}
                    </div>
                    <Link to="/account/notifications" onClick={() => setNotificationOpen(false)} className="block bg-slate-50 px-4 py-3 text-center text-xs font-bold text-premium-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-premium-300 dark:hover:bg-slate-800">
                      Xem tất cả
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/cart"
              className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-premium-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-premium-700 px-1 text-[10px] font-bold text-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <div className="group relative">
                  <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    )}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-950 dark:text-white">{user.full_name}</div>
                      <div className="text-[11px] capitalize text-slate-500 dark:text-slate-400">{user.role}</div>
                    </div>
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-48 translate-y-2 rounded-lg border border-slate-200 bg-white py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-3 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                    <Link to="/account/profile" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-premium-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-premium-300">Tài khoản của tôi</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-premium-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-premium-300">Đơn hàng</Link>
                    <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/35">Đăng xuất</button>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/35 dark:hover:text-red-300"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/?login=true"
                className="hidden items-center gap-2 rounded-md bg-premium-700 px-4 py-2 text-sm font-bold text-white hover:bg-premium-800 md:inline-flex"
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
              aria-label="Mở menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-4 border-t border-slate-100 py-4 dark:border-slate-800 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map(renderLink)}
              {user && renderLink({ name: 'Tài khoản', path: '/account' })}
              {user?.role === 'admin' && renderLink({ name: 'Quản trị', path: '/admin/dashboard' })}
            </nav>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              {user ? (
                <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-300">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              ) : (
                <Link onClick={() => setMobileOpen(false)} to="/?login=true" className="inline-flex items-center gap-2 text-sm font-bold text-premium-700 dark:text-premium-300">
                  <User className="h-4 w-4" />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
