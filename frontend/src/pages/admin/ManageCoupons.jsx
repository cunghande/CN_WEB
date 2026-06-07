import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle, Edit, Plus, Search, TicketPercent, Trash2 } from 'lucide-react';
import { adminCreateCouponAPI, adminDeleteCouponAPI, adminGetCouponsAPI, adminUpdateCouponAPI } from '../../services/couponService.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatPrice } from '../../utils/formatPrice.js';

const blankForm = {
  code: '',
  name: '',
  type: 'percent',
  discount_percent: '10',
  max_discount_amount: '50000',
  min_order_amount: '100000',
  starts_at: '',
  expires_at: '',
  usage_limit: '100',
  per_user_limit: '1',
  is_active: true,
  requires_claim: false,
  claim_type: 'public',
  claim_min_items: '0',
  claim_min_subtotal: '0',
  claim_new_user_days: '',
  event_title: '',
  event_description: '',
  event_badge: '',
  sort_order: '10'
};

const typeLabels = {
  percent: 'Giảm % đơn hàng',
  free_shipping: 'Miễn phí vận chuyển',
  shipping_percent: 'Giảm % phí ship'
};

const claimTypeLabels = {
  public: 'Nhập mã trực tiếp',
  new_user: 'Khách hàng mới',
  cart_item_count: 'Đủ số lượng sản phẩm',
  cart_subtotal: 'Đủ giá trị giỏ hàng'
};

const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 16) : '');

const ManageCoupons = () => {
  const { theme } = useSelector((state) => state.auth);
  const isDark = theme === 'dark';
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(blankForm);

  const ui = {
    page: isDark ? 'bg-slate-950 text-white' : 'bg-[#f6f2eb] text-slate-950',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    panel: isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white',
    tableHead: isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500',
    row: isDark ? 'divide-slate-800 hover:bg-slate-800/60' : 'divide-slate-100 hover:bg-slate-50',
    input: isDark
      ? 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-emerald-400'
      : 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:ring-premium-500',
    soft: isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminGetCouponsAPI();
      setCoupons(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tải được danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const stats = useMemo(() => {
    const active = coupons.filter((item) => item.is_active && (!item.expires_at || new Date(item.expires_at) >= new Date())).length;
    const expired = coupons.filter((item) => item.expires_at && new Date(item.expires_at) < new Date()).length;
    const claimable = coupons.filter((item) => item.requires_claim).length;
    return { total: coupons.length, active, expired, claimable };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
      const matchesKeyword = !keyword || `${coupon.code} ${coupon.name}`.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'all'
        || (statusFilter === 'active' && coupon.is_active && !expired)
        || (statusFilter === 'expired' && expired)
        || (statusFilter === 'inactive' && !coupon.is_active);
      return matchesKeyword && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      ...blankForm,
      starts_at: new Date().toISOString().slice(0, 16),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      name: coupon.name || '',
      type: coupon.type || 'percent',
      discount_percent: coupon.discount_percent ?? '',
      max_discount_amount: coupon.max_discount_amount ?? '',
      min_order_amount: coupon.min_order_amount ?? '0',
      starts_at: toInputDate(coupon.starts_at),
      expires_at: toInputDate(coupon.expires_at),
      usage_limit: coupon.usage_limit ?? '',
      per_user_limit: coupon.per_user_limit ?? '1',
      is_active: Boolean(coupon.is_active),
      requires_claim: Boolean(coupon.requires_claim),
      claim_type: coupon.claim_type ?? 'public',
      claim_min_items: coupon.claim_min_items ?? '0',
      claim_min_subtotal: coupon.claim_min_subtotal ?? '0',
      claim_new_user_days: coupon.claim_new_user_days ?? '',
      event_title: coupon.event_title ?? '',
      event_description: coupon.event_description ?? '',
      event_badge: coupon.event_badge ?? '',
      sort_order: coupon.sort_order ?? '0'
    });
    setError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    const { code, type, discount_percent, max_discount_amount, min_order_amount, starts_at, expires_at } = formData;
    if (!code.trim()) return 'Mã giảm giá không được để trống.';
    if (/\s/.test(code)) return 'Mã giảm giá không được chứa khoảng trắng.';
    if (!nameSafe(formData.name)) return 'Tên voucher cần có ít nhất 3 ký tự.';

    const minOrder = Number(min_order_amount || 0);
    if (type === 'percent' || type === 'shipping_percent') {
      const pct = Number(discount_percent || 0);
      if (pct <= 0 || pct > 80) return 'Tỷ lệ giảm giá phải từ 1% đến 80%.';
      if (!max_discount_amount || Number(max_discount_amount) <= 0) return 'Voucher phần trăm cần có mức giảm tối đa.';
      if (minOrder > 0 && Number(max_discount_amount) > minOrder * 0.8) {
        return 'Mức giảm tối đa không được vượt quá 80% giá trị đơn tối thiểu.';
      }
    }

    if (type === 'free_shipping' && minOrder < 20000 && formData.claim_type !== 'new_user') {
      return 'Mã freeship nên áp dụng cho đơn từ 20.000đ trở lên.';
    }

    if (starts_at && expires_at && new Date(starts_at) >= new Date(expires_at)) {
      return 'Ngày bắt đầu phải trước ngày hết hạn.';
    }

    return null;
  };

  const nameSafe = (value) => String(value || '').trim().length >= 3;

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này không?')) return;
    try {
      await adminDeleteCouponAPI(id);
      loadCoupons();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Xóa voucher thất bại.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_percent: formData.type === 'free_shipping' ? 100 : Number(formData.discount_percent || 0),
      max_discount_amount: formData.type === 'free_shipping' || !formData.max_discount_amount ? null : Number(formData.max_discount_amount),
      min_order_amount: Number(formData.min_order_amount || 0),
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      per_user_limit: Number(formData.per_user_limit || 1),
      claim_min_items: Number(formData.claim_min_items || 0),
      claim_min_subtotal: Number(formData.claim_min_subtotal || 0),
      claim_new_user_days: formData.claim_new_user_days ? Number(formData.claim_new_user_days) : null,
      sort_order: Number(formData.sort_order || 0)
    };

    try {
      if (editingCoupon) {
        await adminUpdateCouponAPI(editingCoupon.id, payload);
      } else {
        await adminCreateCouponAPI(payload);
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (coupon) => {
    const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    if (expired) return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">Hết hạn</span>;
    if (coupon.is_active) return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Hoạt động</span>;
    return <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">Tạm tắt</span>;
  };

  return (
    <div className={`min-h-screen py-10 transition-colors ${ui.page}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Quản trị khuyến mãi</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Voucher / Mã giảm giá</h1>
            <p className={`mt-2 max-w-2xl text-sm ${ui.muted}`}>
              Tạo mã giảm giá, freeship và nhiệm vụ săn voucher cho khách hàng.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo voucher mới
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Tổng mã', stats.total],
            ['Đang hoạt động', stats.active],
            ['Cần săn mã', stats.claimable],
            ['Hết hạn', stats.expired]
          ].map(([label, value]) => (
            <div key={label} className={`rounded-2xl border p-5 shadow-sm ${ui.panel}`}>
              <div className={`text-xs font-black uppercase ${ui.muted}`}>{label}</div>
              <div className="mt-3 text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>

        <div className={`mb-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between ${ui.panel}`}>
          <div className="relative w-full md:max-w-sm">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${ui.muted}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã hoặc tên voucher..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 ${ui.input}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 ${ui.input}`}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm tắt</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border shadow-sm ${ui.panel}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`border-b text-xs uppercase ${ui.tableHead}`}>
                  <tr>
                    <th className="px-6 py-4">Mã / Tên</th>
                    <th className="px-6 py-4">Loại</th>
                    <th className="px-6 py-4">Giá trị</th>
                    <th className="px-6 py-4">Đơn tối thiểu</th>
                    <th className="px-6 py-4">Lượt dùng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Săn mã</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="8" className={`px-6 py-14 text-center text-sm ${ui.muted}`}>Không có voucher phù hợp.</td>
                    </tr>
                  ) : filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className={ui.row}>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <TicketPercent className="h-3.5 w-3.5" />
                          {coupon.code}
                        </div>
                        <div className={`mt-2 text-xs ${ui.muted}`}>{coupon.name}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">{typeLabels[coupon.type] || coupon.type}</td>
                      <td className="px-6 py-4">
                        {coupon.type === 'free_shipping' ? (
                          <span className="font-black text-emerald-600 dark:text-emerald-300">Freeship 100%</span>
                        ) : (
                          <div>
                            <span className="font-black text-emerald-700 dark:text-emerald-300">{coupon.discount_percent}%</span>
                            {coupon.max_discount_amount && <span className={`block text-xs ${ui.muted}`}>Tối đa {formatPrice(coupon.max_discount_amount)}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold">{formatPrice(coupon.min_order_amount)}</td>
                      <td className={`px-6 py-4 text-xs ${ui.muted}`}>
                        <div>Đã dùng: <b>{coupon.used_count || 0}</b></div>
                        <div>Giới hạn: <b>{coupon.usage_limit ?? 'Vô hạn'}</b></div>
                      </td>
                      <td className="px-6 py-4">{renderStatus(coupon)}</td>
                      <td className="px-6 py-4 text-xs">
                        {coupon.requires_claim ? (
                          <span className="rounded-full bg-indigo-100 px-3 py-1 font-black text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                            {claimTypeLabels[coupon.claim_type] || 'Có nhiệm vụ'}
                          </span>
                        ) : (
                          <span className={ui.muted}>Không</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(coupon)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Sửa voucher">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300" aria-label="Xóa voucher">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCoupon ? 'Cập nhật voucher' : 'Tạo voucher mới'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Mã giảm giá" ui={ui}>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                placeholder="SALE50K"
                required
                disabled={Boolean(editingCoupon)}
                className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm font-black uppercase outline-none focus:ring-2 disabled:opacity-60 ${ui.input}`}
              />
            </Field>

            <Field label="Tên voucher" ui={ui}>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tri ân khách hàng tháng này" required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            <Field label="Loại voucher" ui={ui}>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`}>
                <option value="percent">Giảm % đơn hàng</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
                <option value="shipping_percent">Giảm % phí vận chuyển</option>
              </select>
            </Field>

            <Field label="Đơn tối thiểu áp dụng" ui={ui}>
              <input type="number" value={formData.min_order_amount} onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })} min="0" required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            {formData.type !== 'free_shipping' && (
              <>
                <Field label="Phần trăm giảm" ui={ui}>
                  <input type="number" value={formData.discount_percent} onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })} min="1" max="80" required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                  <p className={`mt-1 text-[11px] ${ui.muted}`}>Tối đa 80% để tránh cấu hình voucher quá rủi ro.</p>
                </Field>

                <Field label="Giảm tối đa" ui={ui}>
                  <input type="number" value={formData.max_discount_amount} onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })} min="1000" required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                </Field>
              </>
            )}

            <Field label="Ngày bắt đầu" ui={ui}>
              <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            <Field label="Ngày hết hạn" ui={ui}>
              <input type="datetime-local" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            <Field label="Tổng số lượng phát hành" ui={ui}>
              <input type="number" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} min="1" placeholder="Để trống nếu vô hạn" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            <Field label="Lượt dùng mỗi khách" ui={ui}>
              <input type="number" value={formData.per_user_limit} onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })} min="1" required className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>

            <Field label="Thứ tự hiển thị" ui={ui}>
              <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
            </Field>
          </div>

          <div className={`rounded-2xl border p-4 ${ui.soft}`}>
            <label className="flex items-center gap-3 text-sm font-black">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              Kích hoạt voucher
            </label>
          </div>

          <div className={`rounded-2xl border p-4 ${ui.soft}`}>
            <label className="flex items-center gap-3 text-sm font-black">
              <input
                type="checkbox"
                checked={formData.requires_claim}
                onChange={(e) => setFormData({ ...formData, requires_claim: e.target.checked, claim_type: e.target.checked ? 'cart_subtotal' : 'public' })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Người dùng phải hoàn thành nhiệm vụ để săn voucher
            </label>

            {formData.requires_claim && (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Loại nhiệm vụ" ui={ui}>
                  <select value={formData.claim_type} onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })} className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`}>
                    <option value="new_user">Khách hàng mới đăng ký</option>
                    <option value="cart_subtotal">Giá trị giỏ hàng đạt ngưỡng</option>
                    <option value="cart_item_count">Số lượng sản phẩm trong giỏ đạt ngưỡng</option>
                  </select>
                </Field>

                {formData.claim_type === 'new_user' && (
                  <Field label="Giới hạn ngày tài khoản mới" ui={ui}>
                    <input type="number" value={formData.claim_new_user_days} onChange={(e) => setFormData({ ...formData, claim_new_user_days: e.target.value })} placeholder="Ví dụ: 7" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                  </Field>
                )}

                {formData.claim_type === 'cart_item_count' && (
                  <Field label="Số sản phẩm tối thiểu" ui={ui}>
                    <input type="number" value={formData.claim_min_items} onChange={(e) => setFormData({ ...formData, claim_min_items: e.target.value })} min="1" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                  </Field>
                )}

                {formData.claim_type === 'cart_subtotal' && (
                  <Field label="Giá trị đơn tối thiểu để săn" ui={ui}>
                    <input type="number" value={formData.claim_min_subtotal} onChange={(e) => setFormData({ ...formData, claim_min_subtotal: e.target.value })} min="0" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                  </Field>
                )}

                <Field label="Tiêu đề nhiệm vụ" ui={ui}>
                  <input type="text" value={formData.event_title} onChange={(e) => setFormData({ ...formData, event_title: e.target.value })} placeholder="Mua đơn 500k nhận mã giảm" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                </Field>

                <Field label="Nhãn nhiệm vụ" ui={ui}>
                  <input type="text" value={formData.event_badge} onChange={(e) => setFormData({ ...formData, event_badge: e.target.value })} placeholder="Hot, Freeship, Newbie" className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Mô tả nhiệm vụ" ui={ui}>
                    <textarea value={formData.event_description} onChange={(e) => setFormData({ ...formData, event_description: e.target.value })} rows="3" placeholder="Mô tả điều kiện để khách nhận voucher..." className={`mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${ui.input}`} />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <Spinner size="sm" /> : editingCoupon ? 'Cập nhật' : 'Tạo mới'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const Field = ({ label, ui, children }) => (
  <div>
    <label className={`block text-xs font-black uppercase ${ui.muted}`}>{label}</label>
    {children}
  </div>
);

export default ManageCoupons;
