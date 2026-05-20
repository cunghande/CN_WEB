import Product from '../models/Product.model.js';
import { sendResponse } from '../utils/helpers.js';

const parseVariants = (variants) => {
  if (!variants) return [];
  if (Array.isArray(variants)) return variants;

  try {
    const parsed = JSON.parse(variants);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const products = await Product.findAll(category);
    return sendResponse(res, 200, true, 'Lấy danh sách sản phẩm thành công', products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');
    }

    return sendResponse(res, 200, true, 'Lấy chi tiết sản phẩm thành công', product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, base_price, variants } = req.body;
    let image_url = req.body.image_url || '';

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    if (!name || !base_price) {
      return sendResponse(res, 400, false, 'Tên và giá sản phẩm là bắt buộc');
    }

    const productId = await Product.create({
      category_id,
      name,
      description,
      base_price,
      image_url,
      variants: parseVariants(variants)
    });

    return sendResponse(res, 201, true, 'Thêm sản phẩm thành công', { id: productId });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, base_price, variants } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');
    }

    await Product.update(req.params.id, {
      category_id: category_id || existingProduct.category_id,
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      base_price: base_price || existingProduct.base_price,
      image_url: image_url || existingProduct.image_url,
      variants: variants !== undefined ? parseVariants(variants) : undefined
    });

    return sendResponse(res, 200, true, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, false, 'Không tìm thấy sản phẩm');
    }

    await Product.delete(req.params.id);
    return sendResponse(res, 200, true, 'Xóa sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};
