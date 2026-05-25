import { sendResponse } from '../utils/helpers.js';

const API_BASE = 'https://provinces.open-api.vn/api/v1';

const fallbackProvinces = [
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '79', name: 'Thành phố Hồ Chí Minh' },
  { code: '48', name: 'Thành phố Đà Nẵng' },
  { code: '92', name: 'Thành phố Cần Thơ' },
  { code: '31', name: 'Thành phố Hải Phòng' }
];

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Không thể tải dữ liệu địa giới hành chính');
  return response.json();
};

export const getProvinces = async (req, res, next) => {
  try {
    const data = await fetchJson(`${API_BASE}/p/`);
    return sendResponse(res, 200, true, 'Lấy danh sách tỉnh thành công', data);
  } catch (error) {
    return sendResponse(res, 200, true, 'Dùng danh sách tỉnh dự phòng', fallbackProvinces);
  }
};

export const getDistricts = async (req, res, next) => {
  try {
    const { provinceCode } = req.query;
    if (!provinceCode) return sendResponse(res, 400, false, 'Thiếu mã tỉnh/thành');

    const data = await fetchJson(`${API_BASE}/p/${provinceCode}?depth=2`);
    return sendResponse(res, 200, true, 'Lấy danh sách quận huyện thành công', data.districts || []);
  } catch (error) {
    next(error);
  }
};

export const getWards = async (req, res, next) => {
  try {
    const { districtCode } = req.query;
    if (!districtCode) return sendResponse(res, 400, false, 'Thiếu mã quận/huyện');

    const data = await fetchJson(`${API_BASE}/d/${districtCode}?depth=2`);
    return sendResponse(res, 200, true, 'Lấy danh sách xã phường thành công', data.wards || []);
  } catch (error) {
    next(error);
  }
};
