import Notification from '../models/Notification.model.js';
import Order from '../models/Order.model.js';
import UserAddress from '../models/UserAddress.model.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { buildShippingQuote } from '../services/shippingService.js';
import { sendResponse } from '../utils/helpers.js';

const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabels = {
  pending: 'đang chờ xử lý',
  processing: 'đang được chuẩn bị',
  shipped: 'đang giao',
  delivered: 'đã giao thành công',
  cancelled: 'đã hủy'
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, address_id, shipping_note } = req.body;
    if (!items || items.length === 0 || !address_id) {
      return sendResponse(res, 400, false, 'Vui lòng chọn sản phẩm và địa chỉ giao hàng');
    }

    const address = await UserAddress.findByIdForUser(address_id, req.user.id);
    if (!address) return sendResponse(res, 404, false, 'Không tìm thấy địa chỉ giao hàng');

    const subtotal_amount = items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
    const { shipping_fee } = buildShippingQuote(address);
    const total_amount = subtotal_amount + shipping_fee;

    const orderId = await Order.create({
      user_id: req.user.id,
      items,
      subtotal_amount,
      shipping_fee,
      total_amount,
      address,
      shipping_note
    });

    sendOrderConfirmationEmail(req.user.email, orderId, total_amount);
    return sendResponse(res, 201, true, 'Đặt hàng thành công', { order_id: orderId, shipping_fee, total_amount });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    return sendResponse(res, 200, true, 'Lấy lịch sử đơn hàng thành công', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Không tìm thấy đơn hàng');
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return sendResponse(res, 403, false, 'Bạn không có quyền xem đơn hàng này');
    }
    return sendResponse(res, 200, true, 'Lấy chi tiết đơn hàng thành công', order);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    return sendResponse(res, 200, true, 'Lấy danh sách tất cả đơn hàng thành công', orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!validStatuses.includes(status)) return sendResponse(res, 400, false, 'Trạng thái đơn hàng không hợp lệ');

    const order = await Order.updateStatus(req.params.id, status);
    if (!order) return sendResponse(res, 404, false, 'Không tìm thấy đơn hàng');

    await Notification.create({
      user_id: order.user_id,
      actor_user_id: req.user.id,
      order_id: order.id,
      title: `Đơn hàng #${order.id} ${statusLabels[status]}`,
      message: `Trạng thái đơn hàng của bạn vừa được cập nhật: ${statusLabels[status]}.`,
      type: 'order',
      target_url: '/orders',
      entity_type: 'order',
      entity_id: order.id
    });

    return sendResponse(res, 200, true, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};
