import Product from '../models/Product.model.js';
import { generateWithOpenRouterFallback } from '../services/openRouterService.js';
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
  const words = String(message || '')
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);

  return products
    .map((product) => {
      const searchableText = [
        product.name,
        product.category_name,
        product.description,
        ...(product.tags || []).map((tag) => tag.name),
        ...(product.variants || []).map((variant) => `${variant.color} ${variant.size}`)
      ].join(' ').toLowerCase();

      const score = words.filter((word) => searchableText.includes(word)).length;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || Number(b.product.like_count || 0) - Number(a.product.like_count || 0))
    .slice(0, MAX_PRODUCT_CONTEXT)
    .map((item) => compactProduct(item.product));
};

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
  const matchedColor = product.colors?.find((color) => text.includes(String(color).toLowerCase()));
  if (matchedColor) hints.push(`có màu ${matchedColor}`);
  if (product.price) hints.push(`giá ${Number(product.price).toLocaleString('vi-VN')}đ`);

  return hints.length > 0
    ? `Phù hợp vì ${hints.join(', ')}.`
    : 'Phù hợp với nhu cầu bạn vừa mô tả.';
};

const buildSystemPrompt = () => `
Bạn là AI stylist và trợ lý chăm sóc khách hàng cho website thời trang LuxuryWear.
Nhiệm vụ:
- Tư vấn chọn đồ, phối outfit, size và màu sắc theo nhu cầu khách.
- Hỗ trợ tìm sản phẩm trong PRODUCT_CONTEXT.
- Không bịa sản phẩm, chính sách hoặc khuyến mãi ngoài dữ liệu được cung cấp.
- Trả lời bằng tiếng Việt tự nhiên.
- Chỉ viết 2 câu ngắn, tối đa 280 ký tự.
- Không liệt kê tên sản phẩm chi tiết vì hệ thống sẽ hiển thị sản phẩm riêng bên dưới.
`;

const buildUserPrompt = ({ message, history, products }) => `
CHAT_HISTORY:
${JSON.stringify(history.slice(-MAX_HISTORY_MESSAGES))}

PRODUCT_CONTEXT:
${JSON.stringify(products)}

CUSTOMER_MESSAGE:
${message}
`;

const buildLocalFallbackReply = (message, products) => {
  const intent = inferIntent(message);
  const firstCategory = products[0]?.category || 'sản phẩm phù hợp';
  if (intent === 'size') return 'Bạn cho mình thêm chiều cao, cân nặng và form mặc thích rộng hay vừa nhé. Trước mắt mình gợi ý vài sản phẩm có size và tồn kho dễ chọn bên dưới.';
  if (intent === 'search') return `Mình đã lọc nhanh các ${firstCategory} gần với nhu cầu của bạn. Bạn có thể bấm vào từng sản phẩm để xem màu, size và tồn kho chi tiết.`;
  if (intent === 'policy') return 'Mình có thể hỗ trợ tìm sản phẩm, chọn size, phối đồ và áp voucher. Với chính sách cụ thể, bạn nên kiểm tra lại thông tin trên trang đơn hàng hoặc liên hệ shop.';
  return `Mình gợi ý bạn bắt đầu với ${firstCategory}, sau đó phối thêm item cùng tông màu để outfit gọn và dễ mặc hơn. Một vài sản phẩm phù hợp đang ở bên dưới.`;
};

export const chatWithStylist = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const cleanMessage = String(message || '').trim();
    if (cleanMessage.length < 2) return sendResponse(res, 400, false, 'Vui lòng nhập nội dung cần tư vấn.');
    if (cleanMessage.length > 1000) return sendResponse(res, 400, false, 'Nội dung tư vấn tối đa 1000 ký tự.');

    const allProducts = await Product.findAll(null, req.user?.id || null);
    const products = selectRelevantProducts(allProducts, cleanMessage);
    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt({ message: cleanMessage, history, products }) }
    ];

    let aiText = '';
    let usedModel = 'local-fallback';
    try {
      const generated = await generateWithOpenRouterFallback({ messages, temperature: 0.35 });
      aiText = generated.text;
      usedModel = generated.model;
    } catch (error) {
      aiText = buildLocalFallbackReply(cleanMessage, products);
    }
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
      .filter(Boolean);

    return sendResponse(res, 200, true, 'AI đã tạo gợi ý tư vấn', {
      reply: aiText || buildLocalFallbackReply(cleanMessage, products),
      intent: inferIntent(cleanMessage),
      suggested_queries: buildSuggestedQueries(products, cleanMessage),
      recommended_products: recommendedProducts,
      model: usedModel
    });
  } catch (error) {
    next(error);
  }
};
