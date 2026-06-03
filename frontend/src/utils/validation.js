const vietnamPhoneRegex = /^(0)(3|5|7|8|9)\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const personNameRegex = /^[\p{L}\s'.-]{2,80}$/u;

export const normalizeText = (value = '') => String(value).trim().replace(/\s+/g, ' ');
export const normalizePhone = (value = '') => String(value).replace(/\D/g, '');
export const isValidEmail = (value = '') => emailRegex.test(String(value).trim().toLowerCase());
export const isValidVietnamPhone = (value = '') => vietnamPhoneRegex.test(normalizePhone(value));
export const isValidPersonName = (value = '') => personNameRegex.test(normalizeText(value));
export const isStrongEnoughPassword = (value = '') => (
  typeof value === 'string'
  && value.length >= 6
  && /[A-Za-z]/.test(value)
  && /\d/.test(value)
);

export const validateProfile = ({ full_name, phone, gender }) => {
  if (!isValidPersonName(full_name)) return 'Họ tên phải từ 2-80 ký tự và không chứa số hoặc ký tự đặc biệt.';
  if (phone && !isValidVietnamPhone(phone)) return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
  if (gender && !['male', 'female', 'other', 'unspecified'].includes(gender)) return 'Giới tính không hợp lệ.';
  return '';
};

export const validateAddress = (address) => {
  const requiredFields = ['receiver_name', 'receiver_phone', 'province_code', 'district_code', 'ward_code', 'address_line'];
  if (requiredFields.some((field) => !normalizeText(address[field]))) return 'Vui lòng nhập đầy đủ thông tin địa chỉ.';
  if (!isValidPersonName(address.receiver_name)) return 'Tên người nhận phải từ 2-80 ký tự và không chứa số hoặc ký tự đặc biệt.';
  if (!isValidVietnamPhone(address.receiver_phone)) return 'Số điện thoại người nhận phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.';
  if (normalizeText(address.address_line).length < 5) return 'Địa chỉ chi tiết cần tối thiểu 5 ký tự.';
  return '';
};

export const validateReview = ({ rating, content }) => {
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return 'Vui lòng chọn số sao từ 1 đến 5.';
  const cleanContent = normalizeText(content);
  if (cleanContent.length < 2) return 'Nội dung đánh giá cần tối thiểu 2 ký tự.';
  if (cleanContent.length > 1000) return 'Nội dung đánh giá không được vượt quá 1000 ký tự.';
  return '';
};
