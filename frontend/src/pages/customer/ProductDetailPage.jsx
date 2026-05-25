import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ShoppingBag, Star } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { addProductCommentAPI, addProductReviewAPI, getProductByIdAPI, toggleProductLikeAPI } from '../../services/productService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getLowestStockVariant, getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

const parseGallery = (gallery) => {
  if (Array.isArray(gallery)) return gallery;
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [review, setReview] = useState({ rating: 5, content: '' });
  const [message, setMessage] = useState('');

  const loadProduct = async () => {
    setLoading(true);
    const res = await getProductByIdAPI(id);
    setProduct(res.data);
    setSelectedVariant(getLowestStockVariant(res.data));
    setLoading(false);
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.image_url, ...parseGallery(product.gallery_json)].filter(Boolean).slice(0, 4);
  }, [product]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setMessage('Vui lòng đăng nhập để thích sản phẩm.');
      return;
    }
    await toggleProductLikeAPI(id);
    await loadProduct();
  };

  const handleShare = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setMessage('Đã sao chép link sản phẩm.');
  };

  const handleAddCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, Math.min(quantity, selectedVariant.stock_quantity));
    setMessage('Đã thêm vào giỏ hàng.');
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return setMessage('Vui lòng đăng nhập để bình luận.');
    if (!comment.trim()) return;
    await addProductCommentAPI(id, comment.trim());
    setComment('');
    await loadProduct();
  };

  const handleReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return setMessage('Vui lòng đăng nhập để đánh giá.');
    await addProductReviewAPI(id, { ...review, rating: Number(review.rating) });
    setReview({ rating: 5, content: '' });
    await loadProduct();
  };

  if (loading) return <div className="py-24"><Spinner size="lg" /></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/products" className="text-sm font-bold text-premium-700 dark:text-premium-300">← Quay lại sản phẩm</Link>
        {message && <div className="mt-4 rounded-lg bg-premium-50 p-3 text-sm font-bold text-premium-800 dark:bg-premium-900/35 dark:text-premium-200">{message}</div>}

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg bg-white shadow-soft dark:bg-slate-900">
              <img src={getImageUrl(product.image_url, fallbackImage)} alt={product.name} className="aspect-[4/5] w-full object-cover object-top" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((image, index) => (
                <img key={`${image}-${index}`} src={getImageUrl(image, fallbackImage)} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => <span key={tag.id || tag.name} className="rounded-full bg-premium-50 px-3 py-1 text-xs font-bold text-premium-800 dark:bg-premium-900/35 dark:text-premium-200">#{tag.name}</span>)}
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex text-amber-400">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-5 w-5 ${star <= Math.round(product.average_rating || 0) ? 'fill-current' : ''}`} />)}</div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{Number(product.average_rating || 0).toFixed(1)}/5 ({product.rating_count || 0} đánh giá)</span>
            </div>
            <div className="mt-5 text-3xl font-black text-premium-800 dark:text-premium-300">{formatPrice(product.base_price)}</div>
            <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>

            <div className="mt-6">
              <div className="text-xs font-black uppercase text-slate-500">Chọn biến thể</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    disabled={variant.stock_quantity <= 0}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`rounded-lg border px-4 py-3 text-left text-sm disabled:opacity-40 ${
                      selectedVariant?.id === variant.id
                        ? 'border-premium-700 bg-premium-50 text-premium-900'
                        : 'border-slate-200 dark:border-slate-700 dark:text-white'
                    }`}
                  >
                    <b>{variant.size}</b> - {variant.color}
                    <span className="block text-xs text-slate-500">Còn {variant.stock_quantity}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <button className="px-4 py-2 font-black dark:text-white" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="border-x border-slate-200 px-5 py-2 font-black dark:border-slate-700 dark:text-white">{quantity}</span>
                <button className="px-4 py-2 font-black dark:text-white" onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}>+</button>
              </div>
              <Button size="lg" onClick={handleAddCart} disabled={!selectedVariant}><ShoppingBag className="h-5 w-5" /> Thêm giỏ</Button>
              <Button variant="outline" size="lg" onClick={handleLike}><Heart className={`h-5 w-5 ${product.liked ? 'fill-red-500 text-red-500' : ''}`} /> {product.like_count || 0}</Button>
              <Button variant="outline" size="lg" onClick={handleShare}><Share2 className="h-5 w-5" /></Button>
            </div>

            <div className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">Tổng tồn kho: {getProductStock(product)}</div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><MessageCircle className="h-5 w-5" /> Bình luận</h2>
            <form onSubmit={handleComment} className="mt-4 flex gap-3">
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Viết bình luận công khai..." className="flex-1 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <Button type="submit">Gửi</Button>
            </form>
            <div className="mt-5 space-y-3">
              {product.comments?.length ? product.comments.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <b className="text-slate-950 dark:text-white">{item.full_name}</b>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.content}</p>
                </div>
              )) : <div className="text-sm text-slate-500 dark:text-slate-400">Chưa có bình luận.</div>}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Đánh giá sản phẩm</h2>
            <form onSubmit={handleReview} className="mt-4 space-y-3">
              <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} className="w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
              </select>
              <textarea value={review.content} onChange={(e) => setReview({ ...review, content: e.target.value })} placeholder="Cảm nhận của bạn..." className="w-full rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <Button type="submit">Gửi đánh giá</Button>
            </form>
            <div className="mt-5 space-y-3">
              {product.reviews?.length ? product.reviews.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <b className="text-slate-950 dark:text-white">{item.full_name} - {item.rating} sao</b>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.content}</p>
                </div>
              )) : <div className="text-sm text-slate-500 dark:text-slate-400">Chưa có đánh giá.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
