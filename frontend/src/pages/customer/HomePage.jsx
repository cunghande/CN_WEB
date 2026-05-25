import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, Check, Eye, Heart, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import useProduct from '../../hooks/useProduct.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { loginSuccess } from '../../redux/slices/authSlice.js';
import { loginAPI, registerAPI } from '../../services/authService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getLowestStockVariant, getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

const heroSlides = [
  {
    title: 'Bộ sưu tập công sở mới',
    subtitle: 'Form gọn, chất vải dễ mặc, phù hợp cho khách hàng thích phong cách chỉn chu hằng ngày.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=85'
  },
  {
    title: 'Streetwear năng động',
    subtitle: 'Áo khoác, hoodie, sneaker và phụ kiện được phân nhóm rõ để bán hàng nhanh hơn.',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1920&q=85'
  },
  {
    title: 'Quản lý tồn kho theo biến thể',
    subtitle: 'Mỗi sản phẩm có size, màu, tồn kho, đánh giá, bình luận và hashtag để demo nghiệp vụ đầy đủ.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1920&q=85'
  }
];

const HomePage = () => {
  const { products, loading } = useProduct();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeSlide, setActiveSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('a@gmail.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setAuthModal(true);
      setAuthTab('login');
      searchParams.delete('login');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const categories = [
    { id: 1, name: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=700&q=80' },
    { id: 2, name: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80' },
    { id: 7, name: 'Đồ thể thao', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=700&q=80' },
    { id: 9, name: 'Giày & phụ kiện', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80' }
  ];

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setSelectedVariant(getLowestStockVariant(product));
    setQuantity(1);
    setAddedToast(false);
  };

  const handleAddToCart = () => {
    if (!quickViewProduct || !selectedVariant || selectedVariant.stock_quantity <= 0) return;
    const safeQuantity = Math.min(quantity, selectedVariant.stock_quantity);
    addToCart(quickViewProduct, selectedVariant, safeQuantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1800);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = authTab === 'login'
        ? await loginAPI({ email, password })
        : await registerAPI({ full_name: fullName, email, password });

      dispatch(loginSuccess(res.data));
      setAuthModal(false);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Không thể xác thực tài khoản');
    } finally {
      setAuthLoading(false);
    }
  };

  const slide = heroSlides[activeSlide];

  return (
    <div className="bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden bg-slate-950">
        {heroSlides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt={item.title}
            className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
              index === activeSlide ? 'opacity-60 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/15" />

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wide backdrop-blur">
              <Sparkles className="h-4 w-4 text-premium-300" />
              LuxuryWear 2026
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">{slide.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">{slide.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg">
                  Xem sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => setAuthModal(true)}>
                  <User className="h-4 w-4" />
                  Đăng nhập demo
                </Button>
              )}
            </div>
            <div className="mt-10 flex gap-2">
              {heroSlides.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition ${index === activeSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'}`}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-black text-white">{category.name}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-premium-100">
                    Xem danh mục <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700 dark:text-premium-300">Sản phẩm mới</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Hàng nổi bật trong kho</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-premium-700 hover:text-premium-900 dark:text-premium-300">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <Link to={`/products/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={getImageUrl(product.image_url, fallbackImage)} alt={product.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-700 dark:bg-slate-950/85 dark:text-slate-200">
                    {product.category_name || 'Thời trang'}
                  </span>
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(product.rating_avg || 0).toFixed(1)}
                  </span>
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <Link to={`/products/${product.id}`} className="line-clamp-1 font-bold text-slate-950 hover:text-premium-700 dark:text-white dark:hover:text-premium-300">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tồn kho: {getProductStock(product)} | {product.like_count || 0} lượt thích</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {product.tags?.slice(0, 2).map((tag) => (
                        <span key={tag.id || tag.name} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="font-black text-premium-800 dark:text-premium-300">{formatPrice(product.base_price)}</span>
                    <div className="flex items-center gap-2">
                      <Link to={`/products/${product.id}`} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-premium-700 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Chi tiết">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Button size="sm" onClick={() => openQuickView(product)}>
                        <ShoppingBag className="h-4 w-4" />
                        Chọn
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { icon: Truck, title: 'Giao hàng COD', desc: 'Tự tính phí ship theo địa chỉ tỉnh, huyện, xã/phường.' },
            { icon: PackageCheck, title: 'Tồn kho rõ ràng', desc: 'Mỗi sản phẩm có nhiều biến thể size, màu và số lượng cụ thể.' },
            { icon: ShieldCheck, title: 'Quản trị đầy đủ', desc: 'Admin theo dõi dashboard, sản phẩm, đơn hàng và thông báo trạng thái.' }
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-md bg-premium-50 text-premium-700 dark:bg-premium-900/35 dark:text-premium-300">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} title="Xem nhanh sản phẩm" maxWidth="max-w-4xl">
        {quickViewProduct && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <img src={getImageUrl(quickViewProduct.image_url, fallbackImage)} alt={quickViewProduct.name} className="aspect-[3/4] w-full rounded-lg object-cover object-top" />
            <div className="flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase text-premium-700">{quickViewProduct.category_name || 'Thời trang'}</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{quickViewProduct.name}</h3>
                <div className="mt-3 text-2xl font-black text-premium-800">{formatPrice(quickViewProduct.base_price)}</div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {quickViewProduct.description || 'Sản phẩm thời trang dễ phối đồ, phù hợp nhiều nhu cầu sử dụng hằng ngày.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickViewProduct.tags?.map((tag) => (
                    <span key={tag.id || tag.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">#{tag.name}</span>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-xs font-black uppercase text-slate-700">Chọn size và màu</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickViewProduct.variants?.map((variant) => {
                      const active = selectedVariant?.id === variant.id;
                      const disabled = Number(variant.stock_quantity) <= 0;
                      return (
                        <button
                          key={variant.id}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={`rounded-md border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-45 ${
                            active ? 'border-premium-700 bg-premium-50 text-premium-900' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <span className="block font-black">{variant.size} - {variant.color}</span>
                          <span className="text-slate-500">Còn {variant.stock_quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">Số lượng</span>
                  <div className="flex items-center overflow-hidden rounded-md border border-slate-200">
                    <button className="px-3 py-1.5 font-bold hover:bg-slate-50" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="min-w-10 border-x border-slate-200 px-3 py-1.5 text-center text-sm font-bold">{quantity}</span>
                    <button className="px-3 py-1.5 font-bold hover:bg-slate-50" onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}>+</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button size="lg" className="w-full" disabled={!selectedVariant || selectedVariant.stock_quantity <= 0} onClick={handleAddToCart}>
                    <ShoppingBag className="h-5 w-5" />
                    Thêm vào giỏ
                  </Button>
                  <Link to={`/products/${quickViewProduct.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-5 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50">
                    <Heart className="h-5 w-5" />
                    Xem chi tiết
                  </Link>
                </div>
                {addedToast && (
                  <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-50 py-2 text-sm font-bold text-emerald-700">
                    <Check className="h-4 w-4" />
                    Đã thêm sản phẩm vào giỏ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={authModal} onClose={() => setAuthModal(false)} title={authTab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}>
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button type="button" onClick={() => setAuthTab('login')} className={`rounded px-3 py-2 text-sm font-bold ${authTab === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Đăng nhập</button>
            <button type="button" onClick={() => setAuthTab('register')} className={`rounded px-3 py-2 text-sm font-bold ${authTab === 'register' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Đăng ký</button>
          </div>

          <div className="rounded-md border border-premium-100 bg-premium-50 p-3 text-xs leading-5 text-premium-900">
            Demo: khách hàng <b>a@gmail.com</b> / <b>123456</b>, admin <b>admin@gmail.com</b> / <b>123456</b>
          </div>

          {authError && <div className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-600">{authError}</div>}

          {authTab === 'register' && (
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Họ và tên" className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
          )}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
          <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
          <Button type="submit" size="lg" className="w-full" disabled={authLoading}>
            {authLoading ? <Spinner size="sm" /> : authTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
