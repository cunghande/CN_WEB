import React, { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Crown,
  Eye,
  KeyRound,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import {
  getAdminUserDetailAPI,
  getUsersAPI,
  sendAdminUserResetPasswordAPI,
  updateAdminUserRoleAPI,
  updateAdminUserStatusAPI
} from '../../services/authService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getOrderDate, statusMeta } from '../../utils/productHelpers.js';

const roleMeta = {
  admin: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
  customer: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
};

const statusMetaUser = {
  active: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  blocked: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800'
};

const getUi = (theme) => {
  const isDark = theme === 'dark';
  return {
    page: isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f3ee] text-slate-950',
    panel: isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white',
    soft: isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    input: isDark ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950',
    rowHover: isDark ? 'hover:bg-slate-800/70' : 'hover:bg-[#f6f3ee]'
  };
};

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${className}`}>
    {children}
  </span>
);

const ManageUsers = () => {
  const theme = useSelector((state) => state.auth.theme);
  const currentUser = useSelector((state) => state.auth.user);
  const ui = getUi(theme);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsersAPI();
      setUsers(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const cleanKeyword = keyword.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword = !cleanKeyword
        || user.full_name?.toLowerCase().includes(cleanKeyword)
        || user.email?.toLowerCase().includes(cleanKeyword)
        || user.phone?.includes(cleanKeyword);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;
      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [keyword, roleFilter, statusFilter, users]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    blocked: users.filter((user) => user.status === 'blocked').length,
    revenue: users.reduce((sum, user) => sum + Number(user.total_spent || 0), 0)
  }), [users]);

  const openDetail = async (id) => {
    setDetailOpen(true);
    setSelectedUser(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const response = await getAdminUserDetailAPI(id);
      setSelectedUser(response.data);
    } catch (error) {
      setDetailError(error.response?.data?.message || 'Không tải được chi tiết người dùng. Vui lòng thử lại.');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!selectedUser?.id) return;
    const response = await getAdminUserDetailAPI(selectedUser.id);
    setSelectedUser(response.data);
    await fetchUsers();
  };

  const runAction = async (key, action) => {
    setActionLoading(key);
    setMessage('');
    try {
      const response = await action();
      setMessage(response.message || 'Thao tác thành công');
      await refreshDetail();
    } finally {
      setActionLoading('');
    }
  };

  const closeModal = () => {
    setDetailOpen(false);
    setSelectedUser(null);
    setDetailError('');
    setMessage('');
  };

  return (
    <div className={`min-h-screen py-10 ${ui.page}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-300">Quản trị cửa hàng</p>
            <h1 className="mt-1 text-3xl font-black">Quản lý người dùng</h1>
            <p className={`mt-2 text-sm ${ui.muted}`}>Theo dõi khách hàng, lịch sử mua hàng, trạng thái tài khoản và quyền truy cập.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchUsers}>Làm mới</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Tài khoản', value: stats.total, icon: Users },
            { label: 'Admin', value: stats.admins, icon: ShieldCheck },
            { label: 'Bị khóa', value: stats.blocked, icon: Ban },
            { label: 'Tổng chi tiêu', value: formatPrice(stats.revenue), icon: ShoppingBag }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-3xl border p-5 shadow-sm ${ui.panel}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-black uppercase ${ui.muted}`}>{card.label}</div>
                    <div className="mt-2 text-2xl font-black">{card.value}</div>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className={`mt-6 rounded-3xl border p-4 shadow-sm ${ui.panel}`}>
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <label className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${ui.input}`}>
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tên, email, số điện thoại..."
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </label>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold outline-none ${ui.input}`}>
              <option value="all">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold outline-none ${ui.input}`}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="blocked">Đã khóa</option>
            </select>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            {loading ? (
              <div className="py-16"><Spinner size="lg" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs font-black uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Người dùng</th>
                      <th className="px-4 py-3">Vai trò</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Đơn hàng</th>
                      <th className="px-4 py-3">Chi tiêu</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={ui.rowHover}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={getImageUrl(user.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')} alt={user.full_name} className="h-11 w-11 rounded-full object-cover" />
                            <div>
                              <div className="font-black">{user.full_name}</div>
                              <div className={`text-xs ${ui.muted}`}>{user.email}</div>
                              {user.phone && <div className={`text-xs ${ui.muted}`}>{user.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge className={roleMeta[user.role] || roleMeta.customer}>{user.role === 'admin' ? 'Admin' : 'Khách hàng'}</Badge></td>
                        <td className="px-4 py-3"><Badge className={statusMetaUser[user.status || 'active']}>{user.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}</Badge></td>
                        <td className="px-4 py-3 font-bold">{user.order_count || 0}</td>
                        <td className="px-4 py-3 font-black text-emerald-700 dark:text-emerald-300">{formatPrice(user.total_spent || 0)}</td>
                        <td className={`px-4 py-3 ${ui.muted}`}>{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => openDetail(user.id)}><Eye className="h-4 w-4" />Chi tiết</Button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="7" className={`px-4 py-10 text-center ${ui.muted}`}>Không tìm thấy người dùng phù hợp.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal isOpen={detailOpen} onClose={closeModal} title="Chi tiết người dùng" maxWidth="max-w-5xl">
        {detailLoading ? (
          <div className="py-16"><Spinner size="lg" /></div>
        ) : detailError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            {detailError}
          </div>
        ) : selectedUser ? (
          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <img src={getImageUrl(selectedUser.avatar_url, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')} alt={selectedUser.full_name} className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <div className="text-xl font-black text-slate-950 dark:text-white">{selectedUser.full_name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{selectedUser.email}</span>
                    {selectedUser.phone && <span>{selectedUser.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={roleMeta[selectedUser.role] || roleMeta.customer}>{selectedUser.role === 'admin' ? 'Admin' : 'Khách hàng'}</Badge>
                <Badge className={statusMetaUser[selectedUser.status || 'active']}>{selectedUser.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}</Badge>
              </div>
            </div>

            {message && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">{message}</div>}

            <div className="grid gap-3 md:grid-cols-4">
              <div className={`rounded-2xl border p-4 ${ui.soft}`}><div className={ui.muted}>Đơn hàng</div><div className="mt-1 text-xl font-black">{selectedUser.summary?.order_count || 0}</div></div>
              <div className={`rounded-2xl border p-4 ${ui.soft}`}><div className={ui.muted}>Đã nhận</div><div className="mt-1 text-xl font-black">{selectedUser.summary?.delivered_count || 0}</div></div>
              <div className={`rounded-2xl border p-4 ${ui.soft}`}><div className={ui.muted}>Đã hủy</div><div className="mt-1 text-xl font-black">{selectedUser.summary?.cancelled_count || 0}</div></div>
              <div className={`rounded-2xl border p-4 ${ui.soft}`}><div className={ui.muted}>Tổng chi tiêu</div><div className="mt-1 text-xl font-black text-emerald-700 dark:text-emerald-300">{formatPrice(selectedUser.summary?.total_spent || 0)}</div></div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedUser.status === 'blocked' ? 'secondary' : 'danger'}
                disabled={actionLoading === 'status' || selectedUser.id === currentUser?.id}
                onClick={() => runAction('status', () => updateAdminUserStatusAPI(selectedUser.id, selectedUser.status === 'blocked' ? 'active' : 'blocked'))}
              >
                <Ban className="h-4 w-4" />{selectedUser.status === 'blocked' ? 'Mở khóa' : 'Khóa tài khoản'}
              </Button>
              <Button
                variant="outline"
                disabled={actionLoading === 'role' || selectedUser.id === currentUser?.id}
                onClick={() => runAction('role', () => updateAdminUserRoleAPI(selectedUser.id, selectedUser.role === 'admin' ? 'customer' : 'admin'))}
              >
                <Crown className="h-4 w-4" />{selectedUser.role === 'admin' ? 'Chuyển thành khách' : 'Cấp quyền admin'}
              </Button>
              <Button variant="outline" disabled={actionLoading === 'reset'} onClick={() => runAction('reset', () => sendAdminUserResetPasswordAPI(selectedUser.id))}>
                <KeyRound className="h-4 w-4" />Gửi reset mật khẩu
              </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className={`rounded-3xl border p-4 ${ui.panel}`}>
                <h3 className="flex items-center gap-2 font-black"><ShoppingBag className="h-4 w-4" />Đơn hàng gần đây</h3>
                <div className="mt-3 space-y-2">
                  {selectedUser.orders?.map((order) => {
                    const meta = statusMeta[order.status] || { label: order.status, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
                    return (
                      <div key={order.id} className={`flex items-center justify-between rounded-2xl border p-3 ${ui.soft}`}>
                        <div>
                          <div className="font-black">#{order.id} · {formatPrice(order.total_amount)}</div>
                          <div className={`text-xs ${ui.muted}`}>{getOrderDate(order) ? new Date(getOrderDate(order)).toLocaleString('vi-VN') : '-'}</div>
                        </div>
                        <Badge className={meta.tone}>{meta.label}</Badge>
                      </div>
                    );
                  })}
                  {!selectedUser.orders?.length && <div className={`text-sm ${ui.muted}`}>Chưa có đơn hàng.</div>}
                </div>
              </section>

              <section className={`rounded-3xl border p-4 ${ui.panel}`}>
                <h3 className="flex items-center gap-2 font-black"><MapPin className="h-4 w-4" />Địa chỉ giao hàng</h3>
                <div className="mt-3 space-y-2">
                  {selectedUser.addresses?.map((address) => (
                    <div key={address.id} className={`rounded-2xl border p-3 text-sm ${ui.soft}`}>
                      <div className="font-black">{address.receiver_name} · {address.receiver_phone}</div>
                      <div className={`mt-1 ${ui.muted}`}>{[address.address_line, address.hamlet, address.ward_name, address.district_name, address.province_name].filter(Boolean).join(', ')}</div>
                      {address.is_default ? <div className="mt-2 text-xs font-black text-emerald-600 dark:text-emerald-300">Mặc định</div> : null}
                    </div>
                  ))}
                  {!selectedUser.addresses?.length && <div className={`text-sm ${ui.muted}`}>Chưa có địa chỉ.</div>}
                </div>
              </section>
            </div>

            <section className={`rounded-3xl border p-4 ${ui.panel}`}>
              <h3 className="flex items-center gap-2 font-black"><UserRound className="h-4 w-4" />Bình luận gần đây</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {selectedUser.comments?.map((comment) => (
                  <div key={comment.id} className={`rounded-2xl border p-3 text-sm ${ui.soft}`}>
                    <div className="font-black">{comment.product_name}</div>
                    <p className={`mt-1 line-clamp-2 ${ui.muted}`}>{comment.content}</p>
                  </div>
                ))}
                {!selectedUser.comments?.length && <div className={`text-sm ${ui.muted}`}>Chưa có bình luận.</div>}
              </div>
            </section>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageUsers;
