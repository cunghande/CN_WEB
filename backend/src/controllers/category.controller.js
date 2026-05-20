import Category from '../models/Category.model.js';
import { sendResponse } from '../utils/helpers.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    return sendResponse(res, 200, true, 'Lấy danh sách danh mục thành công', categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return sendResponse(res, 400, false, 'Tên danh mục là bắt buộc');
    }

    const categoryId = await Category.create({ name, description });
    return sendResponse(res, 201, true, 'Thêm danh mục thành công', { id: categoryId });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);

    if (!existing) {
      return sendResponse(res, 404, false, 'Không tìm thấy danh mục');
    }

    await Category.update(req.params.id, req.body);
    return sendResponse(res, 200, true, 'Cập nhật danh mục thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const existing = await Category.findById(req.params.id);

    if (!existing) {
      return sendResponse(res, 404, false, 'Không tìm thấy danh mục');
    }

    await Category.delete(req.params.id);
    return sendResponse(res, 200, true, 'Xóa danh mục thành công');
  } catch (error) {
    next(error);
  }
};
