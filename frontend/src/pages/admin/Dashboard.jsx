import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertTriangle, Package, ShoppingBag, TicketPercent, TrendingUp, Users } from 'lucide-react';
import { getUsersAPI } from '../../services/authService.js';
import { getAllOrdersAPI } from '../../services/orderService.js';
import { getProductsAPI } from '../../services/productService.js';
import Spinner from '../../components/common/Spinner.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getOrderDate, getProductStock, statusMeta } from '../../utils/productHelpers.js';

const getUi = (theme) => {
  const isDark = theme === 'dark';
  return {
    isDark,
    page: isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f3ee] text-slate-950',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    headingMuted: isDark ? 'text-emerald-300' : 'text-emerald-700',
    panel: isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white',
    tableDivider: isDark ? 'divide-slate-800' : 'divide-slate-100',
    tableHead: isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500',
    rowHover: isDark ? 'hover:bg-slate-800/60' : 'hover:bg-[#f6f3ee]',
    outlineButton: isDark
      ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
      : 'border-slate-300 bg-white text-slate-800 hover:bg-[#f6f3ee]',
    blackButton: isDark
      ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
      : 'bg-slate-950 text-white hover:bg-slate-800',
    warningPanel: isDark
      ? 'border-amber-900/70 bg-amber-950/25 text-amber-100'
      : 'border-amber-200 bg-amber-50 text-amber-900'
  };
};

const Dashboard = () => {
  const theme = useSelector((state) => state.auth.theme);
  const ui = getUi(theme);
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
    { label: 'Doanh thu', value: formatPrice(stats.totalRevenue), icon: TrendingUp, tone: ui.isDark ? 'bg-emerald-900/35 text-emerald-200' : 'bg-emerald-50 text-emerald-800' },
    { label: 'Đơn hàng', value: orders.length, icon: ShoppingBag, tone: ui.isDark ? 'bg-blue-950/45 text-blue-200' : 'bg-blue-50 text-blue-700' },
    { label: 'Sản phẩm', value: products.length, icon: Package, tone: ui.isDark ? 'bg-amber-950/45 text-amber-200' : 'bg-amber-50 text-amber-700' },
    { label: 'Khách hàng', value: users.length, icon: Users, tone: ui.isDark ? 'bg-indigo-950/45 text-indigo-200' : 'bg-indigo-50 text-indigo-700' }
  ];

  return (
    <div className={`min-h-screen py-10 transition-colors ${ui.page}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className={`text-sm font-bold uppercase ${ui.headingMuted}`}>Quản trị cửa hàng</p>
            <h1 className="mt-1 text-3xl font-black">Dashboard vận hành</h1>
            <p className={`mt-2 text-sm ${ui.muted}`}>Theo dõi doanh thu, đơn mới, sản phẩm, khách hàng và tồn kho thấp.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/products" className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${ui.outlineButton}`}>
              <Package className="h-4 w-4" />
              Sản phẩm
            </Link>
            <Link to="/admin/orders" className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${ui.outlineButton}`}>
              <ShoppingBag className="h-4 w-4" />
              Đơn hàng
            </Link>
            <Link to="/admin/users" className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${ui.outlineButton}`}>
              <Users className="h-4 w-4" />
              Người dùng
            </Link>
            <Link to="/admin/coupons" className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition ${ui.blackButton}`}>
              <TicketPercent className="h-4 w-4" />
              Voucher / Mã KM
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className={`rounded-3xl border p-5 shadow-sm transition-colors ${ui.panel}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-bold ${ui.muted}`}>{card.label}</div>
                      <div className="mt-2 text-2xl font-black">{card.value}</div>
                    </div>
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.tone}`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className={`rounded-3xl border p-5 transition-colors ${ui.warningPanel}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-black">Cần xử lý</h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-2xl font-black">{stats.pending}</div><div className="opacity-80">Đơn chờ xử lý</div></div>
                  <div><div className="text-2xl font-black">{stats.lowStock}</div><div className="opacity-80">Sản phẩm tồn thấp</div></div>
                </div>
              </div>

              <div className={`rounded-3xl border p-5 transition-colors lg:col-span-2 ${ui.panel}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black">Đơn hàng mới nhất</h3>
                  <Link to="/admin/orders" className={`text-sm font-bold ${ui.isDark ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-900'}`}>Xem tất cả</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`border-b text-xs uppercase ${ui.tableHead}`}>
                      <tr>
                        <th className="py-3 pr-4">Mã</th>
                        <th className="py-3 pr-4">Khách hàng</th>
                        <th className="py-3 pr-4">Tổng tiền</th>
                        <th className="py-3 pr-4">Trạng thái</th>
                        <th className="py-3">Ngày đặt</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${ui.tableDivider}`}>
                      {orders.slice(0, 6).map((order) => {
                        const meta = statusMeta[order.status] || { label: order.status, tone: ui.isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-[#f6f3ee] text-slate-700 border-slate-200' };
                        return (
                          <tr key={order.id} className={`transition ${ui.rowHover}`}>
                            <td className="py-3 pr-4 font-black">#{order.id}</td>
                            <td className="py-3 pr-4">
                              <div className="font-bold">{order.full_name}</div>
                              <div className={`text-xs ${ui.muted}`}>{order.email}</div>
                            </td>
                            <td className={`py-3 pr-4 font-black ${ui.isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>{formatPrice(order.total_amount)}</td>
                            <td className="py-3 pr-4"><span className={`rounded-full border px-2 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span></td>
                            <td className={`py-3 text-xs ${ui.muted}`}>{getOrderDate(order) ? new Date(getOrderDate(order)).toLocaleDateString('vi-VN') : '-'}</td>
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
