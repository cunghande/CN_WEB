import UserAddress from '../models/UserAddress.model.js';
import { buildShippingQuote } from '../services/shippingService.js';
import { sendResponse } from '../utils/helpers.js';

export const quoteShipping = async (req, res, next) => {
  try {
    let address = req.body.address;

    if (req.body.address_id) {
      address = await UserAddress.findByIdForUser(req.body.address_id, req.user.id);
    }

    if (!address) {
      return sendResponse(res, 400, false, 'Vui lòng chọn địa chỉ giao hàng');
    }

    return sendResponse(res, 200, true, 'Tính phí giao hàng thành công', buildShippingQuote(address));
  } catch (error) {
    next(error);
  }
};
