const centralProvinceCodes = new Set(['48', '46', '49', '51', '52', '54', '56']);
const southernProvinceCodes = new Set(['79', '77', '74', '75', '80', '82', '83', '84', '86', '87', '89', '91', '92', '93', '94', '95', '96']);

export const calculateShippingFee = (address = {}) => {
  const provinceCode = String(address.province_code || '');
  const districtName = String(address.district_name || '').toLowerCase();
  const wardName = String(address.ward_name || '').toLowerCase();

  let baseFee = 38000;
  if (provinceCode === '79' || provinceCode === '1') baseFee = 22000;
  else if (southernProvinceCodes.has(provinceCode)) baseFee = 32000;
  else if (centralProvinceCodes.has(provinceCode)) baseFee = 42000;
  else baseFee = 48000;

  if (districtName.includes('huyện') || districtName.includes('đảo')) baseFee += 10000;
  if (wardName.includes('xã')) baseFee += 5000;

  return baseFee;
};

export const buildShippingQuote = (address) => {
  const shipping_fee = calculateShippingFee(address);
  return {
    shipping_fee,
    carrier: 'LUXURYWEAR Express',
    estimated_days: shipping_fee >= 48000 ? '3-5 ngày' : '1-3 ngày'
  };
};
