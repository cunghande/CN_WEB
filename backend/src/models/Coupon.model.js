import db from '../config/db.js';

const roundMoney = (value) => Math.max(0, Math.round(Number(value || 0)));

const publicCouponSelect = `
  c.id, c.code, c.name, c.type, c.discount_percent, c.max_discount_amount,
  c.min_order_amount, c.starts_at, c.expires_at, c.usage_limit, c.used_count,
  c.per_user_limit, c.is_active, c.requires_claim, c.claim_type,
  c.claim_min_items, c.claim_min_subtotal, c.claim_new_user_days,
  c.event_title, c.event_description, c.event_badge, c.sort_order
`;

const getRemainingDays = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

class Coupon {
  static async findByCode(code) {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return null;

    const [rows] = await db.execute(`SELECT ${publicCouponSelect} FROM coupons c WHERE c.code = ? LIMIT 1`, [normalized]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(`SELECT ${publicCouponSelect} FROM coupons c WHERE c.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  }

  static async findUserCoupon(userCouponId, userId) {
    const [rows] = await db.execute(
      `SELECT uc.id AS user_coupon_id, uc.status AS user_coupon_status, uc.claimed_at, uc.expires_at AS user_coupon_expires_at,
              ${publicCouponSelect}
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       WHERE uc.id = ? AND uc.user_id = ?
       LIMIT 1`,
      [userCouponId, userId]
    );
    return rows[0] || null;
  }

  static async getUser(userId) {
    const [rows] = await db.execute('SELECT id, created_at FROM users WHERE id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  }

  static getClaimState(coupon, user, context = {}) {
    const subtotal = Number(context.subtotalAmount || 0);
    const itemCount = Number(context.itemCount || 0);
    const claimType = coupon.claim_type || 'public';
    const minItems = Number(coupon.claim_min_items || 0);
    const minSubtotal = Number(coupon.claim_min_subtotal || 0);

    if (claimType === 'new_user') {
      const days = Number(coupon.claim_new_user_days || 7);
      const createdAt = user?.created_at ? new Date(user.created_at).getTime() : 0;
      const ageDays = createdAt ? Math.floor((Date.now() - createdAt) / 86400000) : days + 1;
      const remaining = Math.max(0, days - ageDays);
      const eligible = ageDays <= days;
      return {
        eligible,
        progress: eligible ? (remaining > 0 ? `Còn ${remaining} ngày để nhận` : 'Còn hôm nay để nhận') : 'Tài khoản đã quá thời gian nhận',
        requirement: `Tài khoản mới trong ${days} ngày`
      };
    }

    if (claimType === 'cart_item_count') {
      const subtotalOk = minSubtotal <= 0 || subtotal >= minSubtotal;
      const itemsOk = itemCount >= minItems;
      return {
        eligible: itemsOk && subtotalOk,
        progress: `Đã có ${itemCount}/${minItems} sản phẩm${minSubtotal > 0 ? `, ${roundMoney(subtotal).toLocaleString('vi-VN')}/${roundMoney(minSubtotal).toLocaleString('vi-VN')}đ` : ''}`,
        requirement: `Giỏ hàng có tối thiểu ${minItems} sản phẩm${minSubtotal > 0 ? ` và từ ${roundMoney(minSubtotal).toLocaleString('vi-VN')}đ` : ''}`
      };
    }

    if (claimType === 'cart_subtotal') {
      return {
        eligible: subtotal >= minSubtotal,
        progress: `${roundMoney(subtotal).toLocaleString('vi-VN')}/${roundMoney(minSubtotal).toLocaleString('vi-VN')}đ`,
        requirement: `Giỏ hàng từ ${roundMoney(minSubtotal).toLocaleString('vi-VN')}đ`
      };
    }

    return {
      eligible: true,
      progress: 'Có thể dùng trực tiếp khi thanh toán',
      requirement: 'Mã công khai'
    };
  }

  static async listEventCoupons(userId, context = {}) {
    const user = userId ? await this.getUser(userId) : null;
    const [rows] = await db.execute(
      `SELECT ${publicCouponSelect},
              uc.id AS user_coupon_id, uc.status AS user_coupon_status,
              uc.claimed_at, uc.expires_at AS user_coupon_expires_at
       FROM coupons c
       LEFT JOIN user_coupons uc ON uc.coupon_id = c.id AND uc.user_id = ?
       WHERE c.is_active = TRUE
         AND (c.event_title IS NOT NULL OR c.requires_claim = TRUE)
       ORDER BY c.sort_order ASC, c.id ASC`,
      [userId || 0]
    );

    return rows.map((coupon) => {
      const claim = this.getClaimState(coupon, user, context);
      const isClaimed = Boolean(coupon.user_coupon_id);
      const isAvailable = coupon.user_coupon_status === 'available';

      return {
        ...this.toPublicCoupon(coupon),
        user_coupon_id: coupon.user_coupon_id || null,
        user_coupon_status: coupon.user_coupon_status || null,
        is_claimed: isClaimed,
        is_available: isAvailable,
        can_claim: Boolean(userId && coupon.requires_claim && claim.eligible && !isClaimed),
        claim_eligible: claim.eligible,
        claim_progress: claim.progress,
        claim_requirement: claim.requirement,
        remaining_days: getRemainingDays(coupon.user_coupon_expires_at || coupon.expires_at)
      };
    });
  }

  static async listMyCoupons(userId, context = {}) {
    const [rows] = await db.execute(
      `SELECT uc.id AS user_coupon_id, uc.status AS user_coupon_status,
              uc.claimed_at, uc.expires_at AS user_coupon_expires_at,
              ${publicCouponSelect}
       FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       WHERE uc.user_id = ?
         AND uc.status = 'available'
         AND c.is_active = TRUE
         AND (uc.expires_at IS NULL OR uc.expires_at >= NOW())
       ORDER BY uc.claimed_at DESC`,
      [userId]
    );

    const vouchers = [];
    for (const coupon of rows) {
      const preview = await this.validate({
        userCouponId: coupon.user_coupon_id,
        userId,
        subtotalAmount: context.subtotalAmount || 0,
        shippingFee: context.shippingFee || 0,
        skipUserLimit: true
      });

      vouchers.push({
        ...this.toPublicCoupon(coupon),
        user_coupon_id: coupon.user_coupon_id,
        claimed_at: coupon.claimed_at,
        expires_at: coupon.user_coupon_expires_at || coupon.expires_at,
        remaining_days: getRemainingDays(coupon.user_coupon_expires_at || coupon.expires_at),
        preview
      });
    }

    return vouchers;
  }

  static async claim(couponId, userId, context = {}) {
    const coupon = await this.findById(couponId);
    if (!coupon || !coupon.is_active) return { success: false, message: 'Voucher không tồn tại hoặc đã tắt' };
    if (!coupon.requires_claim) return { success: false, message: 'Mã này dùng trực tiếp khi thanh toán, không cần nhận vào ví' };

    const user = await this.getUser(userId);
    const claim = this.getClaimState(coupon, user, context);
    if (!claim.eligible) return { success: false, message: 'Bạn chưa hoàn thành nhiệm vụ nhận voucher này', data: claim };

    try {
      const [result] = await db.execute(
        `INSERT INTO user_coupons (user_id, coupon_id, expires_at, source)
         VALUES (?, ?, ?, 'event')`,
        [userId, coupon.id, coupon.expires_at || null]
      );

      return {
        success: true,
        message: 'Đã lưu voucher vào ví của bạn',
        data: {
          user_coupon_id: result.insertId,
          coupon: this.toPublicCoupon(coupon)
        }
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: false, message: 'Bạn đã nhận voucher này rồi' };
      }
      throw error;
    }
  }

  static async resolveCouponForUser({ code, userCouponId, userId }) {
    if (userCouponId) {
      const coupon = await this.findUserCoupon(userCouponId, userId);
      if (!coupon) return { coupon: null, error: 'Không tìm thấy voucher trong ví của bạn' };
      if (coupon.user_coupon_status !== 'available') return { coupon: null, error: 'Voucher này đã được sử dụng hoặc hết hiệu lực' };
      if (coupon.user_coupon_expires_at && new Date(coupon.user_coupon_expires_at) < new Date()) {
        return { coupon: null, error: 'Voucher này đã hết hạn' };
      }
      return { coupon, userCouponId: coupon.user_coupon_id };
    }

    const coupon = await this.findByCode(code);
    if (!coupon) return { coupon: null, error: 'Mã giảm giá không tồn tại' };

    if (coupon.requires_claim) {
      const [wallet] = await db.execute(
        `SELECT id FROM user_coupons
         WHERE user_id = ? AND coupon_id = ? AND status = 'available'
           AND (expires_at IS NULL OR expires_at >= NOW())
         LIMIT 1`,
        [userId, coupon.id]
      );
      if (!wallet[0]) return { coupon: null, error: 'Bạn cần nhận voucher này ở trang Săn voucher trước khi dùng' };
      return { coupon, userCouponId: wallet[0].id };
    }

    return { coupon, userCouponId: null };
  }

  static async validate({ code, userCouponId, userId, subtotalAmount, shippingFee, skipUserLimit = false }) {
    const resolved = await this.resolveCouponForUser({ code, userCouponId, userId });
    const coupon = resolved.coupon;
    if (!coupon) return { valid: false, message: resolved.error };

    const now = new Date();
    const subtotal = Number(subtotalAmount || 0);
    const shipping = Number(shippingFee || 0);

    if (!coupon.is_active) return { valid: false, message: 'Mã giảm giá đã bị tắt' };
    if (coupon.starts_at && new Date(coupon.starts_at) > now) return { valid: false, message: 'Mã giảm giá chưa bắt đầu' };
    if (coupon.expires_at && new Date(coupon.expires_at) < now) return { valid: false, message: 'Mã giảm giá đã hết hạn' };
    if (coupon.usage_limit !== null && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
      return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
    }
    if (subtotal < Number(coupon.min_order_amount || 0)) {
      return {
        valid: false,
        message: `Đơn hàng cần tối thiểu ${Number(coupon.min_order_amount).toLocaleString('vi-VN')}đ để dùng mã này`
      };
    }

    if (!skipUserLimit) {
      const [userUses] = await db.execute(
        'SELECT COUNT(*) AS count FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?',
        [coupon.id, userId]
      );
      if (Number(userUses[0]?.count || 0) >= Number(coupon.per_user_limit || 1)) {
        return { valid: false, message: 'Bạn đã dùng hết lượt cho mã này' };
      }
    }

    let discountAmount = 0;
    let shippingDiscountAmount = 0;
    const percent = Number(coupon.discount_percent || 0);
    const maxDiscount = coupon.max_discount_amount === null ? null : Number(coupon.max_discount_amount);

    if (coupon.type === 'percent') {
      discountAmount = roundMoney(subtotal * percent / 100);
      if (maxDiscount !== null) discountAmount = Math.min(discountAmount, maxDiscount);
    } else if (coupon.type === 'free_shipping') {
      shippingDiscountAmount = shipping;
    } else if (coupon.type === 'shipping_percent') {
      shippingDiscountAmount = roundMoney(shipping * percent / 100);
      if (maxDiscount !== null) shippingDiscountAmount = Math.min(shippingDiscountAmount, maxDiscount);
    }

    discountAmount = Math.min(roundMoney(discountAmount), roundMoney(subtotal));
    shippingDiscountAmount = Math.min(roundMoney(shippingDiscountAmount), roundMoney(shipping));

    return {
      valid: true,
      message: 'Áp dụng mã giảm giá thành công',
      coupon: this.toPublicCoupon(coupon),
      user_coupon_id: resolved.userCouponId || null,
      discount_amount: discountAmount,
      shipping_discount_amount: shippingDiscountAmount,
      payable_shipping_fee: Math.max(0, roundMoney(shipping) - shippingDiscountAmount),
      total_discount_amount: discountAmount + shippingDiscountAmount,
      total_amount: Math.max(0, roundMoney(subtotal) + roundMoney(shipping) - discountAmount - shippingDiscountAmount)
    };
  }

  static async validateMultiple({ coupons = [], userId, subtotalAmount, shippingFee, skipUserLimit = false }) {
    const subtotal = Number(subtotalAmount || 0);
    const shipping = Number(shippingFee || 0);

    let totalDiscountAmount = 0;
    let totalShippingDiscountAmount = 0;
    const appliedCoupons = [];
    const errors = [];

    // Process each coupon individually
    for (const item of coupons) {
      if (!item.code && !item.user_coupon_id) continue;
      
      const res = await this.validate({
        code: item.code,
        userCouponId: item.user_coupon_id,
        userId,
        subtotalAmount: subtotal,
        shippingFee: shipping,
        skipUserLimit
      });

      if (res.valid) {
        // Prevent applying multiple of the same type if needed, but for now just accumulate.
        // The frontend will restrict selecting multiple of the same type (e.g. 2 freeships).
        totalDiscountAmount += (res.discount_amount || 0);
        totalShippingDiscountAmount += (res.shipping_discount_amount || 0);
        appliedCoupons.push({
          coupon: res.coupon,
          user_coupon_id: res.user_coupon_id,
          discount_amount: res.discount_amount || 0,
          shipping_discount_amount: res.shipping_discount_amount || 0
        });
      } else {
        errors.push({
          code: item.code,
          user_coupon_id: item.user_coupon_id,
          message: res.message
        });
      }
    }

    // Cap the discounts
    totalDiscountAmount = Math.min(roundMoney(totalDiscountAmount), roundMoney(subtotal));
    totalShippingDiscountAmount = Math.min(roundMoney(totalShippingDiscountAmount), roundMoney(shipping));

    return {
      valid: appliedCoupons.length > 0 || coupons.length === 0,
      applied_coupons: appliedCoupons,
      errors,
      total_discount_amount: totalDiscountAmount,
      total_shipping_discount_amount: totalShippingDiscountAmount,
      payable_shipping_fee: Math.max(0, roundMoney(shipping) - totalShippingDiscountAmount),
      total_amount: Math.max(0, roundMoney(subtotal) + roundMoney(shipping) - totalDiscountAmount - totalShippingDiscountAmount)
    };
  }

  static async redeem(connection, { couponId, userCouponId, userId, orderId, discountAmount, shippingDiscountAmount }) {
    if (!couponId) return;

    await connection.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponId]);
    await connection.execute(
      `INSERT INTO coupon_redemptions
       (coupon_id, user_id, order_id, discount_amount, shipping_discount_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [couponId, userId, orderId, discountAmount || 0, shippingDiscountAmount || 0]
    );

    if (userCouponId) {
      await connection.execute(
        `UPDATE user_coupons
         SET status = 'used', used_order_id = ?, used_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [orderId, userCouponId, userId]
      );
    }
  }

  static async listAll() {
    const [rows] = await db.execute(`SELECT * FROM coupons ORDER BY sort_order ASC, id DESC`);
    return rows;
  }

  static async create(data) {
    const fields = [
      'code', 'name', 'type', 'discount_percent', 'max_discount_amount',
      'min_order_amount', 'starts_at', 'expires_at', 'usage_limit',
      'per_user_limit', 'is_active', 'requires_claim', 'claim_type',
      'claim_min_items', 'claim_min_subtotal', 'claim_new_user_days',
      'event_title', 'event_description', 'event_badge', 'sort_order'
    ];
    
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => data[field] === undefined ? null : data[field]);

    const [result] = await db.execute(
      `INSERT INTO coupons (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [
      'code', 'name', 'type', 'discount_percent', 'max_discount_amount',
      'min_order_amount', 'starts_at', 'expires_at', 'usage_limit',
      'per_user_limit', 'is_active', 'requires_claim', 'claim_type',
      'claim_min_items', 'claim_min_subtotal', 'claim_new_user_days',
      'event_title', 'event_description', 'event_badge', 'sort_order'
    ];

    const updates = fields.map(field => `\`${field}\` = ?`).join(', ');
    const values = fields.map(field => data[field] === undefined ? null : data[field]);
    values.push(id);

    await db.execute(
      `UPDATE coupons SET ${updates} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await db.execute('DELETE FROM coupons WHERE id = ?', [id]);
  }

  static toPublicCoupon(coupon) {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      discount_percent: Number(coupon.discount_percent || 0),
      max_discount_amount: coupon.max_discount_amount === null ? null : Number(coupon.max_discount_amount),
      min_order_amount: Number(coupon.min_order_amount || 0),
      expires_at: coupon.expires_at,
      requires_claim: Boolean(coupon.requires_claim),
      claim_type: coupon.claim_type,
      claim_min_items: Number(coupon.claim_min_items || 0),
      claim_min_subtotal: Number(coupon.claim_min_subtotal || 0),
      claim_new_user_days: coupon.claim_new_user_days,
      event_title: coupon.event_title,
      event_description: coupon.event_description,
      event_badge: coupon.event_badge,
      usage_limit: coupon.usage_limit,
      used_count: coupon.used_count,
      remaining_uses: coupon.usage_limit !== null ? Math.max(0, coupon.usage_limit - (coupon.used_count || 0)) : null
    };
  }
}

export default Coupon;
