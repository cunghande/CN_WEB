export const getProductStock = (product) => {
  return product?.variants?.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0) || 0;
};

export const getLowestStockVariant = (product) => {
  return product?.variants?.find((variant) => Number(variant.stock_quantity) > 0) || product?.variants?.[0] || null;
};

export const statusMeta = {
  pending: { label: 'Chờ xử lý', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Đang chuẩn bị', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Đang giao', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered: { label: 'Hoàn thành', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', tone: 'bg-red-50 text-red-700 border-red-200' }
};

export const getOrderDate = (order) => order?.order_date || order?.created_at || order?.createdAt;
