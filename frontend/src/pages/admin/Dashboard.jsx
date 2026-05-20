import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Plus, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { getUsersAPI } from '../../services/authService.js';
import { getAllOrdersAPI } from '../../services/orderService.js';
import { getProductsAPI } from '../../services/productService.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getOrderDate, getProductStock, statusMeta } from '../../utils/productHelpers.js';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          getUsersAPI(),
          getProductsAPI(),
          getAllOrdersAPI()
        ]);

        setUsers(usersRes.data || []);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.error('Lỗi tải dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const lowStock = products.filter((product) => getProductStock(product) <= 10).length;
    const pending = orders.filter((order) => order.status === 'pending').length;

    return { totalRevenue, lowStock, pending };
  }, [orders, products]);

  const cards = [
    { label: 'Doanh thu', value: formatPrice(stats.totalRevenue), icon: TrendingUp, tone: 'bg-premium-50 text-premium-800' },
    { label: 'Đơn hàng', value: orders.length, icon: ShoppingBag, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Sản phẩm', value: products.length, icon: Package, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Khách hàng', value: users.length, icon: Users, tone: 'bg-indigo-50 text-indigo-700' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700">Quản trị cửa hàng</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard vận hành</h1>
            <p className="mt-2 text-sm text-slate-500">Theo dõi doanh thu, đơn mới, sản phẩm và tồn kho thấp.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/products" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
              <Plus className="h-4 w-4" />
              Sản phẩm
            </Link>
            <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-md bg-premium-700 px-4 py-2 text-sm font-bold text-white hover:bg-premium-800">
              <ShoppingBag className="h-4 w-4" />
              Đơn hàng
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-500">{card.label}</div>
                      <div className="mt-2 text-2xl font-black text-slate-950">{card.value}</div>
                    </div>
                    <div className={`grid h-12 w-12 place-items-center rounded-md ${card.tone}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                  <h3 className="font-black text-amber-900">Cần xử lý</h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-2xl font-black text-amber-900">{stats.pending}</div><div className="text-amber-700">Đơn chờ xử lý</div></div>
                  <div><div className="text-2xl font-black text-amber-900">{stats.lowStock}</div><div className="text-amber-700">Sản phẩm tồn thấp</div></div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black text-slate-950">Đơn hàng mới nhất</h3>
                  <Link to="/admin/orders" className="text-sm font-bold text-premium-700 hover:text-premium-900">Xem tất cả</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-3 pr-4">Mã</th>
                        <th className="py-3 pr-4">Khách hàng</th>
                        <th className="py-3 pr-4">Tổng tiền</th>
                        <th className="py-3 pr-4">Trạng thái</th>
                        <th className="py-3">Ngày đặt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 6).map((order) => {
                        const meta = statusMeta[order.status] || { label: order.status, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
                        return (
                          <tr key={order.id}>
                            <td className="py-3 pr-4 font-black text-slate-950">#{order.id}</td>
                            <td className="py-3 pr-4">
                              <div className="font-bold text-slate-900">{order.full_name}</div>
                              <div className="text-xs text-slate-500">{order.email}</div>
                            </td>
                            <td className="py-3 pr-4 font-black text-premium-800">{formatPrice(order.total_amount)}</td>
                            <td className="py-3 pr-4"><span className={`rounded-full border px-2 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span></td>
                            <td className="py-3 text-xs text-slate-500">{new Date(getOrderDate(order)).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
