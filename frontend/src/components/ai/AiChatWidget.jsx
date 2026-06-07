import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { chatWithStylistAPI } from '../../services/aiService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';

const quickPrompts = [
  'Tư vấn outfit đi chơi cuối tuần dưới 700k',
  'Mình muốn đồ công sở nữ thanh lịch',
  'Tìm áo nam màu đen dễ phối',
  'Gợi ý phối đồ đi hẹn hò'
];

const initialMessages = [
  {
    role: 'assistant',
    content: 'Chào bạn, mình là stylist AI của LuxuryWear. Bạn mô tả dịp mặc, giới tính, màu thích, ngân sách hoặc sản phẩm đang cần tìm nhé.'
  }
];

const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const apiHistory = useMemo(() => (
    messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.content
    }))
  ), [messages]);

  const sendMessage = async (text = input) => {
    const cleanText = String(text || '').trim();
    if (!cleanText || loading) return;

    const userMessage = { role: 'user', content: cleanText };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithStylistAPI({ message: cleanText, history: apiHistory });
      const data = response.data;
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply,
          products: data.recommended_products || [],
          queries: data.suggested_queries || [],
          model: data.model
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: error.response?.data?.message || 'AI đang bận một chút. Bạn thử lại sau nhé.'
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-4 flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-4 py-3 text-white dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-slate-950">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black">Stylist AI</h2>
                <p className="text-xs text-slate-300">Tư vấn chọn đồ, tìm sản phẩm, phối outfit</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Đóng chat AI">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[86%]' : 'mr-auto max-w-[94%]'}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                }`}>
                  {message.content}
                </div>

                {message.products?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.products.map((product) => (
                      <Link key={product.id} to={`/products/${product.id}`} onClick={() => setOpen(false)} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
                        <img src={getImageUrl(product.image_url)} alt={product.name} className="h-16 w-14 rounded-xl bg-slate-100 object-cover object-top dark:bg-slate-800" />
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-1 text-sm font-black text-slate-950 dark:text-white">{product.name}</div>
                          <div className="mt-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(product.price)}</div>
                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500 dark:text-slate-400">{product.reason}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {message.queries?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.queries.map((query) => (
                      <Link key={query} to={`/products?q=${encodeURIComponent(query)}`} onClick={() => setOpen(false)} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                        {query}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI đang chọn đồ...
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-3 dark:border-slate-800">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)} className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-emerald-300">
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows="2"
                placeholder="Ví dụ: mình cần outfit đi tiệc tối, thích màu đen..."
                className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button type="submit" disabled={loading || !input.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi tin nhắn AI">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl ring-4 ring-white transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-slate-950 dark:bg-white dark:text-slate-950 dark:ring-slate-900"
        aria-label="Mở chatbot AI"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && <Sparkles className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-400 p-1 text-slate-950" />}
      </button>
    </div>
  );
};

export default AiChatWidget;
