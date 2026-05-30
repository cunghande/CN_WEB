import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { getMyOrdersAPI, getOrderByIdAPI } from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getOrderDate, statusMeta } from '../../utils/productHelpers.js';

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle
};

const StatusBadge = ({ status }) => {
  const meta = statusMeta[status] || { label: status, tone: 'bg-[#f6f3ee] text-slate-700 border-slate-200' };
  const Icon = statusIcons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [autoOpenedOrderId, setAutoOpenedOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await getMyOrdersAPI();
        setOrders(res.data || []);
      } catch {
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await getOrderByIdAPI(orderId);
      setSelectedOrder(res.data);
    } catch {
      setError('Không thể tải chi tiết đơn hàng.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId || loading || autoOpenedOrderId === orderId) return;
    setAutoOpenedOrderId(orderId);
    handleViewDetail(orderId);
  }, [searchParams, loading, autoOpenedOrderId]);

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#f6f3ee] px-4 py-16 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">Đăng nhập để xem đơn hàng</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Bạn cần đăng nhập để theo dõi trạng thái và lịch sử mua hàng.</p>
          <Link to="/?login=true" className="mt-6 inline-flex w-full">
            <Button className="w-full">Đăng nhập ngay</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-emerald-700 dark:text-emerald-300">Theo dõi mua hàng</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Đơn hàng của tôi</h1>
        </div>

        {loading ? (
          <div className="py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Bạn chưa có đơn hàng</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy chọn sản phẩm yêu thích và tạo đơn hàng đầu tiên.</p>
            <Link to="/products" className="mt-6 inline-flex">
              <Button>
                Mua sắm ngay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-black text-slate-950 dark:text-white">Đơn hàng #{order.id}</h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Ngày đặt: {new Date(getOrderDate(order)).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Tổng thanh toán</div>
                      <div className="font-black text-emerald-800 dark:text-emerald-300">{formatPrice(order.total_amount)}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(order.id)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder || detailLoading}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.id}` : 'Đang tải chi tiết'}
        maxWidth="max-w-2xl"
      >
        {detailLoading ? (
          <div className="py-12"><Spinner size="md" /></div>
        ) : selectedOrder ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl bg-[#f6f3ee] p-4 dark:bg-slate-900">
              <div>
                <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Trạng thái</div>
                <div className="mt-2"><StatusBadge status={selectedOrder.status} /></div>
              </div>
              <div className="text-right text-sm text-slate-600 dark:text-slate-300">
                {new Date(getOrderDate(selectedOrder)).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white p-3 last:border-b-0 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(item.image_url)} alt={item.product_name} className="h-14 w-14 rounded-2xl bg-slate-100 object-cover object-top" />
                    <div>
                      <div className="line-clamp-1 text-sm font-black text-slate-950 dark:text-white">{item.product_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.size} - {item.color}</div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(item.unit_price)} x {item.quantity}</div>
                      {selectedOrder.status === 'delivered' && item.product_id && (
                        <Link to={`/products/${item.product_id}?review=1#review-form`} className="mt-2 inline-flex text-xs font-black text-emerald-700 hover:text-emerald-900 dark:text-emerald-300">
                          Đánh giá sản phẩm
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm font-black text-slate-950 dark:text-white">
                    {formatPrice(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/25">
              <div className="space-y-1 text-sm">
                {selectedOrder.coupon_code && <div className="font-bold text-emerald-800 dark:text-emerald-200">Mã áp dụng: {selectedOrder.coupon_code}</div>}
                {Number(selectedOrder.discount_amount || 0) > 0 && <div className="text-emerald-700 dark:text-emerald-300">Giảm giá: -{formatPrice(selectedOrder.discount_amount)}</div>}
                {Number(selectedOrder.shipping_discount_amount || 0) > 0 && <div className="text-emerald-700 dark:text-emerald-300">Giảm phí ship: -{formatPrice(selectedOrder.shipping_discount_amount)}</div>}
                <span className="font-black text-emerald-900 dark:text-emerald-200">Tổng thanh toán</span>
              </div>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">{formatPrice(selectedOrder.total_amount)}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default OrdersPage;
