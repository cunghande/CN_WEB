import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Check, Edit, Plus, TicketPercent, Trash2, X } from 'lucide-react';
import { adminCreateCouponAPI, adminDeleteCouponAPI, adminGetCouponsAPI, adminUpdateCouponAPI } from '../../services/couponService.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatPrice } from '../../utils/formatPrice.js';

const typeLabels = {
  percent: 'Giảm giá % đơn hàng',
  free_shipping: 'Miễn phí vận chuyển',
  shipping_percent: 'Giảm giá % phí ship'
};

const claimTypeLabels = {
  public: 'Nhập mã trực tiếp',
  new_user: 'Ưu đãi khách hàng mới (Săn mã)',
  cart_item_count: 'Đạt số lượng sản phẩm (Săn mã)',
  cart_subtotal: 'Đạt số tiền giỏ hàng (Săn mã)'
};

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percent',
    discount_percent: '',
    max_discount_amount: '',
    min_order_amount: '0',
    starts_at: '',
    expires_at: '',
    usage_limit: '',
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
    sort_order: '0'
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminGetCouponsAPI();
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      type: 'percent',
      discount_percent: '10',
      max_discount_amount: '50000',
      min_order_amount: '100000',
      starts_at: new Date().toISOString().slice(0, 16),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
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
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      discount_percent: coupon.discount_percent ?? '',
      max_discount_amount: coupon.max_discount_amount ?? '',
      min_order_amount: coupon.min_order_amount ?? '0',
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này không?')) return;
    try {
      await adminDeleteCouponAPI(id);
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const validateForm = () => {
    const { code, type, discount_percent, max_discount_amount, min_order_amount, claim_type, starts_at, expires_at } = formData;
    
    if (!code.trim()) return 'Mã giảm giá không được để trống';
    if (/\s/.test(code)) return 'Mã giảm giá không được chứa khoảng trắng';

    const minOrder = Number(min_order_amount || 0);

    if (type === 'percent' || type === 'shipping_percent') {
      const pct = Number(discount_percent || 0);
      if (pct <= 0 || pct > 80) {
        return 'Tỷ lệ giảm giá phải từ 1% đến 80% để đảm bảo không bị tổn thất quá lớn.';
      }
      
      if (!max_discount_amount || Number(max_discount_amount) <= 0) {
        return 'Voucher theo phần trăm bắt buộc phải có Giới hạn số tiền giảm tối đa (Max Discount).';
      }

      const maxD = Number(max_discount_amount);
      if (maxD > minOrder * 0.8 && minOrder > 0) {
        return `Số tiền giảm tối đa (${formatPrice(maxD)}) không được vượt quá 80% giá trị đơn tối thiểu (${formatPrice(minOrder)}).`;
      }
    }

    if (type === 'free_shipping') {
      if (minOrder < 20000 && claim_type !== 'new_user') {
        return 'Đơn hàng tối thiểu cho mã Free Shipping phải từ 20.000đ trở lên để tránh lạm dụng.';
      }
    }

    if (starts_at && expires_at) {
      if (new Date(starts_at) >= new Date(expires_at)) {
        return 'Thời gian bắt đầu phải trước thời gian kết thúc.';
      }
    }

    return null;
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

    // Prepare payload
    const payload = {
      ...formData,
      discount_percent: formData.type === 'free_shipping' ? 100 : (formData.discount_percent ? Number(formData.discount_percent) : null),
      max_discount_amount: (formData.type === 'free_shipping' || !formData.max_discount_amount) ? null : Number(formData.max_discount_amount),
      min_order_amount: Number(formData.min_order_amount || 0),
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      per_user_limit: Number(formData.per_user_limit || 1),
      claim_min_items: Number(formData.claim_min_items || 0),
      claim_min_subtotal: Number(formData.claim_min_subtotal || 0),
      claim_new_user_days: formData.claim_new_user_days ? Number(formData.claim_new_user_days) : null,
      sort_order: Number(formData.sort_order || 0),
      code: formData.code.trim().toUpperCase()
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

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700">Trang quản lý</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Quản lý Voucher / Mã giảm giá</h1>
            <p className="mt-2 text-sm text-slate-500">Tạo, cập nhật và giám sát các chương trình voucher của shop.</p>
          </div>
          <Button onClick={handleOpenCreate} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo Voucher mới
          </Button>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Mã / Tên</th>
                    <th className="px-6 py-4">Loại</th>
                    <th className="px-6 py-4">Giá trị giảm</th>
                    <th className="px-6 py-4">Đơn tối thiểu</th>
                    <th className="px-6 py-4">Lượt dùng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Nhận (Ví)</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => {
                    const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-950">{coupon.code}</div>
                          <div className="text-xs text-slate-500">{coupon.name}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                          {typeLabels[coupon.type]}
                        </td>
                        <td className="px-6 py-4">
                          {coupon.type === 'free_shipping' ? (
                            <span className="font-bold text-emerald-600">Freeship 100%</span>
                          ) : (
                            <div>
                              <span className="font-black text-premium-800">{coupon.discount_percent}%</span>
                              {coupon.max_discount_amount && (
                                <span className="text-xs text-slate-500 block">Tối đa: {formatPrice(coupon.max_discount_amount)}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {formatPrice(coupon.min_order_amount)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div>Đã dùng: <b>{coupon.used_count || 0}</b></div>
                          <div>Giới hạn: <b>{coupon.usage_limit ?? 'Vô hạn'}</b></div>
                        </td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">Hết hạn</span>
                          ) : coupon.is_active ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Hoạt động</span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">Tắt</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {coupon.requires_claim ? (
                            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Có ({coupon.claim_type})</span>
                          ) : (
                            <span className="text-slate-400">Không</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenEdit(coupon)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(coupon.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCoupon ? 'Cập nhật Voucher' : 'Tạo Voucher mới'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Mã giảm giá (Viết liền, không dấu)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                placeholder="Ví dụ: SALE50K, SHIP20"
                required
                disabled={Boolean(editingCoupon)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Tên Voucher</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Tri ân khách hàng tháng 5"
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Loại Voucher</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              >
                <option value="percent">Giảm giá theo % đơn hàng</option>
                <option value="free_shipping">Miễn phí vận chuyển (Freeship)</option>
                <option value="shipping_percent">Giảm giá % phí vận chuyển</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Đơn tối thiểu áp dụng (VND)</label>
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                min="0"
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            {formData.type !== 'free_shipping' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Phần trăm giảm (%) <span className="text-red-500 font-semibold">(Tối đa 80%)</span></label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    min="1"
                    max="80"
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Giảm tối đa (VND) <span className="text-red-500 font-semibold">(Bắt buộc)</span></label>
                  <input
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    min="1000"
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Ví dụ: Giảm 20% tối đa 50k. Không được vượt quá 80% đơn tối thiểu.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Ngày hết hạn</label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Tổng số lượng phát hành (Để trống = Vô hạn)</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                min="1"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Lượt dùng tối đa / 1 khách hàng</label>
              <input
                type="number"
                value={formData.per_user_limit}
                onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                min="1"
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Thứ tự ưu tiên hiển thị</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-premium-600 focus:ring-premium-500"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700">Kích hoạt hoạt động luôn</label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requires_claim"
                checked={formData.requires_claim}
                onChange={(e) => setFormData({ ...formData, requires_claim: e.target.checked, claim_type: e.target.checked ? 'cart_subtotal' : 'public' })}
                className="h-4 w-4 rounded border-slate-300 text-premium-600 focus:ring-premium-500"
              />
              <label htmlFor="requires_claim" className="text-sm font-black text-slate-950">Phải thực hiện nhiệm vụ săn voucher (Đưa lên Sự kiện)</label>
            </div>

            {formData.requires_claim && (
              <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500">Loại nhiệm vụ để nhận</label>
                    <select
                      value={formData.claim_type}
                      onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                    >
                      <option value="new_user">Khách hàng mới đăng ký</option>
                      <option value="cart_subtotal">Số tiền giỏ hàng đạt ngưỡng</option>
                      <option value="cart_item_count">Số lượng sản phẩm trong giỏ đạt ngưỡng</option>
                    </select>
                  </div>

                  {formData.claim_type === 'new_user' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Giới hạn thời hạn tài khoản mới (Ngày)</label>
                      <input
                        type="number"
                        value={formData.claim_new_user_days}
                        onChange={(e) => setFormData({ ...formData, claim_new_user_days: e.target.value })}
                        placeholder="Mặc định: 7 ngày"
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                      />
                    </div>
                  )}

                  {formData.claim_type === 'cart_item_count' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Số lượng sản phẩm tối thiểu trong giỏ</label>
                      <input
                        type="number"
                        value={formData.claim_min_items}
                        onChange={(e) => setFormData({ ...formData, claim_min_items: e.target.value })}
                        min="1"
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                      />
                    </div>
                  )}

                  {formData.claim_type === 'cart_subtotal' && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Số tiền đơn hàng tối thiểu để săn</label>
                      <input
                        type="number"
                        value={formData.claim_min_subtotal}
                        onChange={(e) => setFormData({ ...formData, claim_min_subtotal: e.target.value })}
                        min="0"
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-500">Tiêu đề nhiệm vụ hiển thị trên sự kiện</label>
                    <input
                      type="text"
                      value={formData.event_title}
                      onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
                      placeholder="Ví dụ: Thử thách mua sắm 500k"
                      className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500">Nhãn nhiệm vụ (Badge)</label>
                    <input
                      type="text"
                      value={formData.event_badge}
                      onChange={(e) => setFormData({ ...formData, event_badge: e.target.value })}
                      placeholder="Ví dụ: Cực Hot, Giới Hạn"
                      className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Mô tả nhiệm vụ săn voucher</label>
                  <textarea
                    value={formData.event_description}
                    onChange={(e) => setFormData({ ...formData, event_description: e.target.value })}
                    placeholder="Mô tả cho người dùng biết cần làm gì để nhận được mã này..."
                    rows="2"
                    className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-premium-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : (editingCoupon ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCoupons;
