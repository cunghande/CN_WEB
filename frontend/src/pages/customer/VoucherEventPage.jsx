import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Gift, LockKeyhole, ShoppingBag, Sparkles, TicketPercent, Truck } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import { claimCouponAPI, getEventCouponsAPI } from '../../services/couponService.js';
import { formatPrice } from '../../utils/formatPrice.js';

const typeLabel = {
  percent: 'Giảm giá đơn hàng',
  free_shipping: 'Miễn phí vận chuyển',
  shipping_percent: 'Giảm phí vận chuyển'
};

const getVoucherValue = (coupon) => {
  if (coupon.type === 'free_shipping') return 'Freeship';
  if (coupon.type === 'shipping_percent') return `Giảm ${Number(coupon.discount_percent || 0)}% ship`;
  return `Giảm ${Number(coupon.discount_percent || 0)}%`;
};

const VoucherEventPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { totalAmount, totalItems } = useCart();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState('');

  const context = useMemo(() => ({
    subtotal_amount: totalAmount,
    item_count: totalItems
  }), [totalAmount, totalItems]);

  const loadCoupons = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getEventCouponsAPI(context);
      setCoupons(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [isAuthenticated, context.subtotal_amount, context.item_count]);

  const handleClaim = async (coupon) => {
    if (!isAuthenticated) return navigate('/?login=true');
    setClaimingId(coupon.id);
    setMessage('');
    try {
      const res = await claimCouponAPI(coupon.id, context);
      setMessage(res.message || 'Đã lưu voucher vào ví của bạn.');
      await loadCoupons();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể nhận voucher lúc này.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.28),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.24),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Trung tâm săn voucher
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Làm nhiệm vụ, nhận mã giảm giá cho đơn hàng tiếp theo
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Voucher được lưu vào ví tài khoản. Khi thanh toán bạn có thể nhập mã thủ công hoặc mở ví voucher để chọn mã phù hợp nhất.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/cart">
                <Button size="lg" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                  <ShoppingBag className="h-5 w-5" />
                  Xem giỏ hàng
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Mua thêm sản phẩm
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-emerald-400 text-slate-950">
                <TicketPercent className="h-7 w-7" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-300">Tiến độ giỏ hàng hiện tại</div>
                <div className="text-2xl font-black">{formatPrice(totalAmount)}</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="text-xs font-bold uppercase text-slate-300">Số lượng</div>
                <div className="mt-1 text-2xl font-black">{totalItems}</div>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <div className="text-xs font-bold uppercase text-slate-300">Tài khoản</div>
                <div className="mt-1 truncate text-base font-black">{user?.full_name || 'Chưa đăng nhập'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <LockKeyhole className="mx-auto h-10 w-10 text-emerald-700 dark:text-emerald-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Đăng nhập để nhận voucher</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Voucher được gắn với tài khoản để tránh dùng nhầm hoặc dùng quá lượt.</p>
            <Link to="/?login=true" className="mt-5 inline-flex">
              <Button>Đăng nhập ngay</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-300">Nhiệm vụ đang mở</p>
                <h2 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Săn mã giảm giá</h2>
              </div>
              {message && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200">
                  {message}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid min-h-64 place-items-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {coupons.map((coupon) => {
                  const disabled = !coupon.can_claim || claimingId === coupon.id;
                  return (
                    <article key={coupon.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                      <div className="border-b border-slate-100 bg-[#f6f3ee] p-5 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                              <Gift className="h-4 w-4" />
                              {coupon.event_badge || typeLabel[coupon.type]}
                            </div>
                            <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{coupon.event_title || coupon.name}</h3>
                          </div>
                          <div className="rounded-3xl bg-emerald-500 px-3 py-2 text-right text-sm font-black text-slate-950">
                            {getVoucherValue(coupon)}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{coupon.event_description}</p>
                      </div>

                      <div className="space-y-4 p-5">
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded-3xl bg-[#f6f3ee] p-3 dark:bg-slate-950">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Điều kiện dùng</div>
                            <div className="mt-1 font-black text-slate-950 dark:text-white">Từ {formatPrice(coupon.min_order_amount)}</div>
                          </div>
                          <div className="rounded-3xl bg-[#f6f3ee] p-3 dark:bg-slate-950">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Còn hạn</div>
                            <div className="mt-1 font-black text-slate-950 dark:text-white">{coupon.remaining_days ?? '--'} ngày</div>
                          </div>
                          <div className="rounded-3xl bg-[#f6f3ee] p-3 dark:bg-slate-950">
                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Số lượng còn</div>
                            <div className="mt-1 font-black text-slate-950 dark:text-white">{coupon.remaining_uses !== null ? coupon.remaining_uses : 'Vô hạn'}</div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 p-3 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                            <Truck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                            {coupon.claim_requirement}
                          </div>
                          <div className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{coupon.claim_progress}</div>
                        </div>

                        {coupon.is_available ? (
                          <Button variant="secondary" className="w-full" disabled>
                            <CheckCircle2 className="h-4 w-4" />
                            Đã có trong ví voucher
                          </Button>
                        ) : coupon.requires_claim ? (
                          <Button className="w-full" onClick={() => handleClaim(coupon)} disabled={disabled}>
                            {claimingId === coupon.id ? <Spinner size="sm" /> : 'Nhận voucher'}
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" onClick={() => navigate(`/cart?voucher=${coupon.code}`)}>
                            Dùng mã {coupon.code}
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default VoucherEventPage;
