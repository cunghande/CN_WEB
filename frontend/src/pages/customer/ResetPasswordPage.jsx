import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { resetPasswordAPI } from '../../services/authService.js';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailFromLink = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromLink);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidLink = useMemo(() => Boolean(token), [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidLink) {
      setError('Link đặt lại mật khẩu không hợp lệ.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordAPI({ email, token, new_password: newPassword });
      setSuccess(res.message || 'Đặt lại mật khẩu thành công.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[76vh] bg-[#f6f3ee] px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/86 to-emerald-950/40" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase text-emerald-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Bảo mật tài khoản
            </div>
            <div>
              <h1 className="text-4xl font-black leading-tight">Đặt lại mật khẩu an toàn</h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200">
                Link xác nhận được gửi qua email và chỉ có hiệu lực trong thời gian ngắn.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-9">
          <div>
            <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300">LuxuryWear Account</p>
            <h2 className="mt-2 text-3xl font-black">Tạo mật khẩu mới</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Nhập email tài khoản và mật khẩu mới để hoàn tất khôi phục.
            </p>
          </div>

          {!isValidLink && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-200">
              Link đặt lại mật khẩu bị thiếu token. Vui lòng gửi lại yêu cầu quên mật khẩu.
            </div>
          )}
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-200">{error}</div>}
          {success && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />{success}</div>}

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950">
              <Mail className="h-5 w-5 text-slate-400" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Mật khẩu mới</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950">
              <Lock className="h-5 w-5 text-slate-400" />
              <input required type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-slate-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase text-slate-500 dark:text-slate-400">Xác nhận mật khẩu</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 focus-within:border-emerald-500 dark:border-slate-700 dark:bg-slate-950">
              <Lock className="h-5 w-5 text-slate-400" />
              <input required type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white" />
            </div>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={loading || !isValidLink}>
            {loading ? <Spinner size="sm" /> : 'Đặt lại mật khẩu'}
          </Button>
          <Link to="/?login=true" className="block text-center text-sm font-black text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            Quay lại đăng nhập
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
