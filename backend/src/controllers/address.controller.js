import UserAddress from '../models/UserAddress.model.js';
import { sendResponse } from '../utils/helpers.js';

const requiredFields = [
  'receiver_name',
  'receiver_phone',
  'province_code',
  'province_name',
  'district_code',
  'district_name',
  'ward_code',
  'ward_name',
  'address_line'
];

const validateAddress = (body) => requiredFields.every((field) => body[field]);

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await UserAddress.findByUserId(req.user.id);
    return sendResponse(res, 200, true, 'Lấy danh sách địa chỉ thành công', addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    if (!validateAddress(req.body)) {
      return sendResponse(res, 400, false, 'Vui lòng nhập đầy đủ địa chỉ giao hàng');
    }

    const id = await UserAddress.create(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Thêm địa chỉ thành công', { id });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    if (!validateAddress(req.body)) {
      return sendResponse(res, 400, false, 'Vui lòng nhập đầy đủ địa chỉ giao hàng');
    }

    await UserAddress.update(req.params.id, req.user.id, req.body);
    return sendResponse(res, 200, true, 'Cập nhật địa chỉ thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await UserAddress.delete(req.params.id, req.user.id);
    return sendResponse(res, 200, true, 'Xóa địa chỉ thành công');
  } catch (error) {
    next(error);
  }
};
