import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  MessageSquareReply,
  Share2,
  ShoppingBag,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserRound
} from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import useCart from '../../hooks/useCart.js';
import {
  addCommentReplyAPI,
  addProductCommentAPI,
  deleteProductCommentAPI,
  getProductByIdAPI,
  setCommentReactionAPI,
  setReplyReactionAPI,
  toggleProductLikeAPI,
  updateProductCommentAPI
} from '../../services/productService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getLowestStockVariant, getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';

const RatingStars = ({ value, size = 'h-5 w-5' }) => (
  <div className="flex text-amber-400">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`${size} ${star <= Math.round(value || 0) ? 'fill-current' : 'fill-transparent'}`} />
    ))}
  </div>
);

const UserAvatarLink = ({ user }) => (
  <Link to={`/users/${user.user_id}`} className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-slate-200 text-xs font-black text-slate-700 transition hover:ring-2 hover:ring-premium-500 dark:bg-slate-800 dark:text-slate-200">
    {user.avatar_url ? (
      <img src={getImageUrl(user.avatar_url)} alt={user.full_name} className="h-full w-full object-cover" />
    ) : (
      <UserRound className="h-4 w-4" />
    )}
  </Link>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [message, setMessage] = useState('');

  const loadProduct = async ({ silent = false, keepVariantId = null } = {}) => {
    if (!silent) setLoading(true);
    const response = await getProductByIdAPI(id);
    const nextProduct = response.data;
    setProduct(nextProduct);
    setSelectedVariant((current) => {
      const targetId = keepVariantId || current?.id;
      return nextProduct.variants?.find((variant) => variant.id === targetId) || getLowestStockVariant(nextProduct);
    });
    if (!silent) setLoading(false);
  };

  const refreshWithoutJump = async () => {
    const top = window.scrollY;
    await loadProduct({ silent: true, keepVariantId: selectedVariant?.id });
    requestAnimationFrame(() => window.scrollTo(0, top));
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (window.location.hash && product) {
      window.setTimeout(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [product]);

  const displayImage = selectedVariant?.image_url || product?.image_url;

  const requireAuth = (text) => {
    if (isAuthenticated) return false;
    setMessage(text);
    return true;
  };

  const handleLikeProduct = async () => {
    if (requireAuth('Vui lòng đăng nhập để thích sản phẩm.')) return;
    await toggleProductLikeAPI(id);
    await refreshWithoutJump();
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
    if (requireAuth('Vui lòng đăng nhập để bình luận.')) return;
    if (!product.can_review) {
      setMessage('Bạn cần mua và nhận sản phẩm trước khi bình luận.');
      return;
    }
    if (!comment.trim()) return;
    await addProductCommentAPI(id, comment.trim());
    setComment('');
    await refreshWithoutJump();
  };

  const handleReaction = async (commentId, reaction) => {
    if (requireAuth('Vui lòng đăng nhập để tương tác với bình luận.')) return;
    await setCommentReactionAPI(id, commentId, reaction);
    await refreshWithoutJump();
  };

  const handleReplyReaction = async (commentId, replyId, reaction) => {
    if (requireAuth('Vui lòng đăng nhập để tương tác với phản hồi.')) return;
    await setReplyReactionAPI(id, commentId, replyId, reaction);
    await refreshWithoutJump();
  };

  const handleReply = async (event, commentId) => {
    event.preventDefault();
    if (requireAuth('Vui lòng đăng nhập để phản hồi bình luận.')) return;
    const targetComment = product.comments?.find((item) => item.id === commentId);
    const canReply = user?.role === 'admin' || targetComment?.user_id === user?.id;
    if (!canReply) {
      setMessage('Bạn chỉ được phản hồi trong bình luận của chính mình.');
      return;
    }
    if (!replyContent.trim()) return;
    await addCommentReplyAPI(id, commentId, replyContent.trim());
    setReplyContent('');
    setReplyingTo(null);
    await refreshWithoutJump();
  };

  const startEditComment = (item) => {
    setEditingComment(item.id);
    setEditingContent(item.content || '');
  };

  const handleUpdateComment = async (event, commentId) => {
    event.preventDefault();
    if (!editingContent.trim()) return;
    await updateProductCommentAPI(id, commentId, editingContent.trim());
    setEditingComment(null);
    setEditingContent('');
    setMessage('Đã cập nhật bình luận.');
    await refreshWithoutJump();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    await deleteProductCommentAPI(id, commentId);
    setMessage('Đã xóa bình luận.');
    await refreshWithoutJump();
  };

  if (loading) return <div className="py-24"><Spinner size="lg" /></div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#f6f3ee] py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="text-sm font-bold text-emerald-700 dark:text-emerald-300">← Quay lại sản phẩm</button>
        {message && <div className="mt-4 rounded-3xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:bg-emerald-900/35 dark:text-premium-200">{message}</div>}

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-slate-900">
              <img src={getImageUrl(displayImage, fallbackImage)} alt={product.name} className="aspect-[4/5] w-full object-cover object-top" />
            </div>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-2">
              {product.tags?.map((tag) => <span key={tag.id || tag.name} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/35 dark:text-premium-200">#{tag.name}</span>)}
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <RatingStars value={product.average_rating} />
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{Number(product.average_rating || 0).toFixed(1)}/5 ({product.rating_count || 0} đánh giá)</span>
            </div>
            <div className="mt-5 text-3xl font-black text-emerald-800 dark:text-emerald-300">{formatPrice(product.base_price)}</div>
            <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>

            <div className="mt-6">
              <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Chọn biến thể</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    disabled={variant.stock_quantity <= 0}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1);
                    }}
                    className={`flex min-w-[170px] items-center gap-3 rounded-3xl border p-3 text-left text-sm disabled:opacity-40 ${
                      selectedVariant?.id === variant.id
                        ? 'border-emerald-700 bg-emerald-50 text-premium-900 dark:bg-emerald-900/30 dark:text-premium-100'
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-[#f6f3ee] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <img src={getImageUrl(variant.image_url || product.image_url, fallbackImage)} alt={`${variant.size} ${variant.color}`} className="h-12 w-12 rounded-2xl object-cover object-top" />
                    <span>
                      <b>{variant.size}</b> - {variant.color}
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Còn {variant.stock_quantity}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
                <button className="px-4 py-2 font-black dark:text-white" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="border-x border-slate-200 px-5 py-2 font-black dark:border-slate-700 dark:text-white">{quantity}</span>
                <button className="px-4 py-2 font-black dark:text-white" onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}>+</button>
              </div>
              <Button size="lg" onClick={handleAddCart} disabled={!selectedVariant}><ShoppingBag className="h-5 w-5" /> Thêm giỏ</Button>
              <Button variant="outline" size="lg" onClick={handleLikeProduct}><Heart className={`h-5 w-5 ${product.liked ? 'fill-red-500 text-red-500' : ''}`} /> {product.like_count || 0}</Button>
              <Button variant="outline" size="lg" onClick={handleShare}><Share2 className="h-5 w-5" /></Button>
            </div>

            <div className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400">Tổng tồn kho: {getProductStock(product)}</div>
          </section>
        </div>

        <div className="mt-8">
          <section id="comments" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white"><MessageCircle className="h-5 w-5" /> Bình luận</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Chỉ khách đã mua và nhận hàng mới được bình luận. Admin sẽ phản hồi trực tiếp dưới từng bình luận.
            </p>
            {product.can_review ? (
              <form onSubmit={handleComment} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Bình luận về sản phẩm bạn đã mua..."
                  className="min-h-12 flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <Button type="submit">Gửi bình luận</Button>
              </form>
            ) : user?.role === 'admin' ? (
              <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/25 dark:text-premium-200">
                Admin có thể phản hồi từng bình luận bên dưới.
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-[#f6f3ee] p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                Bạn cần có đơn hàng đã giao thành công với sản phẩm này để bình luận.
              </div>
            )}
            <div className="mt-5 space-y-4">
              {product.comments?.length ? product.comments.map((item) => (
                <div key={item.id} id={`comment-${item.id}`} className="rounded-3xl bg-[#f6f3ee] p-4 ring-premium-300 target:ring-2 dark:bg-slate-950">
                  <div className="flex items-start gap-3">
                    <UserAvatarLink user={item} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/users/${item.user_id}`} className="font-black text-slate-950 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">{item.full_name}</Link>
                      {item.user_rating && (
                        <div className="mt-1 flex items-center gap-2">
                          <RatingStars value={item.user_rating} size="h-4 w-4" />
                        </div>
                      )}
                      {editingComment === item.id ? (
                        <form onSubmit={(event) => handleUpdateComment(event, item.id)} className="mt-3 space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm">Lưu bình luận</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingComment(null)}>Hủy</Button>
                          </div>
                        </form>
                      ) : (
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.content}</p>
                      )}
                      {item.review_image_url && (
                        <img src={getImageUrl(item.review_image_url)} alt="Ảnh phản ánh" className="mt-3 h-28 w-28 rounded-3xl object-cover object-top" />
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <button onClick={() => handleReaction(item.id, 'like')} className={`inline-flex items-center gap-1 rounded-2xl px-2 py-1 ${item.my_reaction === 'like' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                          <ThumbsUp className="h-4 w-4" /> {item.like_count || 0}
                        </button>
                        <button onClick={() => handleReaction(item.id, 'dislike')} className={`inline-flex items-center gap-1 rounded-2xl px-2 py-1 ${item.my_reaction === 'dislike' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                          <ThumbsDown className="h-4 w-4" /> {item.dislike_count || 0}
                        </button>
                        {(user?.role === 'admin' || item.user_id === user?.id) && (
                          <button onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)} className="inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                            <MessageSquareReply className="h-4 w-4" /> Phản hồi
                          </button>
                        )}
                        {item.user_id === user?.id && (
                          <>
                            <button onClick={() => startEditComment(item)} className="inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                              Sửa
                            </button>
                            <button onClick={() => handleDeleteComment(item.id)} className="inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
                              Xóa
                            </button>
                          </>
                        )}
                      </div>

                      {replyingTo === item.id && (
                        <form onSubmit={(event) => handleReply(event, item.id)} className="mt-3 flex gap-2">
                          <input value={replyContent} onChange={(event) => setReplyContent(event.target.value)} placeholder="Nhập phản hồi..." className="flex-1 rounded-3xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                          <Button type="submit" size="sm">Gửi</Button>
                        </form>
                      )}

                      {item.replies?.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-slate-200 pl-4 dark:border-slate-800">
                          {item.replies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                              <div className="flex items-start gap-3">
                                <UserAvatarLink user={reply} />
                                <div className="min-w-0 flex-1">
                                  <Link to={`/users/${reply.user_id}`} className="text-sm font-black text-slate-950 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">{reply.full_name}</Link>
                                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{reply.content}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                                    <button onClick={() => handleReplyReaction(item.id, reply.id, 'like')} className={`inline-flex items-center gap-1 rounded-2xl px-2 py-1 ${reply.my_reaction === 'like' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                      <ThumbsUp className="h-4 w-4" /> {reply.like_count || 0}
                                    </button>
                                    <button onClick={() => handleReplyReaction(item.id, reply.id, 'dislike')} className={`inline-flex items-center gap-1 rounded-2xl px-2 py-1 ${reply.my_reaction === 'dislike' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                      <ThumbsDown className="h-4 w-4" /> {reply.dislike_count || 0}
                                    </button>
                                    {(user?.role === 'admin' || item.user_id === user?.id) && (
                                      <button onClick={() => {
                                        setReplyingTo(item.id);
                                        setReplyContent(`@${reply.full_name} `);
                                      }} className="inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                                        <MessageSquareReply className="h-4 w-4" /> Phản hồi
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-500 dark:text-slate-400">Chưa có bình luận.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
