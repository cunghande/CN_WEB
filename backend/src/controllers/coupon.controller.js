import Coupon from '../models/Coupon.model.js';
import { sendResponse } from '../utils/helpers.js';

const buildCouponContext = (body = {}, query = {}) => ({
  subtotalAmount: body.subtotal_amount ?? query.subtotal_amount ?? 0,
  shippingFee: body.shipping_fee ?? query.shipping_fee ?? 0,
  itemCount: body.item_count ?? query.item_count ?? 0
});

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, user_coupon_id, coupons, subtotal_amount, shipping_fee } = req.body;
    
    let couponList = coupons || [];
    if (!coupons && (code || user_coupon_id)) {
      couponList = [{ code, user_coupon_id }];
    }

    if (couponList.length === 0) {
      return sendResponse(res, 400, false, 'Vui lòng nhập mã hoặc chọn voucher');
    }

    const result = await Coupon.validateMultiple({
      coupons: couponList,
      userId: req.user.id,
      subtotalAmount: subtotal_amount,
      shippingFee: shipping_fee
    });

    const isFullyValid = result.valid && result.errors.length === 0;
    const message = isFullyValid ? 'Áp dụng mã giảm giá thành công' : result.errors[0]?.message || 'Có mã giảm giá không hợp lệ';

    return sendResponse(res, isFullyValid ? 200 : 400, isFullyValid, message, result);
  } catch (error) {
    next(error);
  }
};

export const getEventCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.listEventCoupons(req.user.id, buildCouponContext(req.body, req.query));
    return sendResponse(res, 200, true, 'Lấy danh sách nhiệm vụ voucher thành công', coupons);
  } catch (error) {
    next(error);
  }
};

export const getMyCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.listMyCoupons(req.user.id, buildCouponContext(req.body, req.query));
    return sendResponse(res, 200, true, 'Lấy ví voucher thành công', coupons);
  } catch (error) {
    next(error);
  }
};

export const claimCoupon = async (req, res, next) => {
  try {
    const result = await Coupon.claim(req.params.id, req.user.id, buildCouponContext(req.body, req.query));
    return sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data || null);
  } catch (error) {
    next(error);
  }
};

const validateAdminCoupon = (data) => {
  const percent = Number(data.discount_percent || 0);
  const maxDiscount = data.max_discount_amount === null || data.max_discount_amount === '' ? null : Number(data.max_discount_amount);
  const minOrder = Number(data.min_order_amount || 0);
  const type = data.type;

  if (!data.code || !data.code.trim()) {
    throw new Error('Mã giảm giá không được để trống');
  }

  if (type === 'percent' || type === 'shipping_percent') {
    if (percent <= 0 || percent > 80) {
      throw new Error('Tỉ lệ giảm giá phải từ 1% đến 80% để tránh tổn thất quá lớn');
    }
    if (maxDiscount === null || maxDiscount <= 0) {
      throw new Error('Voucher theo phần trăm bắt buộc phải cài đặt số tiền giảm tối đa (Max Discount)');
    }
    if (maxDiscount > minOrder * 0.8 && minOrder > 0) {
      throw new Error('Số tiền giảm tối đa không được vượt quá 80% số tiền đơn hàng tối thiểu');
    }
  } else if (type === 'free_shipping') {
    if (minOrder < 20000 && data.claim_type !== 'new_user') {
      throw new Error('Đơn hàng tối thiểu cho mã miễn phí vận chuyển phải từ 20.000đ (ngoại trừ ưu đãi khách hàng mới)');
    }
  }

  if (data.starts_at && data.expires_at) {
    if (new Date(data.starts_at) >= new Date(data.expires_at)) {
      throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
    }
  }
};

export const adminGetCoupons = async (req, res, next) => {
  try {
    const list = await Coupon.listAll();
    return sendResponse(res, 200, true, 'Lấy danh sách voucher thành công', list);
  } catch (error) {
    next(error);
  }
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const data = req.body;
    try {
      validateAdminCoupon(data);
    } catch (err) {
      return sendResponse(res, 400, false, err.message);
    }

    const existing = await Coupon.findByCode(data.code);
    if (existing) {
      return sendResponse(res, 400, false, 'Mã giảm giá đã tồn tại');
    }

    const insertId = await Coupon.create(data);
    return sendResponse(res, 201, true, 'Tạo voucher thành công', { id: insertId });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    try {
      validateAdminCoupon(data);
    } catch (err) {
      return sendResponse(res, 400, false, err.message);
    }

    const existing = await Coupon.findById(id);
    if (!existing) {
      return sendResponse(res, 404, false, 'Không tìm thấy voucher');
    }

    await Coupon.update(id, data);
    return sendResponse(res, 200, true, 'Cập nhật voucher thành công');
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await Coupon.findById(id);
    if (!existing) {
      return sendResponse(res, 404, false, 'Không tìm thấy voucher');
    }

    await Coupon.delete(id);
    return sendResponse(res, 200, true, 'Xóa voucher thành công');
  } catch (error) {
    next(error);
  }
};
