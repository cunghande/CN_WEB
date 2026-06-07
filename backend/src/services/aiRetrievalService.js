import Coupon from '../models/Coupon.model.js';
import Product from '../models/Product.model.js';

const MAX_PRODUCT_CONTEXT = 35;
const PRIORITY_COUPON_CODES = ['WELCOME10', 'SALE20', 'FREESHIP', 'SHIP50'];
const PRODUCT_INTENTS = new Set(['styling', 'search', 'size']);

const PRODUCT_TYPE_RULES = [
  { key: 'jacket', label: 'áo khoác', includes: ['ao khoac', 'khoac', 'jacket', 'blazer', 'cardigan', 'hoodie'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'that lung', 'vi', 'phu kien'] },
  { key: 'shirt', label: 'áo sơ mi', includes: ['ao so mi', 'so mi', 'shirt'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'tshirt', label: 'áo thun', includes: ['ao thun', 't shirt', 'tshirt', 'tee'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'top', label: 'áo', includes: ['ao', 'ao nam', 'ao nu'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'jeans', label: 'quần jean', includes: ['quan jean', 'jean', 'denim', 'quan bo'], excludes: ['giay', 'dep', 'ao', 'tui', 'mu', 'non'] },
  { key: 'pants', label: 'quần', includes: ['quan', 'quan nam', 'quan nu', 'pants'], excludes: ['giay', 'dep', 'ao', 'tui', 'mu', 'non'] },
  { key: 'dress', label: 'váy/đầm', includes: ['vay', 'dam', 'dress'], excludes: ['giay', 'dep', 'ao', 'quan', 'tui'] },
  { key: 'high_heels', label: 'giày cao gót', includes: ['giay cao got', 'cao got'], excludes: ['sneaker', 'canvas', 'boots', 'ao', 'quan', 'vay', 'dam', 'tui'] },
  { key: 'shoe', label: 'giày', includes: ['giay', 'sneaker', 'boots'], excludes: ['ao', 'quan', 'vay', 'dam', 'tui'] },
  { key: 'bag', label: 'túi', includes: ['tui', 'bag'], excludes: ['ao', 'quan', 'giay', 'dep'] }
];

const POLICY_KNOWLEDGE = [
  {
    id: 'shipping',
    title: 'Giao hàng và phí ship',
    keywords: ['giao hang', 'ship', 'phi ship', 'van chuyen', 'bao lau', 'nhan hang'],
    content: 'Phí ship được tính theo địa chỉ giao hàng và hiển thị rõ trong giỏ hàng trước khi đặt đơn. Hệ thống đang hỗ trợ thanh toán COD. Thời gian dự kiến thường được trả về cùng báo giá ship.'
  },
  {
    id: 'checkout',
    title: 'Thanh toán và đặt hàng',
    keywords: ['thanh toan', 'cod', 'dat hang', 'dia chi', 'so dien thoai'],
    content: 'Khách cần đăng nhập, có địa chỉ nhận hàng hợp lệ và số điện thoại người nhận trước khi đặt hàng. Đơn hàng dùng COD trong bản hiện tại.'
  },
  {
    id: 'review',
    title: 'Đánh giá sản phẩm',
    keywords: ['danh gia', 'binh luan', 'rating', 'sao', 'phan hoi'],
    content: 'Chỉ khách đã mua sản phẩm và đơn đã giao thành công mới được đánh giá hoặc bình luận sản phẩm. Admin và chủ bình luận có thể phản hồi theo luồng bình luận.'
  },
  {
    id: 'voucher',
    title: 'Voucher và săn mã',
    keywords: ['voucher', 'ma giam', 'freeship', 'san ma', 'uu dai'],
    content: 'Khách có thể vào trang Săn voucher để nhận mã theo nhiệm vụ, hoặc chọn voucher trong giỏ hàng. Một số mã cần nhận vào ví trước khi áp dụng.'
  }
];

const COLOR_WORDS = ['den', 'trang', 'xanh', 'do', 'hong', 'be', 'nau', 'xam', 'kem', 'vang', 'tim'];
const GENDER_WORDS = [
  { key: 'male', label: 'nam', words: ['nam', 'boy', 'men'] },
  { key: 'female', label: 'nữ', words: ['nu', 'girl', 'women'] },
  { key: 'unisex', label: 'unisex', words: ['unisex'] }
];

export const PRODUCT_AI_INTENTS = PRODUCT_INTENTS;

export const normalizeForSearch = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/đ/g, 'd')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasKeyword = (text, keyword) => new RegExp(`(^|\\s)${escapeRegex(keyword.trim())}(?=\\s|$)`).test(text);

const productSearchText = (product) => normalizeForSearch([
  product.name,
  product.category_name,
  product.description,
  ...(product.tags || []).map((tag) => tag.name),
  ...(product.variants || []).map((variant) => `${variant.color} ${variant.size}`)
].join(' '));

const parseBudget = (message) => {
  const compact = normalizeForSearch(message).replace(/\s+/g, '');
  const kMatch = compact.match(/(?:duoi|toi da|max|tam|khoang)?(\d{2,4})k\b/);
  if (kMatch) return Number(kMatch[1]) * 1000;

  const millionMatch = compact.match(/(\d+(?:[,.]\d+)?)tr(?:ieu)?\b/);
  if (millionMatch) return Number(millionMatch[1].replace(',', '.')) * 1000000;

  const vndMatch = compact.match(/(\d{5,9})(?:d|vnd)?\b/);
  if (vndMatch) return Number(vndMatch[1]);
  return null;
};

export const parseShoppingConstraints = (message) => {
  const text = ` ${normalizeForSearch(message)} `;
  const productType = PRODUCT_TYPE_RULES.find((rule) => rule.includes.some((keyword) => hasKeyword(text, keyword)));
  const colors = COLOR_WORDS.filter((color) => hasKeyword(text, color));
  const gender = GENDER_WORDS.find((group) => group.words.some((word) => hasKeyword(text, word))) || null;

  return {
    rawText: text,
    productType,
    colors,
    gender,
    budget: parseBudget(message)
  };
};

export const inferAiIntent = (message) => {
  const text = normalizeForSearch(message);
  const constraints = parseShoppingConstraints(message);

  if (/^(hi|hello|hey|alo|chao|xin chao|shop oi|bot oi|ad oi)( shop)?$/.test(text)) return 'greeting';
  if (/voucher|ma giam|ma giam gia|khuyen mai|coupon|freeship|free ship|san ma|giam gia|uu dai/.test(text)) return 'voucher';
  if (/doi tra|bao hanh|giao hang|phi ship|van chuyen|cod|thanh toan|dia chi|danh gia|binh luan/.test(text)) return 'policy';
  if (/\b(size|co ao|co quan|chon co|vua size|mac size|kg|m\d)\b/.test(text)) return 'size';
  if (/phoi|outfit|tu van|goi y|mac|di choi|di lam|du tiec|hen ho|style|phong cach/.test(text)) return 'styling';
  if (/tim|kiem|co.*khong|mua|duoi|tren|gia|bao nhieu|con hang/.test(text)) return 'search';
  if (constraints.productType || constraints.budget) return 'search';
  return 'general';
};

const compactProduct = (product) => {
  const variants = product.variants || [];
  const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))].slice(0, 6);
  const sizes = [...new Set(variants.map((variant) => variant.size).filter(Boolean))].slice(0, 6);
  const stock = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);

  return {
    id: product.id,
    name: product.name,
    category: product.category_name,
    category_name: product.category_name,
    price: Number(product.base_price || 0),
    base_price: Number(product.base_price || 0),
    image_url: product.image_url,
    stock,
    colors,
    sizes,
    rating: Number(product.average_rating || 0),
    like_count: Number(product.like_count || 0),
    tags: (product.tags || []).map((tag) => tag.name).filter(Boolean).slice(0, 6),
    description: String(product.description || '').slice(0, 180)
  };
};

const compactCoupon = (coupon) => ({
  id: coupon.id,
  code: coupon.code,
  name: coupon.name,
  type: coupon.type,
  discount_percent: Number(coupon.discount_percent || 0),
  max_discount_amount: coupon.max_discount_amount === null ? null : Number(coupon.max_discount_amount),
  min_order_amount: Number(coupon.min_order_amount || 0),
  requires_claim: Boolean(coupon.requires_claim),
  event_title: coupon.event_title,
  event_description: coupon.event_description,
  event_badge: coupon.event_badge,
  remaining_uses: coupon.usage_limit !== null ? Math.max(0, Number(coupon.usage_limit || 0) - Number(coupon.used_count || 0)) : null
});

const scoreProduct = (product, words, constraints) => {
  const text = productSearchText(product);
  const paddedText = ` ${text} `;
  const price = Number(product.base_price || 0);
  let score = words.filter((word) => word.length >= 2 && text.includes(word)).length;

  if (constraints.productType) {
    const hasType = constraints.productType.includes.some((keyword) => hasKeyword(paddedText, keyword));
    const hasExcludedType = constraints.productType.excludes.some((keyword) => hasKeyword(paddedText, keyword));
    if (!hasType || hasExcludedType) return null;
    score += 60;
  }

  if (constraints.budget) {
    if (price > constraints.budget) return null;
    score += 25 + Math.max(0, 10 - Math.floor((constraints.budget - price) / 100000));
  }

  if (constraints.colors.length > 0) {
    const matchedColors = constraints.colors.filter((color) => hasKeyword(paddedText, color));
    if (matchedColors.length === 0) score -= 12;
    score += matchedColors.length * 8;
  }

  if (constraints.gender) {
    if (hasKeyword(paddedText, constraints.gender.label) || hasKeyword(paddedText, 'unisex')) score += 8;
  }

  const stock = (product.variants || []).reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);
  if (stock <= 0) score -= 30;
  score += Math.min(5, Number(product.average_rating || 0));
  score += Math.min(3, Number(product.like_count || 0) / 5);
  return score;
};

const retrieveProducts = async ({ message, userId }) => {
  const allProducts = await Product.findAll(null, userId || null);
  const constraints = parseShoppingConstraints(message);
  const words = normalizeForSearch(message).split(/\s+/);

  const ranked = allProducts
    .map((product) => ({ product, score: scoreProduct(product, words, constraints) }))
    .filter((item) => item.score !== null)
    .sort((a, b) => b.score - a.score || Number(a.product.base_price || 0) - Number(b.product.base_price || 0));

  if (ranked.length === 0 && (constraints.productType || constraints.budget)) {
    return { allProducts, products: [], constraints };
  }

  const fallbackRanked = ranked.length > 0 ? ranked : allProducts
    .map((product) => {
      const text = productSearchText(product);
      return { product, score: words.filter((word) => word.length >= 2 && text.includes(word)).length };
    })
    .sort((a, b) => b.score - a.score || Number(b.product.like_count || 0) - Number(a.product.like_count || 0));

  return {
    allProducts,
    products: fallbackRanked.slice(0, MAX_PRODUCT_CONTEXT).map((item) => compactProduct(item.product)),
    constraints
  };
};

const retrieveCoupons = async () => {
  const coupons = await Coupon.listAll();
  return coupons
    .filter((coupon) => coupon.is_active)
    .sort((a, b) => {
      const aPriority = PRIORITY_COUPON_CODES.includes(a.code) ? 0 : 1;
      const bPriority = PRIORITY_COUPON_CODES.includes(b.code) ? 0 : 1;
      return aPriority - bPriority || Number(a.sort_order || 999) - Number(b.sort_order || 999);
    })
    .slice(0, 12)
    .map(compactCoupon);
};

const retrievePolicyDocs = (message) => {
  const text = normalizeForSearch(message);
  return POLICY_KNOWLEDGE
    .map((doc) => ({
      ...doc,
      score: doc.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...doc }) => doc);
};

export const makeProductReason = (product, constraints) => {
  const hints = [];
  if (constraints.productType) hints.push(`đúng nhóm ${constraints.productType.label}`);
  if (constraints.budget && product.price <= constraints.budget) hints.push(`trong ngân sách ${constraints.budget.toLocaleString('vi-VN')}đ`);
  const matchedColor = product.colors?.find((color) => constraints.colors.includes(normalizeForSearch(color)));
  if (matchedColor) hints.push(`có màu ${matchedColor}`);
  if (product.category && hints.length === 0) hints.push(product.category);

  return hints.length > 0
    ? `Phù hợp vì ${hints.join(', ')}.`
    : 'Phù hợp với nhu cầu bạn vừa mô tả.';
};

export const retrieveAiContext = async ({ message, userId }) => {
  const intent = inferAiIntent(message);
  const needsProducts = PRODUCT_INTENTS.has(intent);
  const needsCoupons = intent === 'voucher';
  const needsPolicies = intent === 'policy' || intent === 'general';
  const baseConstraints = parseShoppingConstraints(message);

  const productResult = intent === 'size' && !baseConstraints.productType
    ? { allProducts: [], products: [], constraints: baseConstraints }
    : needsProducts
    ? await retrieveProducts({ message, userId })
    : { allProducts: [], products: [], constraints: baseConstraints };
  const coupons = needsCoupons ? await retrieveCoupons() : [];
  const policies = needsPolicies ? retrievePolicyDocs(message) : [];

  return {
    intent,
    products: productResult.products,
    allProducts: productResult.allProducts,
    constraints: productResult.constraints,
    coupons,
    policies,
    retrieval: {
      source: 'mysql-rag',
      product_count: productResult.products.length,
      coupon_count: coupons.length,
      policy_count: policies.length
    }
  };
};
