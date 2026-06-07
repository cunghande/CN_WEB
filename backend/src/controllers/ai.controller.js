import { retrieveAiContext, PRODUCT_AI_INTENTS, makeProductReason } from '../services/aiRetrievalService.js';
import { generateWithOpenRouterFallback } from '../services/openRouterService.js';
import { sendResponse } from '../utils/helpers.js';

const MAX_HISTORY_MESSAGES = 8;

const buildSystemPrompt = (intent) => `
Bạn là trợ lý AI của website thời trang LuxuryWear.
Hãy nói chuyện tự nhiên, thân thiện và gọn như nhân viên tư vấn thương mại điện tử.

Quy tắc bắt buộc:
- Luôn trả lời bằng tiếng Việt.
- Không tự bịa sản phẩm, voucher hoặc chính sách ngoài context được cung cấp.
- Nếu user hỏi sản phẩm, chỉ tư vấn dựa trên PRODUCT_CONTEXT.
- Nếu PRODUCT_CONTEXT rỗng, hãy nói chưa tìm thấy sản phẩm khớp và gợi ý đổi từ khóa/ngân sách.
- Nếu user hỏi voucher, chỉ dùng COUPON_CONTEXT, không lái sang quần áo.
- Nếu user hỏi chính sách, chỉ dùng POLICY_CONTEXT hoặc nói cần kiểm tra thêm trên đơn hàng.
- Nếu user chỉ chào hỏi, chào lại tự nhiên và hỏi họ cần tìm sản phẩm, voucher hay đơn hàng.
- Tối đa 3 câu, không dùng markdown code block.

INTENT: ${intent}
`;

const buildUserPrompt = ({ message, history, context }) => `
CHAT_HISTORY:
${JSON.stringify(history.slice(-MAX_HISTORY_MESSAGES))}

PRODUCT_CONTEXT:
${JSON.stringify(context.products)}

COUPON_CONTEXT:
${JSON.stringify(context.coupons)}

POLICY_CONTEXT:
${JSON.stringify(context.policies)}

SHOPPING_CONSTRAINTS:
${JSON.stringify({
  product_type: context.constraints.productType?.label || null,
  budget: context.constraints.budget || null,
  colors: context.constraints.colors || [],
  gender: context.constraints.gender?.label || null
})}

CUSTOMER_MESSAGE:
${message}
`;

const buildCouponReply = (coupons) => {
  if (coupons.length === 0) {
    return 'Hiện mình chưa thấy voucher khả dụng trong hệ thống. Bạn có thể vào trang Săn voucher để kiểm tra nhiệm vụ mới nhất.';
  }

  const descriptions = coupons.slice(0, 3).map((coupon) => {
    if (coupon.type === 'free_shipping') return `${coupon.code || coupon.name} miễn hoặc giảm phí vận chuyển`;
    if (coupon.discount_percent) return `${coupon.code || coupon.name} giảm ${coupon.discount_percent}%`;
    return coupon.code || coupon.name;
  });

  return `Hiện có voucher như ${descriptions.join(', ')}. Bạn vào trang Săn voucher để nhận mã, hoặc mở giỏ hàng để chọn voucher phù hợp với đơn hiện tại.`;
};

const buildPolicyReply = (policies) => {
  if (policies.length === 0) {
    return 'Mình có thể hỗ trợ thông tin chung về giao hàng, thanh toán COD, voucher và đơn hàng. Với trường hợp cụ thể, bạn nên kiểm tra trong trang đơn hàng hoặc liên hệ shop.';
  }
  return policies.slice(0, 2).map((policy) => policy.content).join(' ');
};

const buildLocalFallbackReply = (intent, context) => {
  if (intent === 'greeting') {
    return 'Chào bạn, mình là trợ lý của LuxuryWear. Bạn muốn mình hỗ trợ tìm sản phẩm, xem voucher hay kiểm tra thông tin đơn hàng?';
  }
  if (intent === 'voucher') return buildCouponReply(context.coupons);
  if (intent === 'policy') return buildPolicyReply(context.policies);
  if (intent === 'size') {
    return context.products.length === 0
      ? 'Bạn cho mình thêm chiều cao, cân nặng và kiểu mặc thích rộng hay vừa nhé. Mình sẽ lọc lại sản phẩm phù hợp hơn.'
      : 'Mình đã lọc một số sản phẩm có size và tồn kho để bạn tham khảo. Bạn cho thêm chiều cao, cân nặng và form mặc mong muốn để mình tư vấn sát hơn nhé.';
  }
  if (intent === 'search') {
    if (context.products.length === 0) {
      return 'Mình chưa thấy sản phẩm nào khớp đúng loại hoặc ngân sách bạn đưa ra. Bạn thử nới ngân sách, đổi màu, hoặc dùng từ khóa rộng hơn một chút nhé.';
    }
    const firstCategory = context.products[0]?.category || 'sản phẩm phù hợp';
    return `Mình đã lọc các ${firstCategory} sát với nhu cầu và ngân sách của bạn. Bạn bấm vào từng sản phẩm để xem màu, size và tồn kho chi tiết nhé.`;
  }
  if (intent === 'styling') {
    if (context.products.length === 0) {
      return 'Mình chưa tìm thấy sản phẩm đủ khớp để phối theo yêu cầu này. Bạn thử nới ngân sách hoặc mô tả rộng hơn, ví dụ “áo khoác đi chơi dưới 900k”.';
    }
    const firstCategory = context.products[0]?.category || 'sản phẩm phù hợp';
    return `Mình gợi ý bắt đầu với ${firstCategory}, ưu tiên các món đúng ngân sách và đúng nhóm sản phẩm bạn hỏi. Một vài lựa chọn phù hợp đang ở bên dưới.`;
  }
  return 'Mình nghe đây. Bạn có thể hỏi mình về cách phối đồ, tìm sản phẩm, chọn size, voucher đang có hoặc thông tin đơn hàng trên LuxuryWear.';
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

export const chatWithStylist = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const cleanMessage = String(message || '').trim();
    if (cleanMessage.length < 2) return sendResponse(res, 400, false, 'Vui lòng nhập nội dung cần tư vấn.');
    if (cleanMessage.length > 1000) return sendResponse(res, 400, false, 'Nội dung tư vấn tối đa 1000 ký tự.');

    const context = await retrieveAiContext({ message: cleanMessage, userId: req.user?.id });
    const messages = [
      { role: 'system', content: buildSystemPrompt(context.intent) },
      { role: 'user', content: buildUserPrompt({ message: cleanMessage, history, context }) }
    ];

    let aiText = '';
    let usedModel = 'local-fallback';
    try {
      const generated = await generateWithOpenRouterFallback({
        messages,
        temperature: context.intent === 'greeting' ? 0.6 : 0.3
      });
      aiText = generated.text;
      usedModel = generated.model;
    } catch {
      aiText = buildLocalFallbackReply(context.intent, context);
    }

    const recommendedProducts = PRODUCT_AI_INTENTS.has(context.intent)
      ? context.products.slice(0, 5).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.base_price,
        image_url: product.image_url,
        category_name: product.category_name,
        reason: makeProductReason(product, context.constraints)
      }))
      : [];

    return sendResponse(res, 200, true, 'AI đã tạo gợi ý tư vấn', {
      reply: aiText || buildLocalFallbackReply(context.intent, context),
      intent: context.intent,
      retrieval: context.retrieval,
      suggested_queries: PRODUCT_AI_INTENTS.has(context.intent) ? buildSuggestedQueries(context.products, cleanMessage) : [],
      recommended_products: recommendedProducts,
      model: usedModel
    });
  } catch (error) {
    next(error);
  }
};
