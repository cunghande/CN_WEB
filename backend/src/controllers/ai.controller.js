import Product from '../models/Product.model.js';
import { generateWithGeminiFallback } from '../services/geminiService.js';
import { sendResponse } from '../utils/helpers.js';

const MAX_HISTORY_MESSAGES = 8;
const MAX_PRODUCT_CONTEXT = 35;

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

const selectRelevantProducts = (products, message) => {
  const keyword = String(message || '').toLowerCase();
  const scored = products.map((product) => {
    const text = [
      product.name,
      product.category_name,
      product.description,
      ...(product.tags || []).map((tag) => tag.name),
      ...(product.variants || []).map((variant) => `${variant.color} ${variant.size}`)
    ].join(' ').toLowerCase();

    const score = keyword.split(/\s+/).filter((word) => word.length >= 2 && text.includes(word)).length;
    return { product, score };
  });

  const relevant = scored
    .sort((a, b) => b.score - a.score || Number(b.product.like_count || 0) - Number(a.product.like_count || 0))
    .slice(0, MAX_PRODUCT_CONTEXT)
    .map((item) => compactProduct(item.product));

  return relevant;
};

const buildStylistPrompt = ({ message, history, products }) => `
Bạn là AI stylist và trợ lý chăm sóc khách hàng cho website thời trang LuxuryWear.
Nhiệm vụ:
- Tư vấn chọn đồ, phối đồ, size, màu sắc theo nhu cầu khách.
- Tìm sản phẩm phù hợp trong danh sách sản phẩm được cung cấp.
- Chỉ gợi ý sản phẩm có trong PRODUCT_CONTEXT.
- Nếu khách hỏi ngoài thời trang/mua hàng, trả lời ngắn và kéo về nhu cầu mua sắm.
- Trả lời bằng tiếng Việt tự nhiên, rõ ràng, không bịa chính sách.
- Chỉ viết 2 câu ngắn, tối đa 280 ký tự.
- Không liệt kê tên sản phẩm chi tiết vì hệ thống sẽ hiển thị sản phẩm riêng bên dưới.
- Không trả JSON, không markdown code block.

CHAT_HISTORY:
${JSON.stringify(history.slice(-MAX_HISTORY_MESSAGES))}

PRODUCT_CONTEXT:
${JSON.stringify(products)}

CUSTOMER_MESSAGE:
${message}
`;

const inferIntent = (message) => {
  const text = String(message || '').toLowerCase();
  if (/size|cỡ|vừa|cao|nặng|kg|m\d/.test(text)) return 'size';
  if (/tìm|kiếm|có.*không|mua|dưới|trên|giá/.test(text)) return 'search';
  if (/phối|outfit|mặc|đi chơi|đi làm|dự tiệc|hẹn hò/.test(text)) return 'styling';
  if (/đổi trả|ship|giao|voucher|mã/.test(text)) return 'policy';
  return 'general';
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
  const text = String(message || '').toLowerCase();
  const hints = [];
  if (product.category) hints.push(product.category);
  if (product.colors?.some((color) => text.includes(String(color).toLowerCase()))) hints.push(`có màu ${product.colors.find((color) => text.includes(String(color).toLowerCase()))}`);
  if (product.price) hints.push(`giá ${Number(product.price).toLocaleString('vi-VN')}đ`);
  return hints.length > 0
    ? `Phù hợp vì ${hints.join(', ')}.`
    : 'Phù hợp với nhu cầu bạn vừa mô tả.';
};

export const chatWithStylist = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const cleanMessage = String(message || '').trim();
    if (cleanMessage.length < 2) return sendResponse(res, 400, false, 'Vui lòng nhập nội dung cần tư vấn.');
    if (cleanMessage.length > 1000) return sendResponse(res, 400, false, 'Nội dung tư vấn tối đa 1000 ký tự.');

    const allProducts = await Product.findAll(null, req.user?.id || null);
    const products = selectRelevantProducts(allProducts, cleanMessage);
    const prompt = buildStylistPrompt({ message: cleanMessage, history, products });
    const { text, model } = await generateWithGeminiFallback({ prompt, temperature: 0.35 });

    const productMap = new Map(allProducts.map((product) => [Number(product.id), product]));
    const recommendedProducts = products
      .slice(0, 5)
      .map((item) => {
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
      })
      .filter(Boolean)
      .slice(0, 5);

    return sendResponse(res, 200, true, 'AI đã tạo gợi ý tư vấn', {
      reply: text || 'Mình đã tìm được một vài gợi ý phù hợp cho bạn.',
      intent: inferIntent(cleanMessage),
      suggested_queries: buildSuggestedQueries(products, cleanMessage),
      recommended_products: recommendedProducts,
      model
    });
  } catch (error) {
    next(error);
  }
};
