import React, { useEffect, useState } from 'react';
import { CalendarDays, ShieldCheck, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Spinner from '../../components/common/Spinner.jsx';
import { getPublicUserProfileAPI } from '../../services/authService.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const genderLabel = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
  unspecified: 'Chưa cập nhật'
};

const PublicProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const response = await getPublicUserProfileAPI(id);
      setProfile(response.data);
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  if (loading) return <div className="py-24"><Spinner size="lg" /></div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-32 bg-gradient-to-r from-premium-700 via-slate-900 to-rose-700" />
          <div className="px-6 pb-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
              {profile.avatar_url ? (
                <img src={getImageUrl(profile.avatar_url)} alt={profile.full_name} className="h-28 w-28 rounded-full border-4 border-white object-cover dark:border-slate-900" />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-slate-100 text-slate-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                  <UserRound className="h-11 w-11" />
                </div>
              )}
              <div className="pb-2">
                <h1 className="text-3xl font-black text-slate-950 dark:text-white">{profile.full_name}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                  Hồ sơ công khai
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Giới tính</div>
                <div className="mt-1 font-bold text-slate-900 dark:text-white">{genderLabel[profile.gender] || genderLabel.unspecified}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4" />
                  Tham gia
                </div>
                <div className="mt-1 font-bold text-slate-900 dark:text-white">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                </div>
              </div>
            </div>

            <p className="mt-5 rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Email, số điện thoại và địa chỉ giao hàng được ẩn để bảo vệ quyền riêng tư của người dùng.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicProfilePage;
