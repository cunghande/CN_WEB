import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, Eye, EyeOff, Gift, Heart, KeyRound, Lock, Mail, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useProduct from '../../hooks/useProduct.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { loginSuccess } from '../../redux/slices/authSlice.js';
import { forgotPasswordAPI, getSocialLoginUrl, loginAPI, registerAPI, resetPasswordAPI } from '../../services/authService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

const heroSlides = [
  {
    title: 'Tủ đồ hiện đại cho mỗi ngày',
    subtitle: 'Chọn nhanh outfit, săn voucher và theo dõi đơn hàng trong một trải nghiệm mua sắm gọn gàng như sàn thương mại điện tử.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=85'
  },
  {
    title: 'Streetwear, officewear và phụ kiện',
    subtitle: 'Sản phẩm được chia danh mục rõ, có biến thể size màu, tồn kho, đánh giá và bình luận sau khi mua.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1920&q=85'
  },
  {
    title: 'Mua nhiều hơn, tiết kiệm hơn',
    subtitle: 'Voucher theo nhiệm vụ: mua 3 món nhận freeship, đơn từ 1 triệu giảm sâu, user mới có quà chào mừng.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85'
  }
];

const categories = [
  { id: 1, name: 'Nam', label: 'Áo khoác, sơ mi, quần dài', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80' },
  { id: 2, name: 'Nữ', label: 'Váy, blazer, outfit hằng ngày', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
  { id: 7, name: 'Thể thao', label: 'Đồ tập, hoodie, quần jogger', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80' },
  { id: 9, name: 'Giày & phụ kiện', label: 'Sneaker, túi, nón, thắt lưng', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' }
];

const SocialIcon = ({ provider }) => provider === 'google'
  ? <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-black text-[#4285F4]">G</span>
  : <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1877F2] text-sm font-black text-white">f</span>;

const HomePage = () => {
  const { products, loading } = useProduct();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSlide, setActiveSlide] = useState(0);
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [resetStep, setResetStep] = useState('request');
  const [resetOtp, setResetOtp] = useState('');

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setAuthModal(true);
      setAuthTab('login');
      setAuthSuccess('');
      setResetStep('request');
      setResetOtp('');
      const socialError = searchParams.get('social_error');
      if (socialError) setAuthError(socialError);
      searchParams.delete('login');
      searchParams.delete('social_error');
      setSearchParams(searchParams);
    }

    const socialToken = searchParams.get('social_token');
    const socialUser = searchParams.get('social_user');
    if (socialToken && socialUser) {
      try {
        const user = JSON.parse(decodeURIComponent(socialUser));
        dispatch(loginSuccess({ token: socialToken, user }));
        searchParams.delete('social_token');
        searchParams.delete('social_user');
        setSearchParams(searchParams);
        setAuthModal(false);
      } catch {
        setAuthError('Không thể hoàn tất đăng nhập mạng xã hội');
        setAuthModal(true);
      }
    }
  }, [dispatch, searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const bestProduct = featuredProducts[0];
  const slide = heroSlides[activeSlide];

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authTab === 'forgot') {
        if (resetStep === 'request') {
          const res = await forgotPasswordAPI(email);
          setAuthSuccess(res.message || 'Nếu email tồn tại, mã OTP đã được gửi về email.');
          setResetStep('verify');
          setResetOtp('');
          setPassword('');
          setConfirmPassword('');
          return;
        }

        if (password !== confirmPassword) {
          setAuthError('Mật khẩu xác nhận không khớp');
          return;
        }

        const res = await resetPasswordAPI({ email, otp: resetOtp, new_password: password });
        setAuthSuccess(res.message || 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.');
        setResetStep('request');
        setResetOtp('');
        setPassword('');
        setConfirmPassword('');
        setAuthTab('login');
        return;
      }

      if (authTab === 'register' && password !== confirmPassword) {
        setAuthError('Mật khẩu xác nhận không khớp');
        return;
      }

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

  const handleSocialLogin = (provider) => {
    setAuthError('');
    setAuthSuccess('');
    window.location.href = getSocialLoginUrl(provider);
  };

  const switchAuthTab = (tab) => {
    setAuthTab(tab);
    setAuthError('');
    setAuthSuccess('');
    setResetStep('request');
    setResetOtp('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-[#f6f3ee] text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden bg-slate-950">
        {heroSlides.map((item, index) => (
          <img key={item.image} src={item.image} alt={item.title} className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${index === activeSlide ? 'opacity-55 scale-100' : 'opacity-0 scale-105'}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/86 to-slate-950/18" />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
          <div className="max-w-2xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase text-emerald-200 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              New retail experience
            </div>
            <h1 className="text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">{slide.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">{slide.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products"><Button size="lg" className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">Mua ngay <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/events"><Button variant="outline" size="lg" className="border-white/25 bg-white/10 text-white hover:bg-white/20"><Gift className="h-4 w-4" />Săn voucher</Button></Link>
              {!isAuthenticated && <Button variant="outline" size="lg" className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={() => setAuthModal(true)}>Đăng nhập</Button>}
            </div>
            <div className="mt-10 flex gap-2">
              {heroSlides.map((item, index) => <button key={item.title} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition ${index === activeSlide ? 'w-10 bg-emerald-300' : 'w-2.5 bg-white/45 hover:bg-white/75'}`} aria-label={`Chuyển slide ${index + 1}`} />)}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-white text-slate-950">
                <img src={getImageUrl(bestProduct?.image_url, fallbackImage)} alt={bestProduct?.name || 'LuxuryWear'} className="aspect-[4/5] w-full object-cover object-top" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-950">Hot pick</div>
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-slate-950/86 p-4 text-white backdrop-blur">
                  <div className="line-clamp-1 text-lg font-black">{bestProduct?.name || 'Sản phẩm nổi bật'}</div>
                  <div className="mt-1 flex items-center justify-between text-sm text-slate-300">
                    <span>{bestProduct ? formatPrice(bestProduct.base_price) : 'Đang cập nhật'}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{Number(bestProduct?.rating_avg || 5).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Truck, title: 'Giao COD theo địa chỉ', desc: 'Tính phí ship theo tỉnh, huyện, xã/phường đã lưu.' },
            { icon: Gift, title: 'Voucher theo nhiệm vụ', desc: 'Mua 3 món, user mới, đơn lớn đều có mã riêng.' },
            { icon: ShieldCheck, title: 'Theo dõi sau mua', desc: 'Đơn hàng, thông báo, đánh giá và bình luận rõ ràng.' }
          ].map((item) => <div key={item.title} className="flex gap-4 rounded-3xl border border-white bg-white/76 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-slate-950 text-emerald-300 dark:bg-white dark:text-slate-950"><item.icon className="h-5 w-5" /></div><div><h3 className="font-black text-slate-950 dark:text-white">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.desc}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-300">Danh mục nổi bật</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Chọn phong cách của bạn</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-black text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sm:inline-flex">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => <Link key={category.id} to={`/products?category=${category.id}`} className="group relative overflow-hidden rounded-3xl bg-slate-900 shadow-sm"><img src={category.image} alt={category.name} className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/10 to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white"><h3 className="text-2xl font-black">{category.name}</h3><p className="mt-1 text-sm text-slate-200">{category.label}</p></div></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-300">Đang được quan tâm</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Sản phẩm mới trong kho</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-black text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Khám phá thêm <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {loading ? <div className="py-20"><Spinner size="lg" /></div> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const stock = getProductStock(product);
              return <Link key={product.id} to={`/products/${product.id}`} className="group overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"><div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800"><img src={getImageUrl(product.image_url, fallbackImage)} alt={product.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" /><div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-black uppercase text-slate-700 dark:bg-slate-950/86 dark:text-slate-200">{product.category_name || 'Thời trang'}</div><div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-slate-950/82 px-3 py-1.5 text-xs font-black text-white"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(product.rating_avg || 0).toFixed(1)}</div></div><div className="space-y-3 p-4"><div><h3 className="line-clamp-1 font-black text-slate-950 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{product.name}</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Còn {stock} sản phẩm · {product.like_count || 0} lượt thích</p></div><div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800"><span className="font-black text-slate-950 dark:text-white">{formatPrice(product.base_price)}</span><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white group-hover:bg-emerald-500 group-hover:text-slate-950 dark:bg-white dark:text-slate-950"><ShoppingBag className="h-4 w-4" /></span></div></div></Link>;
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-10"><div className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950"><Gift className="h-4 w-4" />Voucher hub</div><h2 className="mt-5 text-3xl font-black sm:text-4xl">Hoàn thành nhiệm vụ để nhận ưu đãi tốt hơn</h2><p className="mt-3 text-sm leading-7 text-slate-300">Trang sự kiện giúp user săn mã theo hành vi mua hàng: user mới, mua nhiều sản phẩm, đơn trên 1 triệu hoặc combo đủ bộ.</p><Link to="/events" className="mt-6 inline-flex"><Button className="bg-white text-slate-950 hover:bg-slate-200">Đi săn voucher <ArrowRight className="h-4 w-4" /></Button></Link></div>
          <div className="grid grid-cols-2 gap-3 bg-white/5 p-5 sm:p-8"><div className="rounded-3xl bg-white p-5 text-slate-950"><div className="text-sm font-black text-emerald-700">BUY3SHIP</div><div className="mt-2 text-2xl font-black">Freeship</div><p className="mt-1 text-sm text-slate-500">Mua 3 sản phẩm bất kỳ</p></div><div className="rounded-3xl bg-emerald-400 p-5 text-slate-950"><div className="text-sm font-black">MILLION30</div><div className="mt-2 text-2xl font-black">Giảm 30%</div><p className="mt-1 text-sm text-slate-800">Đơn từ 1.000.000đ</p></div><div className="rounded-3xl bg-amber-300 p-5 text-slate-950"><div className="text-sm font-black">NEW30</div><div className="mt-2 text-2xl font-black">User mới</div><p className="mt-1 text-sm text-slate-800">Quà chào mừng</p></div><div className="rounded-3xl bg-white/10 p-5 text-white"><div className="text-sm font-black text-emerald-200">STYLE25</div><div className="mt-2 text-2xl font-black">Combo</div><p className="mt-1 text-sm text-slate-300">Phối đủ bộ tiết kiệm</p></div></div>
        </div>
      </section>

      <Modal isOpen={authModal} onClose={() => setAuthModal(false)} title="">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/86 to-slate-950/35" /><div className="relative"><p className="text-xs font-black uppercase text-emerald-200">LuxuryWear Account</p><h2 className="mt-2 text-2xl font-black">{authTab === 'forgot' ? 'Khôi phục mật khẩu' : authTab === 'login' ? 'Chào mừng quay lại' : 'Tạo tài khoản mua sắm'}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">{authTab === 'forgot' ? 'Nhập email để nhận mã OTP 6 số, sau đó tạo mật khẩu mới.' : 'Theo dõi đơn hàng, lưu địa chỉ, nhận thông báo và săn voucher cá nhân.'}</p></div></div>
        <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950"><button type="button" onClick={() => switchAuthTab('login')} className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${authTab === 'login' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Đăng nhập</button><button type="button" onClick={() => switchAuthTab('register')} className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${authTab === 'register' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Đăng ký</button></div>
          {authError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-200">{authError}</div>}
          {authSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200">{authSuccess}</div>}
          {authTab !== 'forgot' && <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => handleSocialLogin('google')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><SocialIcon provider="google" />Google</button><button type="button" onClick={() => handleSocialLogin('facebook')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><SocialIcon provider="facebook" />Facebook</button></div>}
          {authTab === 'register' && <label className="block"><span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Họ và tên</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"><User className="h-5 w-5 text-slate-400" /><input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ví dụ: Nguyễn Văn A" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" /></div></label>}
          <label className="block"><span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Email</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"><Mail className="h-5 w-5 text-slate-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" /></div></label>
          {authTab === 'forgot' && resetStep === 'verify' && <label className="block"><span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Mã OTP</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"><KeyRound className="h-5 w-5 text-slate-400" /><input required value={resetOtp} onChange={(event) => setResetOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Nhập 6 số OTP" inputMode="numeric" className="w-full bg-transparent text-sm font-semibold tracking-[0.35em] text-slate-900 outline-none dark:text-white" /></div></label>}
          {(authTab !== 'forgot' || resetStep === 'verify') && <label className="block"><span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">{authTab === 'forgot' ? 'Mật khẩu mới' : 'Mật khẩu'}</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"><Lock className="h-5 w-5 text-slate-400" /><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authTab === 'forgot' ? 'Tạo mật khẩu mới' : 'Nhập mật khẩu'} className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>}
          {authTab === 'login' && <button type="button" onClick={() => switchAuthTab('forgot')} className="-mt-2 inline-flex text-sm font-black text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">Quên mật khẩu?</button>}
          {authTab === 'forgot' && <button type="button" onClick={() => switchAuthTab('login')} className="-mt-2 inline-flex text-sm font-black text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Quay lại đăng nhập</button>}
          {(authTab === 'register' || (authTab === 'forgot' && resetStep === 'verify')) && <label className="block"><span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Xác nhận mật khẩu</span><div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"><Lock className="h-5 w-5 text-slate-400" /><input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" /></div></label>}
          <Button type="submit" size="lg" className="w-full" disabled={authLoading}>{authLoading ? <Spinner size="sm" /> : authTab === 'forgot' ? (resetStep === 'request' ? 'Gửi mã OTP' : 'Đặt lại mật khẩu') : authTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
