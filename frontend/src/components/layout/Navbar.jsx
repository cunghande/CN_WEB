import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Menu, ShoppingBag, ShieldCheck, User, X } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice.js';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Đơn hàng', path: '/orders' }
  ];

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    navigate('/');
  };

  const renderLink = (link) => {
    const isActive = location.pathname === link.path;

    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={() => setMobileOpen(false)}
        className={`text-sm font-semibold transition ${isActive ? 'text-premium-700' : 'text-slate-600 hover:text-slate-950'}`}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-premium-700 text-sm font-black text-white">LW</span>
            <span className="text-lg font-black tracking-wide text-slate-950">
              LUXURY<span className="text-premium-700">WEAR</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map(renderLink)}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-premium-50 px-3 py-2 text-sm font-bold text-premium-800 hover:bg-premium-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Quản trị
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-premium-700"
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
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-950">{user.full_name}</div>
                  <div className="text-[11px] capitalize text-slate-500">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Mở menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-4 border-t border-slate-100 py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map(renderLink)}
              {user?.role === 'admin' && renderLink({ name: 'Quản trị', path: '/admin/dashboard' })}
            </nav>
            <div className="border-t border-slate-100 pt-4">
              {user ? (
                <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm font-bold text-red-600">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              ) : (
                <Link onClick={() => setMobileOpen(false)} to="/?login=true" className="inline-flex items-center gap-2 text-sm font-bold text-premium-700">
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
