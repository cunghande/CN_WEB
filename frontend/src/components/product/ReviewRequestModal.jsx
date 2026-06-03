import React, { useState } from 'react';
import { Camera, Star } from 'lucide-react';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import { normalizeText, validateReview } from '../../utils/validation.js';

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="rounded-2xl p-1 text-amber-400 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-label={`Chọn ${star} sao`}
      >
        <Star className={`h-8 w-8 ${star <= value ? 'fill-current' : 'fill-transparent'}`} />
      </button>
    ))}
  </div>
);

const ReviewRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [draft, setDraft] = useState({ rating: 5, content: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    setDraft({ rating: 5, content: '', image: null });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateReview(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...draft,
        content: normalizeText(draft.content)
      });
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Đánh giá sản phẩm" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="text-sm font-black text-slate-700 dark:text-slate-200">Chất lượng sản phẩm</div>
          <div className="mt-2">
            <StarPicker value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} />
          </div>
        </div>

        <textarea
          value={draft.content}
          onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
          placeholder="Chia sẻ cảm nhận về chất vải, form dáng, màu sắc hoặc trải nghiệm sử dụng..."
          className="min-h-32 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800">
          <Camera className="h-5 w-5" />
          <span className="min-w-0 flex-1 truncate">{draft.image?.name || 'Upload ảnh phản ánh nếu có'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setDraft((current) => ({ ...current, image: event.target.files?.[0] || null }))}
          />
        </label>

        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>Để sau</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewRequestModal;
