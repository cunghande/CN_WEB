import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, TicketPercent, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { getAddressesAPI } from '../../services/addressService.js';
import { getMyCouponsAPI, validateCouponAPI } from '../../services/couponService.js';
import { createOrderAPI } from '../../services/orderService.js';
import { quoteShippingAPI } from '../../services/shippingService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const voucherLabel = (coupon) => {
  if (coupon.type === 'free_shipping') return 'Miễn phí vận chuyển';
  if (coupon.type === 'shipping_percent') return `Giảm ${Number(coupon.discount_percent || 0)}% phí ship`;
  return `Giảm ${Number(coupon.discount_percent || 0)}% đơn hàng`;
};

const CartPage = () => {
  const { items, totalAmount, totalItems, changeQuantity, removeFromCart, emptyCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [shipping, setShipping] = useState({ shipping_fee: 0, estimated_days: '' });
  const [shippingNote, setShippingNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [checkedCoupons, setCheckedCoupons] = useState([]);
  const [walletCoupons, setWalletCoupons] = useState([]);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAddresses = async () => {
      const res = await getAddressesAPI();
      const list = res.data || [];
      setAddresses(list);
      const defaultAddress = list.find((item) => item.is_default) || list[0];
      if (defaultAddress) setAddressId(String(defaultAddress.id));
    };
    loadAddresses();
  }, [isAuthenticated]);

  useEffect(() => {
    const code = searchParams.get('voucher');
    if (code && totalAmount > 0) {
      const upperCode = code.toUpperCase();
      setCouponCode(upperCode);
      const newCoupons = [...appliedCoupons.filter(c => !c.code), { code: upperCode }];
      
      // Auto apply
      validateCouponAPI({
        coupons: newCoupons,
        subtotal_amount: totalAmount,
        shipping_fee: shipping.shipping_fee || 0
      }).then(res => {
        setAppliedCouponData(res.data);
        setAppliedCoupons(newCoupons);
        setCouponCode('');
        setCouponMessage(res.message || 'Áp dụng voucher thành công.');
      }).catch(err => {
        setCouponMessage(err.response?.data?.message || 'Voucher không hợp lệ.');
      });

      // Remove from URL
      searchParams.delete('voucher');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [searchParams, totalAmount, shipping]);

  useEffect(() => {
    if (!addressId) return;
    const quote = async () => {
      const res = await quoteShippingAPI({ address_id: addressId });
      setShipping(res.data || { shipping_fee: 0 });
    };
    quote();
  }, [addressId]);

  useEffect(() => {
    if (appliedCoupons.length > 0 && totalAmount > 0) {
      validateCouponAPI({
        coupons: appliedCoupons,
        subtotal_amount: totalAmount,
        shipping_fee: shipping.shipping_fee || 0
      }).then(res => {
        setAppliedCouponData(res.data);
      }).catch(err => {
        setAppliedCouponData(null);
        setAppliedCoupons([]);
        setCouponMessage(err.response?.data?.message || 'Giỏ hàng thay đổi khiến voucher không còn hợp lệ.');
      });
    } else if (totalAmount === 0) {
      setAppliedCouponData(null);
      setAppliedCoupons([]);
      setCouponMessage('');
    }
  }, [totalAmount, shipping]);

  const shippingFee = Number(shipping.shipping_fee || 0);
  const productDiscount = Number(appliedCouponData?.total_discount_amount || 0);
  const shippingDiscount = Number(appliedCouponData?.total_shipping_discount_amount || 0);
  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);
  const finalTotalAmount = Math.max(0, totalAmount + shippingFee - productDiscount - shippingDiscount);

  const couponContext = {
    subtotal_amount: totalAmount,
    shipping_fee: shippingFee,
    item_count: totalItems
  };

  const loadWalletCoupons = async () => {
    if (!isAuthenticated) return navigate('/?login=true');
    setWalletLoading(true);
    try {
      const res = await getMyCouponsAPI(couponContext);
      setWalletCoupons(res.data || []);
      setCheckedCoupons(appliedCoupons.filter(c => c.user_coupon_id).map(c => c.user_coupon_id));
      setVoucherOpen(true);
    } catch (err) {
      setCouponMessage(err.response?.data?.message || 'Không thể tải ví voucher.');
    } finally {
      setWalletLoading(false);
    }
  };

  const applyCouponsArray = async (couponsArray) => {
    setCouponLoading(true);
    setCouponMessage('');
    try {
      const res = await validateCouponAPI({
        coupons: couponsArray,
        subtotal_amount: totalAmount,
        shipping_fee: shippingFee
      });
      setAppliedCouponData(res.data);
      setAppliedCoupons(couponsArray);
      setCouponCode('');
      setCouponMessage(res.message || 'Áp dụng voucher thành công.');
      setVoucherOpen(false);
    } catch (err) {
      setAppliedCouponData(null);
      setAppliedCoupons([]);
      setCouponMessage(err.response?.data?.message || 'Voucher không hợp lệ.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyManualCode = () => {
    if (!isAuthenticated) return navigate('/?login=true');
    if (!couponCode.trim()) {
      setCouponMessage('Vui lòng nhập mã giảm giá.');
      return;
    }
    const newCoupons = [...appliedCoupons.filter(c => !c.code), { code: couponCode.trim().toUpperCase() }];
    return applyCouponsArray(newCoupons);
  };

  const handleConfirmWalletCoupons = () => {
    const newCoupons = [
      ...appliedCoupons.filter(c => c.code), // Keep manual codes
      ...checkedCoupons.map(id => ({ user_coupon_id: id }))
    ];
    return applyCouponsArray(newCoupons);
  };

  const toggleCoupon = (voucher) => {
    const isShipping = voucher.type === 'free_shipping' || voucher.type === 'shipping_percent';
    setCheckedCoupons(prev => {
      if (prev.includes(voucher.user_coupon_id)) {
        return prev.filter(id => id !== voucher.user_coupon_id);
      } else {
        const otherVouchers = walletCoupons.filter(c => prev.includes(c.user_coupon_id));
        const hasShipping = otherVouchers.some(c => c.type === 'free_shipping' || c.type === 'shipping_percent');
        const hasProduct = otherVouchers.some(c => c.type === 'percent');
        
        if (isShipping && hasShipping) {
          return [...prev.filter(id => {
            const c = walletCoupons.find(v => v.user_coupon_id === id);
            return c && c.type === 'percent';
          }), voucher.user_coupon_id];
        } else if (!isShipping && hasProduct) {
          return [...prev.filter(id => {
            const c = walletCoupons.find(v => v.user_coupon_id === id);
            return c && (c.type === 'free_shipping' || c.type === 'shipping_percent');
          }), voucher.user_coupon_id];
        }
        return [...prev, voucher.user_coupon_id];
      }
    });
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) return navigate('/?login=true');
    if (addresses.length === 0 || !addressId) {
      navigate('/account/addresses');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const orderItems = items.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const res = await createOrderAPI({
        items: orderItems,
        address_id: Number(addressId),
        shipping_note: shippingNote,
        coupons: appliedCoupons
      });

      setOrderSuccess(res.data?.order_id);
      emptyCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#f6f3ee] px-4 py-16 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">Đặt hàng thành công</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Mã đơn hàng của bạn là <b className="text-emerald-800 dark:text-emerald-300">#{orderSuccess}</b>.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to={`/orders?orderId=${orderSuccess}`}><Button variant="outline" className="w-full">Xem đơn hàng</Button></Link>
            <Link to="/products"><Button className="w-full">Mua tiếp</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-emerald-700 dark:text-emerald-300">Thanh toán COD</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Giỏ hàng của bạn</h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ShoppingBag className="mx-auto h-12 w-12 text-emerald-700 dark:text-emerald-300" />
            <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">Giỏ hàng đang trống</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy chọn sản phẩm, size và màu trước khi đặt hàng.</p>
            <Link to="/products" className="mt-6 inline-flex"><Button size="lg">Xem sản phẩm <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {error && <div className="flex items-center gap-2 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600"><AlertCircle className="h-4 w-4" /> {error}</div>}
              {items.map((item) => (
                <div key={item.variant_id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img src={getImageUrl(item.image_url)} alt={item.name} className="h-24 w-24 flex-shrink-0 rounded-3xl bg-slate-100 object-cover object-top" />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 font-black text-slate-950 dark:text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Phân loại: <b>{item.size}</b> - {item.color}</p>
                      <p className="mt-2 font-black text-emerald-800 dark:text-emerald-300">{formatPrice(item.unit_price)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity - 1)} className="p-2 hover:bg-[#f6f3ee] dark:text-white dark:hover:bg-slate-800"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-10 border-x border-slate-200 px-3 py-2 text-center text-sm font-black dark:border-slate-700 dark:text-white">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity + 1)} className="p-2 hover:bg-[#f6f3ee] dark:text-white dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="min-w-[110px] text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Thành tiền</div>
                        <div className="font-black text-slate-950 dark:text-white">{formatPrice(item.unit_price * item.quantity)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.variant_id)} className="rounded-2xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/35"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="border-b border-slate-100 pb-4 text-lg font-black text-slate-950 dark:border-slate-800 dark:text-white">Giao hàng</h3>
                {isAuthenticated ? (
                  <div className="space-y-3 py-5">
                    {addresses.length > 0 ? (
                      <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="w-full rounded-3xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        <option value="">Chọn địa chỉ giao hàng</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>{address.receiver_name} - {address.ward_name}, {address.district_name}, {address.province_name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        Bạn cần thêm địa chỉ và số điện thoại người nhận trước khi thanh toán.
                      </div>
                    )}
                    <Link to="/account/addresses" className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {addresses.length > 0 ? 'Quản lý địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
                    </Link>
                    <textarea value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} placeholder="Ghi chú giao hàng" className="w-full rounded-3xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  </div>
                ) : (
                  <p className="py-5 text-sm text-slate-500 dark:text-slate-400">Bạn cần đăng nhập để chọn địa chỉ giao hàng.</p>
                )}

                <div className="space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Tạm tính</span><b>{formatPrice(totalAmount)}</b></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Phí ship</span>
                    <div className="text-right">
                      <b>{formatPrice(shippingFee)}</b>
                      {shipping.distance_note && (
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {shipping.distance_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-[#f6f3ee] p-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-black text-slate-950 dark:text-white">
                        <TicketPercent className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                        Voucher
                      </div>
                      <button type="button" onClick={loadWalletCoupons} className="text-xs font-black text-emerald-700 hover:text-premium-900 dark:text-emerald-300">
                        {walletLoading ? 'Đang tải...' : 'Chọn voucher'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <Button type="button" size="sm" onClick={handleApplyManualCode} disabled={couponLoading || totalAmount <= 0}>
                        {couponLoading ? <Spinner size="sm" /> : 'Áp dụng'}
                      </Button>
                    </div>
                    {appliedCouponData?.applied_coupons?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {appliedCouponData.applied_coupons.map((ac, idx) => (
                          <div key={idx} className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                            Đang dùng {ac.coupon.code}: {ac.coupon.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {couponMessage && (
                      <div className={`mt-2 text-xs font-bold ${appliedCouponData?.applied_coupons?.length > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
                        {couponMessage}
                      </div>
                    )}
                    <div className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      Có thể nhập mã công khai hoặc săn thêm voucher ở trang sự kiện.
                    </div>
                  </div>

                  {productDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                      <span>Giảm giá sản phẩm</span>
                      <b>-{formatPrice(productDiscount)}</b>
                    </div>
                  )}
                  {shippingDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                      <span>Giảm phí ship</span>
                      <b>-{formatPrice(shippingDiscount)}</b>
                    </div>
                  )}
                  {shipping.estimated_days && <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Dự kiến: {shipping.estimated_days}</div>}
                  <div className="flex justify-between border-t border-slate-100 pt-4 text-base dark:border-slate-800">
                    <span className="font-black text-slate-950 dark:text-white">Tổng thanh toán</span>
                    <span className="font-black text-emerald-800 dark:text-emerald-300">{formatPrice(finalTotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>Phí ship sau giảm</span><b>{formatPrice(finalShippingFee)}</b></div>
                </div>
                <Button size="lg" className="mt-5 w-full" onClick={handleCheckout} disabled={loading}>{loading ? <Spinner size="sm" /> : 'Đặt hàng COD'}</Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Modal isOpen={voucherOpen} onClose={() => setVoucherOpen(false)} title="Chọn voucher của bạn" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {walletCoupons.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <TicketPercent className="mx-auto h-10 w-10 text-emerald-700 dark:text-emerald-300" />
              <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Bạn chưa có voucher trong ví</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Vào trang sự kiện để làm nhiệm vụ và nhận mã giảm giá.</p>
              <Link to="/events" className="mt-5 inline-flex" onClick={() => setVoucherOpen(false)}>
                <Button>Săn voucher ngay</Button>
              </Link>
            </div>
          ) : walletCoupons.map((voucher) => {
            const valid = voucher.preview?.valid;
            return (
              <div key={voucher.user_coupon_id} className={`rounded-3xl border p-4 transition-colors ${checkedCoupons.includes(voucher.user_coupon_id) ? 'border-premium-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                <label className="flex cursor-pointer items-start gap-4">
                  <div className="flex h-5 items-center mt-1">
                    <input
                      type="checkbox"
                      disabled={!valid || couponLoading}
                      checked={checkedCoupons.includes(voucher.user_coupon_id)}
                      onChange={() => toggleCoupon(voucher)}
                      className="h-5 w-5 cursor-pointer rounded border-slate-300 text-premium-600 focus:ring-premium-600 dark:border-slate-600 dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="inline-flex rounded-full bg-premium-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/30 dark:text-premium-200">{voucherLabel(voucher)}</div>
                    <h4 className="mt-2 text-base font-black text-slate-950 dark:text-white">{voucher.name}</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Mã {voucher.code} · Đơn từ {formatPrice(voucher.min_order_amount)} · Còn {voucher.remaining_days ?? '--'} ngày
                    </p>
                    <p className={`mt-2 text-xs font-bold ${valid ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {valid ? `Giảm ${formatPrice(voucher.preview.total_discount_amount || 0)} cho giỏ hiện tại` : voucher.preview?.message}
                    </p>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
        {walletCoupons.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4 text-right dark:border-slate-800">
            <Button onClick={handleConfirmWalletCoupons} disabled={couponLoading}>
              {couponLoading ? <Spinner size="sm" /> : `Xác nhận chọn (${checkedCoupons.length})`}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CartPage;
