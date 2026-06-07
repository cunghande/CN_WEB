const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

const defaultModels = [
  'deepseek/deepseek-chat-v3:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];

const getConfiguredModels = () => {
  const rawModels = process.env.OPENROUTER_MODELS || defaultModels.join(',');
  return rawModels.split(',').map((model) => model.trim()).filter(Boolean);
};

const isRetryableOpenRouterError = (status, bodyText) => {
  if ([408, 409, 429, 500, 502, 503, 504].includes(status)) return true;
  return /rate limit|quota|temporarily unavailable|overloaded|no endpoints|timeout/i.test(bodyText || '');
};

const extractMessageText = (data) => {
  const content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return content.map((part) => part.text || part.content || '').join('\n').trim();
  }
  return String(content || '').trim();
};

const callOpenRouterModel = async ({ model, messages, temperature = 0.45 }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const error = new Error('Chưa cấu hình OPENROUTER_API_KEY trong backend/.env');
    error.status = 500;
    throw error;
  }

  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': process.env.APP_NAME || 'LuxuryWear'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 260
    })
  });

  const bodyText = await response.text();
  if (!response.ok) {
    const error = new Error(bodyText || `OpenRouter API lỗi ${response.status}`);
    error.status = response.status;
    error.retryable = isRetryableOpenRouterError(response.status, bodyText);
    throw error;
  }

  return extractMessageText(JSON.parse(bodyText));
};

export const generateWithOpenRouterFallback = async ({ messages, temperature }) => {
  const models = getConfiguredModels();
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callOpenRouterModel({ model, messages, temperature });
      return { text, model };
    } catch (error) {
      lastError = error;
      if (!error.retryable) break;
    }
  }

  const message = lastError?.status === 429
    ? 'AI đang quá tải hoặc hết quota tạm thời, vui lòng thử lại sau ít phút.'
    : 'Chưa gọi được OpenRouter API, vui lòng kiểm tra API key hoặc model.';
  const finalError = new Error(message);
  finalError.status = lastError?.status || 500;
  throw finalError;
};
