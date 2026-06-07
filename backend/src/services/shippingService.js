// Vị trí shop: Thôn Ông Tố, Xã Yên Mỹ, Thị trấn Yên Mỹ, Hưng Yên
const SHOP_LOCATION = {
  latitude: 20.9067,
  longitude: 106.0243,
  name: 'Thôn Ông Tố, Thị trấn Yên Mỹ, Yên Mỹ, Hưng Yên',
  provinceName: 'Hưng Yên',
  provinceCode: '33'
};

// Tọa độ các xã/thị trấn thuộc Huyện Yên Mỹ (mã quận 327) để tính chính xác khoảng cách dưới 5km
const YEN_MY_WARD_COORDINATES = {
  '12052': { latitude: 20.9067, longitude: 106.0243, name: 'Thị trấn Yên Mỹ' },
  '12055': { latitude: 20.9419, longitude: 106.0353, name: 'Xã Nguyễn Văn Linh' },
  '12061': { latitude: 20.8875, longitude: 105.9861, name: 'Xã Đồng Than' },
  '12064': { latitude: 20.9214, longitude: 106.0256, name: 'Xã Ngọc Long' },
  '12067': { latitude: 20.9236, longitude: 106.0469, name: 'Xã Liêu Xá' },
  '12070': { latitude: 20.9167, longitude: 105.9722, name: 'Xã Hoàn Long' },
  '12073': { latitude: 20.8931, longitude: 106.0125, name: 'Xã Tân Lập' },
  '12076': { latitude: 20.8789, longitude: 106.0319, name: 'Xã Thanh Long' },
  '12079': { latitude: 20.9222, longitude: 106.0028, name: 'Xã Yên Phú' },
  '12085': { latitude: 20.8953, longitude: 106.0503, name: 'Xã Trung Hòa' },
  '12091': { latitude: 20.8528, longitude: 106.0222, name: 'Xã Việt Yên' },
  '12100': { latitude: 20.8719, longitude: 105.9986, name: 'Xã Tân Minh' }
};

// Tọa độ các quận/huyện của Hưng Yên (mã tỉnh 33) để ước tính khoảng cách
const DISTRICT_COORDINATES = {
  '323': { latitude: 20.6558, longitude: 106.0508, name: 'Thành phố Hưng Yên' },
  '325': { latitude: 20.9750, longitude: 106.0583, name: 'Huyện Văn Lâm' },
  '326': { latitude: 20.9417, longitude: 105.9528, name: 'Huyện Văn Giang' },
  '327': { latitude: 20.9067, longitude: 106.0243, name: 'Huyện Yên Mỹ' },
  '328': { latitude: 20.9481, longitude: 106.1017, name: 'Thị xã Mỹ Hào' },
  '329': { latitude: 20.8333, longitude: 106.1000, name: 'Huyện Ân Thi' },
  '330': { latitude: 20.8444, longitude: 105.9861, name: 'Huyện Khoái Châu' },
  '331': { latitude: 20.7333, longitude: 106.0500, name: 'Huyện Kim Động' },
  '332': { latitude: 20.6728, longitude: 106.0692, name: 'Huyện Tiên Lữ' },
  '333': { latitude: 20.7167, longitude: 106.1833, name: 'Huyện Phù Cừ' }
};

// Tọa độ đại diện các tỉnh/thành phố Việt Nam để ước lượng khoảng cách liên tỉnh
const PROVINCE_COORDINATES = {
  '01': { latitude: 21.0285, longitude: 105.8542, name: 'Thành phố Hà Nội' },
  '02': { latitude: 22.8233, longitude: 104.9836, name: 'Tỉnh Hà Giang' },
  '04': { latitude: 22.6686, longitude: 106.2589, name: 'Tỉnh Cao Bằng' },
  '06': { latitude: 22.1475, longitude: 105.8344, name: 'Tỉnh Bắc Kạn' },
  '07': { latitude: 21.8153, longitude: 105.2153, name: 'Tỉnh Tuyên Quang' },
  '08': { latitude: 22.4856, longitude: 103.9608, name: 'Tỉnh Lào Cai' },
  '10': { latitude: 21.3917, longitude: 103.0167, name: 'Tỉnh Điện Biên' },
  '11': { latitude: 22.3958, longitude: 103.4686, name: 'Tỉnh Lai Châu' },
  '12': { latitude: 21.3283, longitude: 103.9103, name: 'Tỉnh Sơn La' },
  '14': { latitude: 21.7050, longitude: 104.8753, name: 'Tỉnh Yên Bái' },
  '17': { latitude: 20.8175, longitude: 105.3378, name: 'Tỉnh Hoà Bình' },
  '19': { latitude: 21.5939, longitude: 105.8481, name: 'Tỉnh Thái Nguyên' },
  '20': { latitude: 21.8547, longitude: 106.7619, name: 'Tỉnh Lạng Sơn' },
  '22': { latitude: 21.0069, longitude: 107.2811, name: 'Tỉnh Quảng Ninh' },
  '24': { latitude: 21.2731, longitude: 106.1947, name: 'Tỉnh Bắc Giang' },
  '25': { latitude: 21.3228, longitude: 105.2283, name: 'Tỉnh Phú Thọ' },
  '26': { latitude: 21.3089, longitude: 105.6044, name: 'Tỉnh Vĩnh Phúc' },
  '27': { latitude: 21.1861, longitude: 106.0764, name: 'Tỉnh Bắc NInh' },
  '30': { latitude: 20.9408, longitude: 106.3331, name: 'Tỉnh Hải Dương' },
  '31': { latitude: 20.8606, longitude: 106.6806, name: 'Thành phố Hải Phòng' },
  '33': { latitude: 20.9067, longitude: 106.0243, name: 'Tỉnh Hưng Yên' },
  '34': { latitude: 20.4461, longitude: 106.3361, name: 'Tỉnh Thái Bình' },
  '35': { latitude: 20.5461, longitude: 105.9242, name: 'Tỉnh Hà Nam' },
  '36': { latitude: 20.4200, longitude: 106.1683, name: 'Tỉnh Nam Định' },
  '37': { latitude: 20.2539, longitude: 105.9750, name: 'Tỉnh Ninh Bình' },
  '38': { latitude: 19.8075, longitude: 105.7764, name: 'Tỉnh Thanh Hóa' },
  '40': { latitude: 19.3800, longitude: 104.9000, name: 'Tỉnh Nghệ An' },
  '42': { latitude: 18.3556, longitude: 105.9000, name: 'Tỉnh Hà Tĩnh' },
  '44': { latitude: 17.4739, longitude: 106.5986, name: 'Tỉnh Quảng Bình' },
  '45': { latitude: 16.7417, longitude: 107.1861, name: 'Tỉnh Quảng Trị' },
  '46': { latitude: 16.4678, longitude: 107.5906, name: 'Tỉnh Thừa Thiên Huế' },
  '48': { latitude: 16.0544, longitude: 108.2022, name: 'Thành phố Đà Nẵng' },
  '49': { latitude: 15.5500, longitude: 107.9667, name: 'Tỉnh Quảng Nam' },
  '51': { latitude: 15.1200, longitude: 108.8000, name: 'Tỉnh Quảng Ngãi' },
  '52': { latitude: 13.7828, longitude: 109.2197, name: 'Tỉnh Bình Định' },
  '54': { latitude: 13.0881, longitude: 109.3039, name: 'Tỉnh Phú Yên' },
  '56': { latitude: 12.2389, longitude: 109.1967, name: 'Tỉnh Khánh Hòa' },
  '58': { latitude: 11.5683, longitude: 108.9878, name: 'Tỉnh Ninh Thuận' },
  '60': { latitude: 10.9333, longitude: 108.1000, name: 'Tỉnh Bình Thuận' },
  '62': { latitude: 14.3500, longitude: 108.0000, name: 'Tỉnh Kon Tum' },
  '64': { latitude: 13.9833, longitude: 108.0000, name: 'Tỉnh Gia Lai' },
  '66': { latitude: 12.6667, longitude: 108.0333, name: 'Tỉnh Đắk Lắk' },
  '67': { latitude: 12.0000, longitude: 107.6833, name: 'Tỉnh Đắk Nông' },
  '68': { latitude: 11.9403, longitude: 108.4378, name: 'Tỉnh Lâm Đồng' },
  '70': { latitude: 11.5333, longitude: 106.8833, name: 'Tỉnh Bình Phước' },
  '72': { latitude: 11.3000, longitude: 106.1167, name: 'Tỉnh Tây Ninh' },
  '74': { latitude: 11.1603, longitude: 106.6606, name: 'Tỉnh Bình Dương' },
  '75': { latitude: 11.0000, longitude: 107.1667, name: 'Tỉnh Đồng Nai' },
  '77': { latitude: 10.4114, longitude: 107.1358, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  '79': { latitude: 10.7769, longitude: 106.7009, name: 'Thành phố Hồ Chí Minh' },
  '80': { latitude: 10.5333, longitude: 106.4000, name: 'Tỉnh Long An' },
  '82': { latitude: 10.4167, longitude: 106.3667, name: 'Tỉnh Tiền Giang' },
  '83': { latitude: 10.2333, longitude: 106.3833, name: 'Tỉnh Bến Tre' },
  '84': { latitude: 9.9500, longitude: 106.3333, name: 'Tỉnh Trà Vinh' },
  '86': { latitude: 10.2500, longitude: 105.9667, name: 'Tỉnh Vĩnh Long' },
  '87': { latitude: 10.4542, longitude: 105.6378, name: 'Tỉnh Đồng Tháp' },
  '89': { latitude: 10.5000, longitude: 105.2000, name: 'Tỉnh An Giang' },
  '91': { latitude: 9.8800, longitude: 105.1400, name: 'Tỉnh Kiên Giang' },
  '92': { latitude: 10.0333, longitude: 105.7833, name: 'Thành phố Cần Thơ' },
  '93': { latitude: 9.7842, longitude: 105.4700, name: 'Tỉnh Hậu Giang' },
  '94': { latitude: 9.6000, longitude: 105.9667, name: 'Tỉnh Sóc Trăng' },
  '95': { latitude: 9.2942, longitude: 105.7275, name: 'Tỉnh Bạc Liêu' },
  '96': { latitude: 9.1833, longitude: 105.1500, name: 'Tỉnh Cà Mau' }
};

// Công thức Haversine để tính khoảng cách giữa 2 điểm trên bề mặt Trái Đất (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Tính phí ship dựa trên khoảng cách
export const calculateShippingFeeByDistance = (address = {}, shopLocation = SHOP_LOCATION) => {
  const provinceCode = String(address.province_code || '').padStart(2, '0');
  const districtCode = String(address.district_code || '');
  const wardCode = String(address.ward_code || '');
  
  let destination = null;

  // 1. Nếu cùng Huyện Yên Mỹ (327) và có mã xã phường, lấy tọa độ xã phường
  if (provinceCode === shopLocation.provinceCode && districtCode === '327' && YEN_MY_WARD_COORDINATES[wardCode]) {
    destination = YEN_MY_WARD_COORDINATES[wardCode];
  }
  // 2. Nếu cùng tỉnh Hưng Yên, lấy tọa độ quận huyện
  else if (provinceCode === shopLocation.provinceCode && DISTRICT_COORDINATES[districtCode]) {
    destination = DISTRICT_COORDINATES[districtCode];
  }
  // 3. Nếu ở tỉnh thành khác, lấy tọa độ tỉnh thành
  else if (PROVINCE_COORDINATES[provinceCode]) {
    destination = PROVINCE_COORDINATES[provinceCode];
  }

  if (destination) {
    const distance = calculateDistance(
      shopLocation.latitude,
      shopLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    const roundedDistance = Math.round(distance * 10) / 10;
    
    // Nếu là huyện Yên Mỹ (mã 327) thì luôn luôn free ship không tính theo khoảng cách
    const isYenMy = (provinceCode === shopLocation.provinceCode && districtCode === '327');
    const isFreeShip = isYenMy;
    const fee = isFreeShip ? 0 : calculateFeeByDistance(roundedDistance, provinceCode);

    return {
      distance: roundedDistance,
      fee: fee,
      isFreeShip: isFreeShip,
      districtName: destination.name || address.district_name,
      isYenMy
    };
  }
  
  // Nếu không tìm thấy tọa độ, dùng phí cố định theo tỉnh làm dự phòng
  const isYenMy = (provinceCode === shopLocation.provinceCode && districtCode === '327');
  return {
    distance: null,
    fee: isYenMy ? 0 : calculateDefaultShippingFee(provinceCode),
    isFreeShip: isYenMy,
    districtName: address.district_name,
    isYenMy
  };
};

// Tính phí dựa trên khoảng cách và tỉnh thành
const calculateFeeByDistance = (distance, provinceCode) => {
  // Cùng tỉnh Hưng Yên (33)
  if (provinceCode === '33') {
    if (distance < 10) return 15000;
    if (distance < 20) return 20000;
    if (distance < 30) return 25000;
    return 30000;
  }

  // Tỉnh thuộc khu vực miền Bắc lân cận (mã từ 01 đến 37, trừ Hưng Yên 33)
  const codeNum = parseInt(provinceCode, 10);
  if (codeNum >= 1 && codeNum <= 37) {
    if (distance < 30) return 30000;
    if (distance < 50) return 32000;
    if (distance < 100) return 35000;
    return 38000;
  }

  // Các tỉnh miền Trung và miền Nam
  if (distance < 500) {
    return 40000; // Miền Trung
  }
  return 45000; // Miền Nam
};

// Phí ship mặc định cho các tỉnh khác (sử dụng làm dự phòng)
const calculateDefaultShippingFee = (provinceCode) => {
  const centralProvinceCodes = new Set(['48', '46', '49', '51', '52', '54', '56']);
  const southernProvinceCodes = new Set(['79', '77', '74', '75', '80', '82', '83', '84', '86', '87', '89', '91', '92', '93', '94', '95', '96']);
  
  const cleanCode = String(provinceCode || '').padStart(2, '0');
  
  let baseFee = 38000;
  if (cleanCode === '79' || cleanCode === '01') baseFee = 22000;
  else if (southernProvinceCodes.has(cleanCode)) baseFee = 32000;
  else if (centralProvinceCodes.has(cleanCode)) baseFee = 42000;
  else baseFee = 48000;
  
  return baseFee;
};

// Tính phí ship (compatible với code cũ)
export const calculateShippingFee = (address = {}) => {
  const result = calculateShippingFeeByDistance(address);
  return result.fee;
};

export const buildShippingQuote = (address) => {
  const result = calculateShippingFeeByDistance(address);
  const shipping_fee = result.fee;
  
  let estimatedDays = '1-3 ngày';
  if (result.isYenMy) {
    estimatedDays = 'Trong ngày';
  } else if (result.distance) {
    if (result.distance < 30) {
      estimatedDays = '1-2 ngày';
    } else {
      estimatedDays = '2-3 ngày';
    }
  } else {
    estimatedDays = shipping_fee >= 48000 ? '3-5 ngày' : '1-3 ngày';
  }
  
  let distanceNote = null;
  if (result.distance !== null) {
    distanceNote = `${result.distance} km từ shop`;
    if (result.isYenMy) {
      distanceNote += ' (Yên Mỹ Freeship)';
    }
  } else if (result.isYenMy) {
    distanceNote = 'Yên Mỹ Freeship';
  }
  
  return {
    shipping_fee,
    carrier: 'LUXURYWEAR Express',
    estimated_days: estimatedDays,
    distance: result.distance,
    is_free_ship: result.isFreeShip,
    distance_note: distanceNote,
    shop_location: SHOP_LOCATION.name
  };
};
