import Order from '../models/Order.model.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { sendResponse } from '../utils/helpers.js';

const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const createOrder = async (req, res, next) => {
  try {
    const { items, total_amount } = req.body;

    if (!items || items.length === 0 || !total_amount) {
      return sendResponse(res, 400, false, 'Giỏ hàng trống hoặc thông tin đơn hàng không hợp lệ');
    }

    const orderId = await Order.create({
      user_id: req.user.id,
      items,
      total_amount
    });

    sendOrderConfirmationEmail(req.user.email, orderId, total_amount);

    return sendResponse(res, 201, true, 'Đặt hàng thành công', { order_id: orderId });
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

    if (!order) {
      return sendResponse(res, 404, false, 'Không tìm thấy đơn hàng');
    }

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

    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, 'Trạng thái đơn hàng không hợp lệ');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendResponse(res, 404, false, 'Không tìm thấy đơn hàng');
    }

    await Order.updateStatus(req.params.id, status);
    return sendResponse(res, 200, true, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};
