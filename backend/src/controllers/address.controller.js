import UserAddress from '../models/UserAddress.model.js';
import { sendResponse } from '../utils/helpers.js';
import { normalizePhone, normalizeText, validateAddressPayload } from '../utils/validators.js';

const cleanAddressPayload = (body) => ({
  ...body,
  receiver_name: normalizeText(body.receiver_name),
  receiver_phone: normalizePhone(body.receiver_phone),
  province_name: normalizeText(body.province_name),
  district_name: normalizeText(body.district_name),
  ward_name: normalizeText(body.ward_name),
  hamlet: normalizeText(body.hamlet),
  address_line: normalizeText(body.address_line)
});

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
    const error = validateAddressPayload(req.body);
    if (error) return sendResponse(res, 400, false, error);

    const id = await UserAddress.create(req.user.id, cleanAddressPayload(req.body));
    return sendResponse(res, 201, true, 'Thêm địa chỉ thành công', { id });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const error = validateAddressPayload(req.body);
    if (error) return sendResponse(res, 400, false, error);

    await UserAddress.update(req.params.id, req.user.id, cleanAddressPayload(req.body));
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
