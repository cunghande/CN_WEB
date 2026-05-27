import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Camera, ChevronRight, KeyRound, MapPin, Moon, Save, Sun, Trash2, UserRound } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import { createAddressAPI, deleteAddressAPI, getAddressesAPI } from '../../services/addressService.js';
import { changePasswordAPI, updateAvatarAPI, updateProfileAPI } from '../../services/authService.js';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '../../services/locationService.js';
import { markAllNotificationsReadAPI, markNotificationReadAPI } from '../../services/notificationService.js';
import { setTheme, updateUser } from '../../redux/slices/authSlice.js';
import { fetchNotifications } from '../../redux/slices/notificationSlice.js';
import { getImageUrl } from '../../utils/imageUrl.js';

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

const AccountPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.notifications.items);
  const activeTab = useMemo(() => {
    const matched = tabs.find((tab) => location.pathname.includes(tab.id));
    return matched?.id || 'profile';
  }, [location.pathname]);

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'unspecified',
    theme_preference: user?.theme_preference || 'light'
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

  const refreshAddresses = async () => {
    const response = await getAddressesAPI();
    setAddresses(response.data || []);
  };

  useEffect(() => {
    setProfile({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      gender: user?.gender || 'unspecified',
      theme_preference: user?.theme_preference || 'light'
    });
  }, [user]);

  useEffect(() => {
    const load = async () => {
      const [provinceRes] = await Promise.all([
        getProvincesAPI(),
        refreshAddresses(),
        dispatch(fetchNotifications())
      ]);
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
    setLoading(true);
    try {
      const response = await updateProfileAPI(profile);
      dispatch(updateUser(response.data));
      dispatch(setTheme(response.data.theme_preference || 'light'));
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
    await createAddressAPI(address);
    setAddress(emptyAddress);
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
    if (notification.target_url) navigate(notification.target_url);
  };

  const SectionShell = ({ title, description, children }) => (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-premium-700 dark:text-premium-300">Tài khoản của tôi</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Trung tâm tài khoản</h1>
          {message && <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">{message}</p>}
          {error && <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-300">{error}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-max rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <img src={getImageUrl(user?.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')} alt={user?.full_name} className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="truncate font-black text-slate-950 dark:text-white">{user?.full_name}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-premium-50 text-premium-800 dark:bg-premium-500/15 dark:text-premium-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {tab.label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div>
            {activeTab === 'profile' && (
              <SectionShell title="Thông tin cá nhân" description="Quản lý thông tin hiển thị và tùy chọn giao diện của bạn.">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={getImageUrl(user?.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')} alt={user?.full_name} className="h-24 w-24 rounded-full object-cover" />
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-premium-700 px-4 py-2 text-sm font-bold text-white hover:bg-premium-800">
                      <Camera className="h-4 w-4" />
                      Đổi avatar
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    </label>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ảnh đại diện sẽ hiển thị ở bình luận, đánh giá và hồ sơ công khai.</p>
                  </div>
                </div>

                <form onSubmit={handleProfile} className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Họ tên</span>
                    <input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Số điện thoại</span>
                    <input value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Giới tính</span>
                    <select value={profile.gender || 'unspecified'} onChange={(event) => setProfile({ ...profile, gender: event.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                      <option value="unspecified">Chưa cập nhật</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </label>
                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Giao diện</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setProfile({ ...profile, theme_preference: 'light' })} className={`rounded-md border p-3 text-sm font-bold ${profile.theme_preference === 'light' ? 'border-premium-700 bg-premium-50 text-premium-800' : 'border-slate-200 dark:border-slate-700 dark:text-white'}`}>
                        <Sun className="mx-auto mb-1 h-4 w-4" /> Sáng
                      </button>
                      <button type="button" onClick={() => setProfile({ ...profile, theme_preference: 'dark' })} className={`rounded-md border p-3 text-sm font-bold ${profile.theme_preference === 'dark' ? 'border-premium-700 bg-premium-50 text-premium-800 dark:bg-premium-900/30 dark:text-premium-100' : 'border-slate-200 dark:border-slate-700 dark:text-white'}`}>
                        <Moon className="mx-auto mb-1 h-4 w-4" /> Tối
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="md:col-span-2 md:w-max">{loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Lưu thông tin</>}</Button>
                </form>
              </SectionShell>
            )}

            {activeTab === 'addresses' && (
              <SectionShell title="Địa chỉ giao hàng" description="Lưu địa chỉ nhận hàng đầy đủ tỉnh, huyện, xã/phường và thôn/tổ.">
                <form onSubmit={handleAddress} className="grid gap-3 md:grid-cols-2">
                  <input value={address.receiver_name} onChange={(event) => setAddress({ ...address, receiver_name: event.target.value })} required placeholder="Người nhận" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <input value={address.receiver_phone} onChange={(event) => setAddress({ ...address, receiver_phone: event.target.value })} required placeholder="Số điện thoại" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <select value={address.province_code} onChange={handleProvince} required className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <select value={address.district_code} onChange={handleDistrict} required className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <select value={address.ward_code} onChange={handleWard} required className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="">Chọn xã/phường</option>
                    {wards.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                  </select>
                  <input value={address.hamlet} onChange={(event) => setAddress({ ...address, hamlet: event.target.value })} placeholder="Thôn/ấp/tổ" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <input value={address.address_line} onChange={(event) => setAddress({ ...address, address_line: event.target.value })} required placeholder="Số nhà, tên đường" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white md:col-span-2" />
                  <Button type="submit" className="md:col-span-2 md:w-max">Thêm địa chỉ</Button>
                </form>

                <div className="mt-6 space-y-3">
                  {addresses.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <div className="font-black text-slate-950 dark:text-white">{item.receiver_name} - {item.receiver_phone}</div>
                        <div>{item.address_line}, {item.hamlet && `${item.hamlet}, `}{item.ward_name}, {item.district_name}, {item.province_name}</div>
                      </div>
                      <button onClick={() => handleDeleteAddress(item.id)} className="rounded-md p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {addresses.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa có địa chỉ giao hàng.</p>}
                </div>
              </SectionShell>
            )}

            {activeTab === 'security' && (
              <SectionShell title="Đổi mật khẩu" description="Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.">
                <form onSubmit={handlePassword} className="max-w-xl space-y-4">
                  <input type="password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} placeholder="Mật khẩu hiện tại" className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <input type="password" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} placeholder="Mật khẩu mới" className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <input type="password" value={passwords.confirm_password} onChange={(event) => setPasswords({ ...passwords, confirm_password: event.target.value })} placeholder="Nhập lại mật khẩu mới" className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <Button type="submit">Đổi mật khẩu</Button>
                </form>
              </SectionShell>
            )}

            {activeTab === 'notifications' && (
              <SectionShell title="Thông báo" description="Theo dõi cập nhật đơn hàng và tương tác sản phẩm.">
                <div className="mb-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleReadAll}>Đánh dấu đã đọc</Button>
                </div>
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <button key={item.id} onClick={() => handleNotificationClick(item)} className={`block w-full rounded-lg border p-4 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${item.is_read ? 'border-slate-200 dark:border-slate-700' : 'border-premium-200 bg-premium-50 dark:bg-premium-900/20'}`}>
                      <div className="font-black text-slate-950 dark:text-white">{item.title}</div>
                      <div className="mt-1 text-slate-600 dark:text-slate-300">{item.message}</div>
                      {item.actor_name && <div className="mt-1 text-xs font-bold text-premium-700 dark:text-premium-300">Từ: {item.actor_name}</div>}
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
  );
};

export default AccountPage;
