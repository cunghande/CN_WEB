import Coupon from '../models/Coupon.model.js';
import Product from '../models/Product.model.js';
import { generateWithOpenRouterFallback } from '../services/openRouterService.js';
import { sendResponse } from '../utils/helpers.js';

const MAX_HISTORY_MESSAGES = 8;
const MAX_PRODUCT_CONTEXT = 35;
const PRODUCT_INTENTS = new Set(['styling', 'search', 'size']);
const PRIORITY_COUPON_CODES = ['WELCOME10', 'SALE20', 'FREESHIP', 'SHIP50'];

const PRODUCT_TYPE_RULES = [
  { key: 'jacket', label: 'áo khoác', includes: ['ao khoac', 'khoac', 'jacket', 'blazer'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'that lung', 'vi ', 'phu kien'] },
  { key: 'shirt', label: 'áo sơ mi', includes: ['ao so mi', 'so mi', 'shirt'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'tshirt', label: 'áo thun', includes: ['ao thun', 't shirt', 'tshirt', 'tee'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'top', label: 'áo', includes: ['ao ', 'ao nam', 'ao nu'], excludes: ['giay', 'dep', 'tui', 'mu', 'non', 'quan'] },
  { key: 'jeans', label: 'quần jean', includes: ['quan jean', 'jean', 'denim'], excludes: ['giay', 'dep', 'ao ', 'tui', 'mu', 'non'] },
  { key: 'pants', label: 'quần', includes: ['quan ', 'quan nam', 'quan nu', 'pants'], excludes: ['giay', 'dep', 'ao ', 'tui', 'mu', 'non'] },
  { key: 'dress', label: 'váy/đầm', includes: ['vay', 'dam', 'dress'], excludes: ['giay', 'dep', 'ao ', 'quan', 'tui'] },
  { key: 'high_heels', label: 'giày cao gót', includes: ['giay cao got', 'cao got'], excludes: ['sneaker', 'canvas', 'boots', 'ao ', 'quan', 'vay', 'dam', 'tui'] },
  { key: 'shoe', label: 'giày', includes: ['giay', 'sneaker', 'cao got', 'boots'], excludes: ['ao ', 'quan', 'vay', 'dam', 'tui'] },
  { key: 'bag', label: 'túi', includes: ['tui', 'bag'], excludes: ['ao ', 'quan', 'giay', 'dep'] }
];

const COLOR_WORDS = ['den', 'trang', 'xanh', 'do', 'hong', 'be', 'nau', 'xam', 'kem', 'vang', 'tim'];
const GENDER_WORDS = [
  { key: 'male', words: ['nam', 'boy', 'men'] },
  { key: 'female', words: ['nu', 'girl', 'women'] },
  { key: 'unisex', words: ['unisex'] }
];

const normalize = (value) => String(value || '').toLowerCase().normalize('NFC');
const plain = (value) => normalize(value)
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/đ/g, 'd');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasKeyword = (text, keyword) => new RegExp(`(^|\\s)${escapeRegex(keyword.trim())}(?=\\s|$)`).test(text);

const productText = (product) => plain([
  product.name,
  product.category_name,
  product.description,
  ...(product.tags || []).map((tag) => tag.name),
  ...(product.variants || []).map((variant) => `${variant.color} ${variant.size}`)
].join(' '));

const parseBudget = (text) => {
  const compact = plain(text).replace(/\s+/g, '');
  const kMatch = compact.match(/(?:duoi|toi da|max|tam|khoang)?(\d{2,4})k\b/);
  if (kMatch) return Number(kMatch[1]) * 1000;

  const millionMatch = compact.match(/(\d+(?:[,.]\d+)?)tr(?:ieu)?\b/);
  if (millionMatch) return Number(millionMatch[1].replace(',', '.')) * 1000000;

  const vndMatch = compact.match(/(\d{5,9})(?:d|vnd)?\b/);
  if (vndMatch) return Number(vndMatch[1]);

  return null;
};

const parseConstraints = (message) => {
  const text = ` ${plain(message).replace(/\s+/g, ' ')} `;
  const productType = PRODUCT_TYPE_RULES.find((rule) => rule.includes.some((keyword) => hasKeyword(text, keyword)));
  const colors = COLOR_WORDS.filter((color) => text.includes(` ${color} `));
  const gender = GENDER_WORDS.find((group) => group.words.some((word) => text.includes(` ${word} `)))?.key || null;

  return {
    text,
    budget: parseBudget(message),
    productType,
    colors,
    gender
  };
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
    price: Number(product.base_price || 0),
    stock,
    colors,
    sizes,
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
  claim_type: coupon.claim_type,
  claim_min_items: Number(coupon.claim_min_items || 0),
  claim_min_subtotal: Number(coupon.claim_min_subtotal || 0),
  event_title: coupon.event_title,
  event_description: coupon.event_description,
  event_badge: coupon.event_badge,
  remaining_uses: coupon.usage_limit !== null ? Math.max(0, Number(coupon.usage_limit || 0) - Number(coupon.used_count || 0)) : null
});

const inferIntent = (message) => {
  const text = plain(message);
  const compactText = text.replace(/[!?.。]+/g, '').replace(/\s+/g, ' ').trim();
  const constraints = parseConstraints(message);

  if (/^(hi|hello|hey|alo|chao|xin chao|shop oi|bot oi|ad oi)( shop)?$/.test(compactText)) return 'greeting';
  if (/voucher|ma giam|ma giam gia|khuyen mai|coupon|freeship|free ship|san ma|giam gia|uu dai/.test(text)) return 'voucher';
  if (/doi tra|bao hanh|giao hang|phi ship|van chuyen|cod|thanh toan|dia chi/.test(text)) return 'policy';
  if (/\b(size|co ao|co quan|chon co|vua size|mac size|kg|m\d)\b/.test(text)) return 'size';
  if (/phoi|outfit|tu van|goi y|mac|di choi|di lam|du tiec|hen ho|style|phong cach/.test(text)) return 'styling';
  if (/tim|kiem|co.*khong|mua|duoi|tren|gia|bao nhieu|con hang/.test(text)) return 'search';
  if (constraints.productType || constraints.budget) return 'search';

  return 'general';
};

const scoreProduct = (product, words, constraints) => {
  const text = productText(product);
  const price = Number(product.base_price || 0);
  let score = words.filter((word) => text.includes(word)).length;

  if (constraints.productType) {
    const paddedText = ` ${text.replace(/\s+/g, ' ')} `;
    const hasType = constraints.productType.includes.some((keyword) => hasKeyword(paddedText, keyword));
    const hasExcludedType = constraints.productType.excludes.some((keyword) => hasKeyword(paddedText, keyword));
    if (!hasType || hasExcludedType) return null;
    score += 50;
  }

  if (constraints.budget) {
    if (price > constraints.budget) return null;
    score += 20 + Math.max(0, 10 - Math.floor((constraints.budget - price) / 100000));
  }

  if (constraints.colors.length > 0) {
    const matchedColors = constraints.colors.filter((color) => text.includes(color));
    if (matchedColors.length === 0) score -= 10;
    score += matchedColors.length * 8;
  }

  if (constraints.gender) {
    if (text.includes(constraints.gender === 'male' ? 'nam' : constraints.gender === 'female' ? 'nu' : 'unisex')) score += 8;
  }

  score += Math.min(5, Number(product.average_rating || 0));
  score += Math.min(3, Number(product.like_count || 0) / 5);
  return score;
};

const selectRelevantProducts = (products, message) => {
  const constraints = parseConstraints(message);
  const words = constraints.text.split(/\s+/).map((word) => word.trim()).filter((word) => word.length >= 2);

  const ranked = products
    .map((product) => ({ product, score: scoreProduct(product, words, constraints) }))
    .filter((item) => item.score !== null)
    .sort((a, b) => b.score - a.score || Number(a.product.base_price || 0) - Number(b.product.base_price || 0));

  if (ranked.length === 0 && (constraints.productType || constraints.budget)) {
    return [];
  }

  const fallbackRanked = ranked.length > 0 ? ranked : products
    .map((product) => {
      const text = productText(product);
      const score = words.filter((word) => text.includes(word)).length;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || Number(b.product.like_count || 0) - Number(a.product.like_count || 0));

  return fallbackRanked.slice(0, MAX_PRODUCT_CONTEXT).map((item) => compactProduct(item.product));
};

const buildSuggestedQueries = (products, message) => {
  const base = products.flatMap((product) => [
    product.category,
    ...(product.tags || []),
    ...(product.colors || [])
  ]).filter(Boolean);
  const unique = [...new Set(base)].slice(0, 3);
  if (unique.length > 0) return unique;
  return String(message || '').split(/\s+/).filter((word) => word.length > 2).slice(0, 3);
};

const makeProductReason = (product, message) => {
  const constraints = parseConstraints(message);
  const hints = [];
  if (constraints.productType) hints.push(`đúng nhóm ${constraints.productType.label}`);
  if (constraints.budget && product.price <= constraints.budget) hints.push(`trong ngân sách ${constraints.budget.toLocaleString('vi-VN')}đ`);
  const matchedColor = product.colors?.find((color) => constraints.colors.includes(plain(color)));
  if (matchedColor) hints.push(`có màu ${matchedColor}`);
  if (product.category && hints.length === 0) hints.push(product.category);

  return hints.length > 0
    ? `Phù hợp vì ${hints.join(', ')}.`
    : 'Phù hợp với nhu cầu bạn vừa mô tả.';
};

const buildSystemPrompt = (intent) => `
Bạn là trợ lý AI của website thời trang LuxuryWear.
Hãy trả lời tự nhiên như nhân viên tư vấn thân thiện, không máy móc.

Quy tắc bắt buộc:
- Luôn trả lời bằng tiếng Việt.
- Tôn trọng đúng ý định hiện tại, không tự lái câu chuyện sang sản phẩm nếu khách không hỏi sản phẩm.
- Chỉ tư vấn sản phẩm trong PRODUCT_CONTEXT, không tự bịa sản phẩm ngoài danh sách.
- Nếu khách nêu ngân sách, chỉ nói các sản phẩm được hệ thống lọc là trong ngân sách.
- Nếu intent là greeting: chào lại ngắn gọn, hỏi khách cần tìm đồ, voucher hay đơn hàng; không gợi ý sản phẩm cụ thể.
- Nếu intent là voucher: giải thích voucher dựa trên COUPON_CONTEXT, nhắc khách vào trang "Săn voucher" hoặc giỏ hàng để áp mã; không tư vấn quần áo.
- Nếu intent là policy: trả lời thận trọng, không bịa chính sách chi tiết ngoài dữ liệu có trong prompt.
- Nếu intent là styling/search/size: tư vấn chọn đồ dựa trên PRODUCT_CONTEXT.
- Nếu intent là general: trò chuyện tự nhiên, sau đó gợi ý khách có thể hỏi về chọn đồ, voucher hoặc đơn hàng.
- Tối đa 3 câu, không dùng markdown code block.

INTENT: ${intent}
`;

const buildUserPrompt = ({ message, history, products, coupons }) => `
CHAT_HISTORY:
${JSON.stringify(history.slice(-MAX_HISTORY_MESSAGES))}

PRODUCT_CONTEXT:
${JSON.stringify(products)}

COUPON_CONTEXT:
${JSON.stringify(coupons)}

CUSTOMER_MESSAGE:
${message}
`;

const buildCouponReply = (coupons) => {
  if (coupons.length === 0) {
    return 'Hiện mình chưa thấy voucher khả dụng trong hệ thống. Bạn có thể vào trang Săn voucher để kiểm tra các nhiệm vụ mới nhất.';
  }

  const descriptions = coupons.slice(0, 3).map((coupon) => {
    if (coupon.type === 'free_shipping') return `${coupon.code || coupon.name} miễn hoặc giảm phí vận chuyển`;
    if (coupon.discount_percent) return `${coupon.code || coupon.name} giảm ${coupon.discount_percent}%`;
    return coupon.code || coupon.name;
  });

  return `Hiện có voucher như ${descriptions.join(', ')}. Bạn vào trang Săn voucher để nhận mã, hoặc mở giỏ hàng để chọn voucher phù hợp với đơn hiện tại.`;
};

const buildLocalFallbackReply = (message, intent, products, coupons) => {
  if (intent === 'greeting') {
    return 'Chào bạn, mình là trợ lý của LuxuryWear. Bạn muốn mình hỗ trợ tìm sản phẩm, xem voucher hay kiểm tra thông tin đơn hàng?';
  }
  if (intent === 'voucher') return buildCouponReply(coupons);
  if (intent === 'policy') {
    return 'Mình có thể hỗ trợ thông tin chung về giao hàng, thanh toán COD, voucher và đơn hàng. Với trường hợp cụ thể, bạn nên kiểm tra trong trang đơn hàng hoặc liên hệ shop.';
  }
  if (intent === 'size') {
    return 'Bạn cho mình thêm chiều cao, cân nặng và form mặc thích rộng hay vừa nhé. Trước mắt mình gợi ý vài sản phẩm có size và tồn kho dễ chọn bên dưới.';
  }
  if (intent === 'search') {
    if (products.length === 0) {
      return 'Mình chưa thấy sản phẩm nào khớp đúng loại hoặc ngân sách bạn đưa ra. Bạn thử nới ngân sách, đổi màu, hoặc dùng từ khóa rộng hơn một chút nhé.';
    }
    const firstCategory = products[0]?.category || 'sản phẩm phù hợp';
    return `Mình đã lọc các ${firstCategory} sát với nhu cầu và ngân sách của bạn. Bạn bấm vào từng sản phẩm để xem màu, size và tồn kho chi tiết nhé.`;
  }
  if (intent === 'styling') {
    if (products.length === 0) {
      return 'Mình chưa tìm thấy sản phẩm đủ khớp để phối theo yêu cầu này. Bạn thử nới ngân sách hoặc mô tả rộng hơn, ví dụ “áo khoác đi chơi dưới 900k”.';
    }
    const firstCategory = products[0]?.category || 'sản phẩm phù hợp';
    return `Mình gợi ý bắt đầu với ${firstCategory}, ưu tiên các món đúng ngân sách và đúng nhóm sản phẩm bạn hỏi. Một vài lựa chọn phù hợp đang ở bên dưới.`;
  }
  return 'Mình nghe đây. Bạn có thể hỏi mình về cách phối đồ, tìm sản phẩm, chọn size, voucher đang có hoặc thông tin đơn hàng trên LuxuryWear.';
};

const loadContext = async (intent, message, userId) => {
  const shouldLoadProducts = PRODUCT_INTENTS.has(intent);
  const shouldLoadCoupons = intent === 'voucher';
  const allProducts = shouldLoadProducts ? await Product.findAll(null, userId || null) : [];
  const products = shouldLoadProducts ? selectRelevantProducts(allProducts, message) : [];
  const coupons = shouldLoadCoupons
    ? (await Coupon.listAll())
      .filter((coupon) => coupon.is_active)
      .sort((a, b) => {
        const aPriority = PRIORITY_COUPON_CODES.includes(a.code) ? 0 : 1;
        const bPriority = PRIORITY_COUPON_CODES.includes(b.code) ? 0 : 1;
        return aPriority - bPriority || Number(a.sort_order || 999) - Number(b.sort_order || 999);
      })
      .slice(0, 12)
      .map(compactCoupon)
    : [];

  return { allProducts, products, coupons };
};

export const chatWithStylist = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const cleanMessage = String(message || '').trim();
    if (cleanMessage.length < 2) return sendResponse(res, 400, false, 'Vui lòng nhập nội dung cần tư vấn.');
    if (cleanMessage.length > 1000) return sendResponse(res, 400, false, 'Nội dung tư vấn tối đa 1000 ký tự.');

    const intent = inferIntent(cleanMessage);
    const { allProducts, products, coupons } = await loadContext(intent, cleanMessage, req.user?.id);
    const messages = [
      { role: 'system', content: buildSystemPrompt(intent) },
      { role: 'user', content: buildUserPrompt({ message: cleanMessage, history, products, coupons }) }
    ];

    let aiText = '';
    let usedModel = 'local-fallback';
    try {
      const generated = await generateWithOpenRouterFallback({ messages, temperature: intent === 'greeting' ? 0.6 : 0.35 });
      aiText = generated.text;
      usedModel = generated.model;
    } catch {
      aiText = buildLocalFallbackReply(cleanMessage, intent, products, coupons);
    }

    const productMap = new Map(allProducts.map((product) => [Number(product.id), product]));
    const recommendedProducts = PRODUCT_INTENTS.has(intent)
      ? products.slice(0, 5).map((item) => {
        const product = productMap.get(Number(item.id));
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          price: product.base_price,
          image_url: product.image_url,
          category_name: product.category_name,
          reason: makeProductReason(item, cleanMessage)
        };
      }).filter(Boolean)
      : [];

    return sendResponse(res, 200, true, 'AI đã tạo gợi ý tư vấn', {
      reply: aiText || buildLocalFallbackReply(cleanMessage, intent, products, coupons),
      intent,
      suggested_queries: PRODUCT_INTENTS.has(intent) ? buildSuggestedQueries(products, cleanMessage) : [],
      recommended_products: recommendedProducts,
      model: usedModel
    });
  } catch (error) {
    next(error);
  }
};
