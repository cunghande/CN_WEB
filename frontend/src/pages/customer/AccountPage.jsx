import React, { useEffect, useState } from 'react';
import { Camera, KeyRound, MapPin, Moon, Save, Sun, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import { createAddressAPI, deleteAddressAPI, getAddressesAPI } from '../../services/addressService.js';
import { changePasswordAPI, updateAvatarAPI, updateProfileAPI } from '../../services/authService.js';
import { getDistrictsAPI, getProvincesAPI, getWardsAPI } from '../../services/locationService.js';
import { markAllNotificationsReadAPI } from '../../services/notificationService.js';
import { setTheme, updateUser } from '../../redux/slices/authSlice.js';
import { fetchNotifications } from '../../redux/slices/notificationSlice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { useSelector } from 'react-redux';

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

const AccountPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', theme_preference: user?.theme_preference || 'light' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState(emptyAddress);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const refreshAddresses = async () => {
    const res = await getAddressesAPI();
    setAddresses(res.data || []);
  };

  useEffect(() => {
    const load = async () => {
      const [provinceRes] = await Promise.all([getProvincesAPI(), refreshAddresses(), dispatch(fetchNotifications())]);
      setProvinces(provinceRes.data || []);
    };
    load();
  }, [dispatch]);

  const handleProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfileAPI(profile);
      dispatch(updateUser(res.data));
      dispatch(setTheme(res.data.theme_preference || 'light'));
      setMessage('Đã lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await updateAvatarAPI(formData);
    dispatch(updateUser(res.data));
    setMessage('Đã cập nhật ảnh đại diện');
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    await changePasswordAPI(passwords);
    setPasswords({ current_password: '', new_password: '' });
    setMessage('Đã đổi mật khẩu');
  };

  const handleProvince = async (event) => {
    const selected = provinces.find((item) => String(item.code) === event.target.value);
    setAddress({ ...address, province_code: String(selected.code), province_name: selected.name, district_code: '', district_name: '', ward_code: '', ward_name: '' });
    const res = await getDistrictsAPI(selected.code);
    setDistricts(res.data || []);
    setWards([]);
  };

  const handleDistrict = async (event) => {
    const selected = districts.find((item) => String(item.code) === event.target.value);
    setAddress({ ...address, district_code: String(selected.code), district_name: selected.name, ward_code: '', ward_name: '' });
    const res = await getWardsAPI(selected.code);
    setWards(res.data || []);
  };

  const handleWard = (event) => {
    const selected = wards.find((item) => String(item.code) === event.target.value);
    setAddress({ ...address, ward_code: String(selected.code), ward_name: selected.name });
  };

  const handleAddress = async (event) => {
    event.preventDefault();
    await createAddressAPI(address);
    setAddress(emptyAddress);
    await refreshAddresses();
    setMessage('Đã thêm địa chỉ giao hàng');
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddressAPI(id);
    await refreshAddresses();
  };

  const handleReadAll = async () => {
    await markAllNotificationsReadAPI();
    dispatch(fetchNotifications());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-premium-700 dark:text-premium-300">Tài khoản</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Trung tâm cá nhân</h1>
          {message && <p className="mt-2 text-sm font-bold text-emerald-600">{message}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <img src={getImageUrl(user?.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')} alt={user?.full_name} className="h-20 w-20 rounded-full object-cover" />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-premium-700 px-3 py-2 text-sm font-bold text-white">
                <Camera className="h-4 w-4" />
                Đổi avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            </div>

            <form onSubmit={handleProfile} className="mt-6 space-y-4">
              <input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Họ tên" />
              <input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Số điện thoại" />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setProfile({ ...profile, theme_preference: 'light' })} className={`rounded-md border p-3 text-sm font-bold ${profile.theme_preference === 'light' ? 'border-premium-700 bg-premium-50 text-premium-800' : 'border-slate-200 dark:border-slate-700 dark:text-white'}`}>
                  <Sun className="mx-auto mb-1 h-4 w-4" /> Sáng
                </button>
                <button type="button" onClick={() => setProfile({ ...profile, theme_preference: 'dark' })} className={`rounded-md border p-3 text-sm font-bold ${profile.theme_preference === 'dark' ? 'border-premium-700 bg-premium-50 text-premium-800' : 'border-slate-200 dark:border-slate-700 dark:text-white'}`}>
                  <Moon className="mx-auto mb-1 h-4 w-4" /> Tối
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? <Spinner size="sm" /> : <><Save className="h-4 w-4" /> Lưu hồ sơ</>}</Button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white"><MapPin className="h-5 w-5" /> Địa chỉ giao hàng</h2>
            <form onSubmit={handleAddress} className="mt-5 grid gap-3 md:grid-cols-2">
              <input value={address.receiver_name} onChange={(e) => setAddress({ ...address, receiver_name: e.target.value })} required placeholder="Người nhận" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={address.receiver_phone} onChange={(e) => setAddress({ ...address, receiver_phone: e.target.value })} required placeholder="Số điện thoại" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
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
              <input value={address.hamlet} onChange={(e) => setAddress({ ...address, hamlet: e.target.value })} placeholder="Thôn/ấp/tổ" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={address.address_line} onChange={(e) => setAddress({ ...address, address_line: e.target.value })} required placeholder="Số nhà, tên đường" className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white md:col-span-2" />
              <Button type="submit" className="md:col-span-2">Thêm địa chỉ</Button>
            </form>

            <div className="mt-5 space-y-3">
              {addresses.map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <div className="font-black text-slate-950 dark:text-white">{item.receiver_name} - {item.receiver_phone}</div>
                    <div>{item.address_line}, {item.hamlet && `${item.hamlet}, `}{item.ward_name}, {item.district_name}, {item.province_name}</div>
                  </div>
                  <button onClick={() => handleDeleteAddress(item.id)} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white"><KeyRound className="h-5 w-5" /> Bảo mật</h2>
            <form onSubmit={handlePassword} className="mt-5 space-y-3">
              <input type="password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} placeholder="Mật khẩu hiện tại" className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="Mật khẩu mới" className="w-full rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <Button type="submit" className="w-full">Đổi mật khẩu</Button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Thông báo đơn hàng</h2>
              <Button variant="outline" size="sm" onClick={handleReadAll}>Đánh dấu đã đọc</Button>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className={`rounded-lg border p-4 text-sm ${item.is_read ? 'border-slate-200 dark:border-slate-700' : 'border-premium-200 bg-premium-50 dark:bg-premium-900/20'}`}>
                  <div className="font-black text-slate-950 dark:text-white">{item.title}</div>
                  <div className="text-slate-600 dark:text-slate-300">{item.message}</div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-slate-500">Chưa có thông báo.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
