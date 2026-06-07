const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const getConfiguredModels = () => {
  const rawModels = process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.5-flash-lite';
  return rawModels.split(',').map((model) => model.trim()).filter(Boolean);
};

const isRetryableGeminiError = (status, bodyText) => {
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  return /RESOURCE_EXHAUSTED|quota|rate limit|overloaded/i.test(bodyText || '');
};

const extractText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
};

const callGeminiModel = async ({ model, prompt, temperature = 0.45 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('Chưa cấu hình GEMINI_API_KEY trong backend/.env');
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        topP: 0.9,
        maxOutputTokens: 220
      }
    })
  });

  const bodyText = await response.text();
  if (!response.ok) {
    const error = new Error(bodyText || `Gemini API lỗi ${response.status}`);
    error.status = response.status;
    error.retryable = isRetryableGeminiError(response.status, bodyText);
    throw error;
  }

  const data = JSON.parse(bodyText);
  return extractText(data);
};

export const generateWithGeminiFallback = async ({ prompt, temperature }) => {
  const models = getConfiguredModels();
  let lastError = null;

  for (const model of models) {
    try {
      const text = await callGeminiModel({ model, prompt, temperature });
      return { text, model };
    } catch (error) {
      lastError = error;
      if (!error.retryable) break;
    }
  }

  const message = lastError?.status === 429
    ? 'AI đang quá tải hoặc hết quota tạm thời, vui lòng thử lại sau ít phút.'
    : 'Chưa gọi được Gemini API, vui lòng kiểm tra API key hoặc model.';
  const finalError = new Error(message);
  finalError.status = lastError?.status || 500;
  throw finalError;
};
