import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { createOrderAPI } from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const CartPage = () => {
  const { items, totalAmount, changeQuantity, removeFromCart, emptyCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/?login=true');
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
        total_amount: totalAmount
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
      <div className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Đặt hàng thành công</h2>
          <p className="mt-2 text-sm text-slate-500">Mã đơn hàng của bạn là <b className="text-premium-800">#{orderSuccess}</b>.</p>
          <div className="mt-5 rounded-md bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
            <div><b>Người nhận:</b> {user?.full_name}</div>
            <div><b>Email:</b> {user?.email}</div>
            <div><b>Thanh toán:</b> COD khi nhận hàng</div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to="/orders"><Button variant="outline" className="w-full">Xem đơn</Button></Link>
            <Link to="/products"><Button className="w-full">Mua tiếp</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-premium-700">Thanh toán COD</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Giỏ hàng của bạn</h1>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-premium-50 text-premium-700">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">Giỏ hàng đang trống</h3>
            <p className="mt-2 text-sm text-slate-500">Hãy chọn sản phẩm, size và màu trước khi đặt hàng.</p>
            <Link to="/products" className="mt-6 inline-flex">
              <Button size="lg">
                Xem sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {items.map((item) => (
                <div key={item.variant_id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img src={getImageUrl(item.image_url)} alt={item.name} className="h-24 w-24 flex-shrink-0 rounded-md object-cover object-top bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 font-black text-slate-950">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">Phân loại: <b>{item.size}</b> - {item.color}</p>
                      <p className="mt-2 font-black text-premium-800">{formatPrice(item.unit_price)}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="flex items-center overflow-hidden rounded-md border border-slate-200">
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity - 1)} className="p-2 hover:bg-slate-50" aria-label="Giảm số lượng">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 border-x border-slate-200 px-3 py-2 text-center text-sm font-black">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.variant_id, item.quantity + 1)} className="p-2 hover:bg-slate-50" aria-label="Tăng số lượng">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="min-w-[110px] text-right">
                        <div className="text-xs text-slate-500">Thành tiền</div>
                        <div className="font-black text-slate-950">{formatPrice(item.unit_price * item.quantity)}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.variant_id)} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Xóa sản phẩm">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="border-b border-slate-100 pb-4 text-lg font-black text-slate-950">Tóm tắt đơn hàng</h3>
                <div className="space-y-3 py-5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Số dòng sản phẩm</span><b>{items.length}</b></div>
                  <div className="flex justify-between text-slate-600"><span>Phí vận chuyển</span><b className="text-emerald-700">Miễn phí</b></div>
                  <div className="flex justify-between text-slate-600"><span>Phương thức</span><b>COD</b></div>
                  <div className="flex justify-between border-t border-slate-100 pt-4 text-base">
                    <span className="font-black text-slate-950">Tổng thanh toán</span>
                    <span className="font-black text-premium-800">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={handleCheckout} disabled={loading}>
                  {loading ? <Spinner size="sm" /> : isAuthenticated ? 'Đặt hàng' : 'Đăng nhập để đặt hàng'}
                </Button>
                {!isAuthenticated && <p className="mt-3 text-center text-xs text-amber-700">Bạn cần đăng nhập để tạo đơn hàng.</p>}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
