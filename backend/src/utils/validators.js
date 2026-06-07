const phoneRegex = /^(0)(3|5|7|8|9)\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRegex = /^[\p{L}\s'.-]{2,80}$/u;

export const normalizeText = (value = '') => String(value).trim().replace(/\s+/g, ' ');
export const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

export const isValidEmail = (value = '') => emailRegex.test(String(value).trim().toLowerCase());
export const isValidVietnamPhone = (value = '') => phoneRegex.test(normalizePhone(value));
export const isValidPersonName = (value = '') => nameRegex.test(normalizeText(value));
export const isStrongEnoughPassword = (value = '') => (
  typeof value === 'string'
  && value.length >= 6
  && /[A-Za-z]/.test(value)
  && /\d/.test(value)
);

export const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
export const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export const validateProfilePayload = ({ full_name, phone, gender }) => {
  const cleanName = normalizeText(full_name);
  if (!isValidPersonName(cleanName)) return 'Họ tên phải từ 2-80 ký tự và không chứa số hoặc ký tự đặc biệt.';
  if (phone && !isValidVietnamPhone(phone)) return 'Số điện thoại phải là số Việt Nam hợp lệ, gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
  if (gender && !['male', 'female', 'other', 'unspecified'].includes(gender)) return 'Giới tính không hợp lệ.';
  return '';
};

export const validateAddressPayload = (data = {}) => {
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

  if (requiredFields.some((field) => !normalizeText(data[field]))) {
    return 'Vui lòng nhập đầy đủ địa chỉ giao hàng.';
  }
  if (!isValidPersonName(data.receiver_name)) return 'Tên người nhận phải từ 2-80 ký tự và không chứa số hoặc ký tự đặc biệt.';
  if (!isValidVietnamPhone(data.receiver_phone)) return 'Số điện thoại người nhận phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
  if (normalizeText(data.address_line).length < 5) return 'Địa chỉ chi tiết cần tối thiểu 5 ký tự.';
  if (data.hamlet && normalizeText(data.hamlet).length > 80) return 'Thôn/ấp/tổ không được vượt quá 80 ký tự.';
  return '';
};
