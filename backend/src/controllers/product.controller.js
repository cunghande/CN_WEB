import Product from '../models/Product.model.js';
import { sendResponse } from '../utils/helpers.js';

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
    if (!name || !base_price) return sendResponse(res, 400, false, 'Tên và giá sản phẩm là bắt buộc');

    const productId = await Product.create({
      category_id,
      name,
      description,
      base_price,
      image_url,
      variants: parseJsonArray(variants),
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

    await Product.update(req.params.id, {
      category_id: category_id || existingProduct.category_id,
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      base_price: base_price || existingProduct.base_price,
      image_url: image_url || existingProduct.image_url,
      variants: variants !== undefined ? parseJsonArray(variants) : undefined,
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
    if (!content || !content.trim()) return sendResponse(res, 400, false, 'Vui lòng nhập bình luận');
    const id = await Product.addComment(req.params.id, req.user.id, content.trim());
    return sendResponse(res, 201, true, 'Đã gửi bình luận', { id });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, content } = req.body;
    const safeRating = Number(rating);
    if (safeRating < 1 || safeRating > 5) return sendResponse(res, 400, false, 'Rating phải từ 1 đến 5');
    await Product.addReview(req.params.id, req.user.id, safeRating, content || '');
    return sendResponse(res, 201, true, 'Đã gửi đánh giá');
  } catch (error) {
    next(error);
  }
};
