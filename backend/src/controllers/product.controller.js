import Product from '../models/Product.model.js';
import { sendResponse } from '../utils/helpers.js';
import { isPositiveNumber, normalizeText } from '../utils/validators.js';

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const validateProductPayload = ({ name, base_price, variants = [] }) => {
  if (!normalizeText(name)) return 'Tên sản phẩm là bắt buộc.';
  if (normalizeText(name).length < 2 || normalizeText(name).length > 120) return 'Tên sản phẩm phải từ 2-120 ký tự.';
  if (!isPositiveNumber(base_price)) return 'Giá sản phẩm phải là số dương.';
  for (const variant of variants) {
    if (!normalizeText(variant.size)) return 'Mỗi biến thể cần có size.';
    if (!normalizeText(variant.color)) return 'Mỗi biến thể cần có màu.';
    if (!Number.isInteger(Number(variant.stock_quantity)) || Number(variant.stock_quantity) < 0) {
      return 'Tồn kho biến thể phải là số nguyên không âm.';
    }
  }
  return '';
};

export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const products = await Product.findAll(category, req.user?.id || null);
    return sendResponse(res, 200, true, 'Lấy danh sách sản phẩm thành công', products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id, req.user?.id || null);
    if (!product) return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');
    return sendResponse(res, 200, true, 'Lấy chi tiết sản phẩm thành công', product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, base_price, variants, tags } = req.body;
    let image_url = req.body.image_url || '';
    if (req.file) image_url = `/uploads/${req.file.filename}`;
    const parsedVariants = parseJsonArray(variants);
    const validationError = validateProductPayload({ name, base_price, variants: parsedVariants });
    if (validationError) return sendResponse(res, 400, false, validationError);

    const productId = await Product.create({
      category_id,
      name,
      description,
      base_price,
      image_url,
      variants: parsedVariants,
      tags: parseJsonArray(tags)
    });

    return sendResponse(res, 201, true, 'Thêm sản phẩm thành công', { id: productId });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, base_price, variants, tags } = req.body;
    let image_url = req.body.image_url;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');

    const parsedVariants = variants !== undefined ? parseJsonArray(variants) : undefined;
    const validationError = validateProductPayload({
      name: name ? normalizeText(name) : existingProduct.name,
      base_price: base_price || existingProduct.base_price,
      variants: parsedVariants || existingProduct.variants || []
    });
    if (validationError) return sendResponse(res, 400, false, validationError);

    await Product.update(req.params.id, {
      category_id: category_id || existingProduct.category_id,
      name: name ? normalizeText(name) : existingProduct.name,
      description: description !== undefined ? normalizeText(description) : existingProduct.description,
      base_price: base_price || existingProduct.base_price,
      image_url: image_url || existingProduct.image_url,
      variants: parsedVariants,
      tags: tags !== undefined ? parseJsonArray(tags) : undefined
    });

    return sendResponse(res, 200, true, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');
    await Product.delete(req.params.id);
    return sendResponse(res, 200, true, 'Xóa sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const liked = await Product.toggleLike(req.params.id, req.user.id);
    return sendResponse(res, 200, true, liked ? 'Đã thích sản phẩm' : 'Đã bỏ thích sản phẩm', { liked });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const cleanContent = normalizeText(content);
    if (cleanContent.length < 2 || cleanContent.length > 1000) return sendResponse(res, 400, false, 'Bình luận phải từ 2-1000 ký tự.');
    const id = await Product.addComment(req.params.id, req.user.id, cleanContent);
    if (!id) return sendResponse(res, 403, false, 'Bạn cần mua và nhận sản phẩm trước khi bình luận');
    return sendResponse(res, 201, true, 'Đã gửi bình luận', { id });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const cleanContent = normalizeText(content);
    if (cleanContent.length < 2 || cleanContent.length > 1000) return sendResponse(res, 400, false, 'Bình luận phải từ 2-1000 ký tự.');

    const result = await Product.updateComment(req.params.productId, req.params.commentId, req.user.id, cleanContent);
    if (result === 'FORBIDDEN') return sendResponse(res, 403, false, 'Bạn chỉ được chỉnh sửa bình luận của chính mình');
    if (!result) return sendResponse(res, 404, false, 'Không tìm thấy bình luận');

    return sendResponse(res, 200, true, 'Đã cập nhật bình luận');
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const result = await Product.deleteComment(req.params.productId, req.params.commentId, req.user.id);
    if (result === 'FORBIDDEN') return sendResponse(res, 403, false, 'Bạn chỉ được xóa bình luận của chính mình');
    if (!result) return sendResponse(res, 404, false, 'Không tìm thấy bình luận');

    return sendResponse(res, 200, true, 'Đã xóa bình luận');
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const safeRating = Number(rating);
    const cleanContent = normalizeText(content);
    if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) return sendResponse(res, 400, false, 'Rating phải là số nguyên từ 1 đến 5.');
    if (cleanContent && (cleanContent.length < 2 || cleanContent.length > 1000)) return sendResponse(res, 400, false, 'Nội dung đánh giá phải từ 2-1000 ký tự.');
    const ok = await Product.addReview(req.params.id, req.user.id, safeRating, cleanContent, imageUrl);
    if (!ok) return sendResponse(res, 403, false, 'Bạn cần mua và nhận sản phẩm trước khi đánh giá');
    return sendResponse(res, 201, true, 'Đã gửi đánh giá');
  } catch (error) {
    next(error);
  }
};

export const setCommentReaction = async (req, res, next) => {
  try {
    const { reaction } = req.body;
    if (!['like', 'dislike'].includes(reaction)) {
      return sendResponse(res, 400, false, 'Reaction không hợp lệ');
    }

    const result = await Product.setCommentReaction(req.params.productId, req.params.commentId, req.user.id, reaction);
    if (!result) return sendResponse(res, 404, false, 'Không tìm thấy bình luận');
    return sendResponse(res, 200, true, 'Đã cập nhật cảm xúc bình luận', result);
  } catch (error) {
    next(error);
  }
};

export const deleteCommentReaction = async (req, res, next) => {
  try {
    await Product.deleteCommentReaction(req.params.productId, req.params.commentId, req.user.id);
    return sendResponse(res, 200, true, 'Đã bỏ cảm xúc bình luận');
  } catch (error) {
    next(error);
  }
};

export const addCommentReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const cleanContent = normalizeText(content);
    if (cleanContent.length < 2 || cleanContent.length > 1000) return sendResponse(res, 400, false, 'Phản hồi phải từ 2-1000 ký tự.');
    const id = await Product.addCommentReply(req.params.productId, req.params.commentId, req.user.id, cleanContent);
    if (id === 'FORBIDDEN') return sendResponse(res, 403, false, 'Bạn chỉ được phản hồi bình luận của chính mình, hoặc cần quyền admin');
    if (!id) return sendResponse(res, 404, false, 'Không tìm thấy bình luận');
    return sendResponse(res, 201, true, 'Đã gửi phản hồi', { id });
  } catch (error) {
    next(error);
  }
};

export const setReplyReaction = async (req, res, next) => {
  try {
    const { reaction } = req.body;
    if (!['like', 'dislike'].includes(reaction)) {
      return sendResponse(res, 400, false, 'Reaction không hợp lệ');
    }

    const result = await Product.setReplyReaction(req.params.productId, req.params.commentId, req.params.replyId, req.user.id, reaction);
    if (!result) return sendResponse(res, 404, false, 'Không tìm thấy phản hồi');
    return sendResponse(res, 200, true, 'Đã cập nhật cảm xúc phản hồi', result);
  } catch (error) {
    next(error);
  }
};

