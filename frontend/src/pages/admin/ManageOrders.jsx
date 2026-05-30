import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  XCircle
} from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { getAllOrdersAPI, getOrderByIdAPI, updateOrderStatusAPI } from '../../services/orderService.js';
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

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang chuẩn bị' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

const StatusBadge = ({ status }) => {
  const meta = statusMeta[status] || { label: status, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
  const Icon = statusIcons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

const buildAddressText = (order) => {
  const parts = [
    order.address_line,
    order.hamlet,
    order.ward_name,
    order.district_name,
    order.province_name
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Chưa có địa chỉ giao hàng';
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrdersAPI();
      setOrders(res.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch = !keyword
        || String(order.id).includes(keyword)
        || order.full_name?.toLowerCase().includes(keyword)
        || order.email?.toLowerCase().includes(keyword)
        || order.receiver_phone?.includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatusAPI(id, newStatus);
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status: newStatus } : order));
      setSelectedOrder((current) => current?.id === id ? { ...current, status: newStatus } : current);
    } catch {
      alert('Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await getOrderByIdAPI(orderId);
      setSelectedOrder(res.data);
    } catch (error) {
      console.error('Lỗi tải chi tiết đơn hàng:', error);
      alert('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (!detailLoading) setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700 dark:text-premium-300">Vận hành đơn hàng</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Quản lý đơn hàng</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Lọc, theo dõi, xem sản phẩm khách đã mua và cập nhật tiến độ giao hàng.</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mã đơn, tên khách, email, số điện thoại..."
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-premium-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-premium-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">Tất cả trạng thái</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Không có đơn hàng phù hợp.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-slate-950 dark:text-white">Đơn hàng #{order.id}</h3>
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(getOrderDate(order)).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDetail(order.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-premium-200 bg-premium-50 px-3 py-2 text-xs font-black text-premium-800 transition hover:bg-premium-100 dark:border-premium-800 dark:bg-premium-900/25 dark:text-premium-200 dark:hover:bg-premium-900/40"
                    >
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </button>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Trạng thái</label>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-premium-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {updatingId === order.id && <Spinner size="sm" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400">Khách hàng</div>
                    <div className="mt-1 font-black text-slate-950 dark:text-white">{order.full_name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{order.email}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400">Người nhận</div>
                    <div className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">{order.receiver_name || order.full_name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{order.receiver_phone || 'Chưa có số điện thoại'}</div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xs font-black uppercase text-slate-400">Tổng tiền</div>
                    <div className="mt-1 text-xl font-black text-premium-800 dark:text-premium-300">{formatPrice(order.total_amount)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder || detailLoading}
        onClose={closeDetail}
        title={selectedOrder ? `Chi tiết đơn hàng #${selectedOrder.id}` : 'Đang tải chi tiết đơn hàng'}
        maxWidth="max-w-4xl"
      >
        {detailLoading ? (
          <div className="py-16"><Spinner size="md" /></div>
        ) : selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-black uppercase text-slate-400">Trạng thái</div>
                <div className="mt-3"><StatusBadge status={selectedOrder.status} /></div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(getOrderDate(selectedOrder)).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                  <UserRound className="h-4 w-4" />
                  Khách hàng
                </div>
                <div className="mt-3 font-black text-slate-950 dark:text-white">{selectedOrder.full_name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{selectedOrder.email}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-black uppercase text-slate-400">Thanh toán</div>
                <div className="mt-3 font-black text-slate-950 dark:text-white">COD khi nhận hàng</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Thu tiền khi giao hàng</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-slate-400">
                <MapPin className="h-4 w-4" />
                Địa chỉ giao hàng
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-[220px_1fr]">
                <div>
                  <div className="font-black text-slate-950 dark:text-white">{selectedOrder.receiver_name || selectedOrder.full_name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedOrder.receiver_phone || 'Chưa có số điện thoại'}</div>
                </div>
                <div className="text-slate-700 dark:text-slate-200">
                  {buildAddressText(selectedOrder)}
                  {selectedOrder.shipping_note ? (
                    <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-900/25 dark:text-amber-200">
                      Ghi chú: {selectedOrder.shipping_note}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                Sản phẩm trong đơn ({selectedOrder.items?.length || 0})
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="grid gap-4 bg-white p-4 dark:bg-slate-950 sm:grid-cols-[1fr_120px] sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={getImageUrl(item.image_url, '/placeholder-product.png')}
                        alt={item.product_name}
                        className="h-16 w-16 flex-none rounded-md bg-slate-100 object-cover object-top dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-black text-slate-950 dark:text-white">{item.product_name}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Size {item.size || '-'} · Màu {item.color || '-'}</div>
                        <div className="mt-1 text-xs font-bold text-premium-700 dark:text-premium-300">
                          {formatPrice(item.unit_price)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-left text-sm font-black text-slate-950 dark:text-white sm:text-right">
                      {formatPrice(Number(item.unit_price || 0) * Number(item.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ml-auto w-full max-w-sm space-y-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Tạm tính</span>
                <span className="font-bold">{formatPrice(selectedOrder.subtotal_amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Phí vận chuyển</span>
                <span className="font-bold">{formatPrice(selectedOrder.shipping_fee || 0)}</span>
              </div>
              {selectedOrder.coupon_code && (
                <div className="flex items-center justify-between text-sm text-premium-700 dark:text-premium-300">
                  <span>Mã giảm giá</span>
                  <span className="font-bold">{selectedOrder.coupon_code}</span>
                </div>
              )}
              {Number(selectedOrder.discount_amount || 0) > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700 dark:text-emerald-300">
                  <span>Giảm giá</span>
                  <span className="font-bold">-{formatPrice(selectedOrder.discount_amount)}</span>
                </div>
              )}
              {Number(selectedOrder.shipping_discount_amount || 0) > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700 dark:text-emerald-300">
                  <span>Giảm phí ship</span>
                  <span className="font-bold">-{formatPrice(selectedOrder.shipping_discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-950 dark:text-white">Tổng thanh toán</span>
                  <span className="text-lg font-black text-premium-800 dark:text-premium-300">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageOrders;
