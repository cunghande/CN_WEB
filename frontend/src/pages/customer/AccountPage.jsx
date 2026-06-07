import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Camera, CheckCircle2, ChevronRight, KeyRound, MapPin, PackageCheck, Save, Star, Trash2, UserRound } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import { createAddressAPI, deleteAddressAPI, getAddressesAPI } from '../../services/addressService.js';
import { changePasswordAPI, updateAvatarAPI, updateProfileAPI } from '../../services/authService.js';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '../../services/locationService.js';
import { markAllNotificationsReadAPI, markNotificationReadAPI } from '../../services/notificationService.js';
import { addProductCommentAPI, addProductReviewAPI } from '../../services/productService.js';
import { updateUser } from '../../redux/slices/authSlice.js';
import { fetchNotifications } from '../../redux/slices/notificationSlice.js';
import { isStrongEnoughPassword, normalizePhone, normalizeText, validateAddress, validateProfile, validateReview } from '../../utils/validation.js';

const emptyAddress = {
  receiver_name: '',
  receiver_phone: '',
  province_code: '',
  province_name: '',
  district_code: '',
  district_name: '',
  ward_code: '',
  ward_name: '',
  hamlet: '',
  address_line: '',
  is_default: true
};

const tabs = [
  { id: 'profile', label: 'Thông tin cá nhân', path: '/account/profile', icon: UserRound },
  { id: 'addresses', label: 'Địa chỉ giao hàng', path: '/account/addresses', icon: MapPin },
  { id: 'security', label: 'Đổi mật khẩu', path: '/account/security', icon: KeyRound },
  { id: 'notifications', label: 'Thông báo', path: '/account/notifications', icon: Bell }
];

const genderOptions = [
  { value: 'unspecified', label: 'Chưa cập nhật' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' }
];

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-premium-600 focus:ring-2 focus:ring-premium-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-premium-900/40';

const ReviewStarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="rounded-2xl p-1 text-amber-400 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-label={`Chọn ${star} sao`}
      >
        <Star className={`h-8 w-8 ${star <= value ? 'fill-current' : 'fill-transparent'}`} />
      </button>
    ))}
  </div>
);

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

const SectionShell = ({ title, description, children, action }) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const AccountPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.notifications.items);
  const activeTab = useMemo(() => tabs.find((tab) => location.pathname.includes(tab.id))?.id || 'profile', [location.pathname]);

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'unspecified'
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState(emptyAddress);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, content: '', image: null });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const refreshAddresses = async () => {
    const response = await getAddressesAPI();
    setAddresses(response.data || []);
  };

  useEffect(() => {
    setProfile({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      gender: user?.gender || 'unspecified'
    });
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      const [provinceRes] = await Promise.all([getProvincesAPI(), refreshAddresses(), dispatch(fetchNotifications())]);
      setProvinces(provinceRes.data || []);
    };
    load();
  }, [dispatch]);

  const showMessage = (text) => {
    setError('');
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const handleProfile = async (event) => {
    event.preventDefault();
    const validationError = validateProfile(profile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const response = await updateProfileAPI({
        ...profile,
        full_name: normalizeText(profile.full_name),
        phone: normalizePhone(profile.phone),
        theme_preference: user?.theme_preference || 'light'
      });
      dispatch(updateUser(response.data));
      showMessage('Đã lưu thông tin cá nhân');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await updateAvatarAPI(formData);
    dispatch(updateUser(response.data));
    showMessage('Đã cập nhật ảnh đại diện');
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passwords.current_password === passwords.new_password) {
      setError('Mật khẩu mới không được trùng mật khẩu hiện tại.');
      return;
    }
    if (!isStrongEnoughPassword(passwords.new_password)) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự, gồm cả chữ và số.');
      return;
    }
    await changePasswordAPI({
      current_password: passwords.current_password,
      new_password: passwords.new_password
    });
    setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    showMessage('Đã đổi mật khẩu');
  };

  const handleProvince = async (event) => {
    const selected = provinces.find((item) => String(item.code) === event.target.value);
    if (!selected) return;
    setAddress({ ...address, province_code: String(selected.code), province_name: selected.name, district_code: '', district_name: '', ward_code: '', ward_name: '' });
    const response = await getDistrictsAPI(selected.code);
    setDistricts(response.data || []);
    setWards([]);
  };

  const handleDistrict = async (event) => {
    const selected = districts.find((item) => String(item.code) === event.target.value);
    if (!selected) return;
    setAddress({ ...address, district_code: String(selected.code), district_name: selected.name, ward_code: '', ward_name: '' });
    const response = await getWardsAPI(selected.code);
    setWards(response.data || []);
  };

  const handleWard = (event) => {
    const selected = wards.find((item) => String(item.code) === event.target.value);
    if (!selected) return;
    setAddress({ ...address, ward_code: String(selected.code), ward_name: selected.name });
  };

  const handleAddress = async (event) => {
    event.preventDefault();
    const validationError = validateAddress(address);
    if (validationError) {
      setError(validationError);
      return;
    }
    await createAddressAPI({
      ...address,
      receiver_name: normalizeText(address.receiver_name),
      receiver_phone: normalizePhone(address.receiver_phone),
      hamlet: normalizeText(address.hamlet),
      address_line: normalizeText(address.address_line)
    });
    setAddress(emptyAddress);
    setDistricts([]);
    setWards([]);
    await refreshAddresses();
    showMessage('Đã thêm địa chỉ giao hàng');
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddressAPI(id);
    await refreshAddresses();
  };

  const handleReadAll = async () => {
    await markAllNotificationsReadAPI();
    dispatch(fetchNotifications());
  };

  const handleNotificationClick = async (notification) => {
    await markNotificationReadAPI(notification.id);
    dispatch(fetchNotifications());
    const reviewProductId = getReviewProductId(notification);
    if (reviewProductId) {
      setReviewRequest({ ...notification, entity_id: reviewProductId });
      setReviewDraft({ rating: 5, content: '', image: null });
      setReviewError('');
      return;
    }
    if (notification.target_url) navigate(notification.target_url);
  };

  const handleSubmitReviewRequest = async (event) => {
    event.preventDefault();
    if (!reviewRequest?.entity_id) return;

    const validationError = validateReview(reviewDraft);
    if (validationError) {
      setReviewError(validationError);
      return;
    }
    const content = normalizeText(reviewDraft.content);

    const formData = new FormData();
    formData.append('rating', String(reviewDraft.rating));
    formData.append('content', content);
    if (reviewDraft.image) formData.append('image', reviewDraft.image);

    setReviewSubmitting(true);
    setReviewError('');
    try {
      await addProductReviewAPI(reviewRequest.entity_id, formData);
      const commentResponse = await addProductCommentAPI(reviewRequest.entity_id, content);
      const commentId = commentResponse?.data?.id;
      setReviewRequest(null);
      navigate(`/products/${reviewRequest.entity_id}${commentId ? `#comment-${commentId}` : '#comments'}`);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#f6f3ee] py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,167,119,0.35),transparent_34%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,1))]" />
            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <Avatar src={user?.avatar_url} name={user?.full_name} size="lg" className="h-20 w-20 border-4 border-white/20" />
                <div>
                  <p className="text-sm font-bold uppercase text-emerald-200">Tài khoản của tôi</p>
                  <h1 className="mt-1 text-3xl font-black">{user?.full_name || 'Khách hàng'}</h1>
                  <p className="mt-1 text-sm text-slate-300">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-3xl bg-white/10 px-4 py-3 backdrop-blur">
                  <PackageCheck className="mx-auto h-5 w-5 text-emerald-200" />
                  <div className="mt-1 text-xs font-bold text-slate-200">Đơn hàng</div>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 backdrop-blur">
                  <MapPin className="mx-auto h-5 w-5 text-emerald-200" />
                  <div className="mt-1 text-xs font-bold text-slate-200">{addresses.length} địa chỉ</div>
                </div>
                <div className="rounded-3xl bg-white/10 px-4 py-3 backdrop-blur">
                  <Bell className="mx-auto h-5 w-5 text-emerald-200" />
                  <div className="mt-1 text-xs font-bold text-slate-200">{notifications.filter((item) => !item.is_read).length} mới</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(message || error) && (
          <div className={`mb-5 rounded-3xl border px-4 py-3 text-sm font-bold ${error ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
            {error || message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="h-max rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                        : 'text-slate-600 hover:bg-[#f6f3ee] hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3"><Icon className="h-4 w-4" /> {tab.label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div>
            {activeTab === 'profile' && (
              <SectionShell title="Thông tin cá nhân" description="Thông tin này dùng cho hồ sơ công khai và hỗ trợ chăm sóc khách hàng.">
                <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-[#f6f3ee] p-4 dark:bg-slate-950 sm:flex-row sm:items-center">
                  <Avatar src={user?.avatar_url} name={user?.full_name} size="xl" />
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                      <Camera className="h-4 w-4" />
                      Đổi avatar
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    </label>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Email được dùng để đăng nhập nên không chỉnh tại đây.</p>
                  </div>
                </div>

                <form onSubmit={handleProfile} className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Họ tên</span>
                    <input value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Số điện thoại</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={profile.phone || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, phone: normalizePhone(event.target.value).slice(0, 10) }))}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Giới tính</span>
                    <select value={profile.gender || 'unspecified'} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value }))} className={inputClass}>
                      {genderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Email</span>
                    <input value={user?.email || ''} disabled className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`} />
                  </label>
                  <Button type="submit" disabled={loading} className="md:col-span-2 md:w-max">
                    {loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Lưu thông tin</>}
                  </Button>
                </form>
              </SectionShell>
            )}

            {activeTab === 'addresses' && (
              <SectionShell title="Địa chỉ giao hàng" description="Địa chỉ đầy đủ giúp checkout tính phí ship và giao hàng chính xác.">
                <form onSubmit={handleAddress} className="grid gap-3 md:grid-cols-2">
                  <input value={address.receiver_name} onChange={(event) => setAddress({ ...address, receiver_name: event.target.value })} required placeholder="Người nhận" className={inputClass} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={address.receiver_phone}
                    onChange={(event) => setAddress({ ...address, receiver_phone: normalizePhone(event.target.value).slice(0, 10) })}
                    required
                    placeholder="Số điện thoại"
                    className={inputClass}
                  />
                  <select value={address.province_code} onChange={handleProvince} required className={inputClass}>
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <select value={address.district_code} onChange={handleDistrict} required className={inputClass}>
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <select value={address.ward_code} onChange={handleWard} required className={inputClass}>
                    <option value="">Chọn xã/phường</option>
                    {wards.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <input value={address.hamlet} onChange={(event) => setAddress({ ...address, hamlet: event.target.value })} placeholder="Thôn/ấp/tổ" className={inputClass} />
                  <input value={address.address_line} onChange={(event) => setAddress({ ...address, address_line: event.target.value })} required placeholder="Số nhà, tên đường" className={`${inputClass} md:col-span-2`} />
                  <Button type="submit" className="md:col-span-2 md:w-max">Thêm địa chỉ</Button>
                </form>

                <div className="mt-6 space-y-3">
                  {addresses.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <div className="font-black text-slate-950 dark:text-white">{item.receiver_name} - {item.receiver_phone}</div>
                        <div>{item.address_line}, {item.hamlet && `${item.hamlet}, `}{item.ward_name}, {item.district_name}, {item.province_name}</div>
                      </div>
                      <button onClick={() => handleDeleteAddress(item.id)} className="rounded-2xl p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {addresses.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Bạn chưa có địa chỉ giao hàng.</p>}
                </div>
              </SectionShell>
            )}

            {activeTab === 'security' && (
              <SectionShell title="Đổi mật khẩu" description="Mật khẩu mới cần tối thiểu 6 ký tự.">
                <form onSubmit={handlePassword} className="max-w-xl space-y-4">
                  <input type="password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} placeholder="Mật khẩu hiện tại" className={inputClass} />
                  <input type="password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} placeholder="Mật khẩu mới" className={inputClass} />
                  <input type="password" value={passwords.confirm_password} onChange={(event) => setPasswords({ ...passwords, confirm_password: event.target.value })} placeholder="Nhập lại mật khẩu mới" className={inputClass} />
                  <Button type="submit">Đổi mật khẩu</Button>
                </form>
              </SectionShell>
            )}

            {activeTab === 'notifications' && (
              <SectionShell title="Thông báo" description="Theo dõi cập nhật đơn hàng và tương tác sản phẩm." action={<Button variant="outline" size="sm" onClick={handleReadAll}>Đánh dấu đã đọc</Button>}>
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <button key={item.id} onClick={() => handleNotificationClick(item)} className={`block w-full rounded-3xl border p-4 text-left text-sm transition hover:bg-[#f6f3ee] dark:hover:bg-slate-800 ${item.is_read ? 'border-slate-200 dark:border-slate-700' : 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                      <div className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
                        {!item.is_read && <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />}
                        {item.title}
                      </div>
                      <div className="mt-1 text-slate-600 dark:text-slate-300">{item.message}</div>
                      {item.actor_name && <div className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Từ: {item.actor_name}</div>}
                    </button>
                  ))}
                  {notifications.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có thông báo.</p>}
                </div>
              </SectionShell>
            )}
          </div>
        </div>
      </div>
    </div>
    <Modal
      isOpen={Boolean(reviewRequest)}
      onClose={() => setReviewRequest(null)}
      title="Đánh giá sản phẩm"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmitReviewRequest} className="space-y-5">
        <div>
          <div className="text-sm font-black text-slate-700 dark:text-slate-200">Chất lượng sản phẩm</div>
          <div className="mt-2">
            <ReviewStarPicker
              value={reviewDraft.rating}
              onChange={(rating) => setReviewDraft((draft) => ({ ...draft, rating }))}
            />
          </div>
        </div>

        <textarea
          value={reviewDraft.content}
          onChange={(event) => setReviewDraft((draft) => ({ ...draft, content: event.target.value }))}
          placeholder="Chia sẻ cảm nhận về chất vải, form dáng, màu sắc hoặc trải nghiệm sử dụng..."
          className="min-h-32 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800">
          <Camera className="h-5 w-5" />
          <span className="min-w-0 flex-1 truncate">{reviewDraft.image?.name || 'Upload ảnh phản ánh nếu có'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setReviewDraft((draft) => ({ ...draft, image: event.target.files?.[0] || null }))}
          />
        </label>

        {reviewError && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            {reviewError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>Để sau</Button>
          <Button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</Button>
        </div>
      </form>
    </Modal>
    </>
  );
};

export default AccountPage;

