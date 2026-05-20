import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Package, RefreshCw, Search, Truck, XCircle } from 'lucide-react';
import Spinner from '../../components/common/Spinner.jsx';
import { getAllOrdersAPI, updateOrderStatusAPI } from '../../services/orderService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getOrderDate, statusMeta } from '../../utils/productHelpers.js';

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle
};

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

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      const keyword = searchTerm.toLowerCase();
      const matchesSearch = !keyword
        || String(order.id).includes(keyword)
        || order.full_name?.toLowerCase().includes(keyword)
        || order.email?.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatusAPI(id, newStatus);
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status: newStatus } : order));
    } catch {
      alert('Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700">Vận hành đơn hàng</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Quản lý đơn hàng</h1>
            <p className="mt-2 text-sm text-slate-500">Lọc, theo dõi và cập nhật tiến độ giao hàng.</p>
          </div>
          <button onClick={fetchOrders} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mã đơn, tên khách, email..."
              className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-premium-500"
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang chuẩn bị</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-slate-500">Không có đơn hàng phù hợp.</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-slate-950">Đơn hàng #{order.id}</h3>
                    <StatusBadge status={order.status} />
                    <span className="text-xs font-medium text-slate-500">{new Date(getOrderDate(order)).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Trạng thái</label>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) => handleStatusChange(order.id, event.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-premium-500 disabled:opacity-50"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang chuẩn bị</option>
                      <option value="shipped">Đang giao</option>
                      <option value="delivered">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    {updatingId === order.id && <Spinner size="sm" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400">Khách hàng</div>
                    <div className="mt-1 font-black text-slate-950">{order.full_name}</div>
                    <div className="text-sm text-slate-500">{order.email}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-slate-400">Thanh toán</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">COD khi nhận hàng</div>
                    <div className="text-sm text-slate-500">Không dùng cổng thanh toán online</div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xs font-black uppercase text-slate-400">Tổng tiền</div>
                    <div className="mt-1 text-xl font-black text-premium-800">{formatPrice(order.total_amount)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
