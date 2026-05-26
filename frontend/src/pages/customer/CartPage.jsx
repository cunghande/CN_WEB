import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { getAddressesAPI } from '../../services/addressService.js';
import { createOrderAPI } from '../../services/orderService.js';
import { quoteShippingAPI } from '../../services/shippingService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const CartPage = () => {
  const { items, totalAmount, changeQuantity, removeFromCart, emptyCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [shipping, setShipping] = useState({ shipping_fee: 0, estimated_days: '' });
  const [shippingNote, setShippingNote] = useState('');
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
    if (!addressId) return;
    const quote = async () => {
      const res = await quoteShippingAPI({ address_id: addressId });
      setShipping(res.data || { shipping_fee: 0 });
    };
    quote();
  }, [addressId]);

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
        shipping_note: shippingNote
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
      <div className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">Đặt hàng thành công</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Mã đơn hàng của bạn là <b className="text-premium-800 dark:text-premium-300">#{orderSuccess}</b>.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to="/orders"><Button variant="outline" className="w-full">Xem đơn</Button></Link>
            <Link to="/products"><Button className="w-full">Mua tiếp</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-premium-700 dark:text-premium-300">Thanh toán COD</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Giỏ hàng của bạn</h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ShoppingBag className="mx-auto h-12 w-12 text-premium-700 dark:text-premium-300" />
            <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">Giỏ hàng đang trống</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy chọn sản phẩm, size và màu trước khi đặt hàng.</p>
            <Link to="/products" className="mt-6 inline-flex"><Button size="lg">Xem sản phẩm <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {error && <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600"><AlertCircle className="h-4 w-4" /> {error}</div>}
              {items.map((item) => (
                <div key={item.variant_id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img src={getImageUrl(item.image_url)} alt={item.name} className="h-24 w-24 flex-shrink-0 rounded-lg bg-slate-100 object-cover object-top" />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 font-black text-slate-950 dark:text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Phân loại: <b>{item.size}</b> - {item.color}</p>
                      <p className="mt-2 font-black text-premium-800 dark:text-premium-300">{formatPrice(item.unit_price)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity - 1)} className="p-2 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-10 border-x border-slate-200 px-3 py-2 text-center text-sm font-black dark:border-slate-700 dark:text-white">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity + 1)} className="p-2 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="min-w-[110px] text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Thành tiền</div>
                        <div className="font-black text-slate-950 dark:text-white">{formatPrice(item.unit_price * item.quantity)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.variant_id)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/35"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="border-b border-slate-100 pb-4 text-lg font-black text-slate-950 dark:border-slate-800 dark:text-white">Giao hàng</h3>
                {isAuthenticated ? (
                  <div className="space-y-3 py-5">
                    {addresses.length > 0 ? (
                      <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                        <option value="">Chọn địa chỉ giao hàng</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>{address.receiver_name} - {address.ward_name}, {address.district_name}, {address.province_name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Bạn cần thêm địa chỉ và số điện thoại người nhận trước khi thanh toán.
                      </div>
                    )}
                    <Link to="/account/addresses" className="block text-sm font-bold text-premium-700 dark:text-premium-300">
                      {addresses.length > 0 ? 'Quản lý địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
                    </Link>
                    <textarea value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} placeholder="Ghi chú giao hàng" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  </div>
                ) : (
                  <p className="py-5 text-sm text-slate-500 dark:text-slate-400">Bạn cần đăng nhập để chọn địa chỉ giao hàng.</p>
                )}

                <div className="space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Tạm tính</span><b>{formatPrice(totalAmount)}</b></div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Phí ship</span><b>{formatPrice(shipping.shipping_fee || 0)}</b></div>
                  {shipping.estimated_days && <div className="text-xs font-bold text-premium-700 dark:text-premium-300">Dự kiến: {shipping.estimated_days}</div>}
                  <div className="flex justify-between border-t border-slate-100 pt-4 text-base dark:border-slate-800">
                    <span className="font-black text-slate-950 dark:text-white">Tổng thanh toán</span>
                    <span className="font-black text-premium-800 dark:text-premium-300">{formatPrice(totalAmount + Number(shipping.shipping_fee || 0))}</span>
                  </div>
                </div>
                <Button size="lg" className="mt-5 w-full" onClick={handleCheckout} disabled={loading}>{loading ? <Spinner size="sm" /> : 'Đặt hàng COD'}</Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
