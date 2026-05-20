import db from '../config/db.js';

class Product {
  static async findAll(categoryId = null) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      query += ' WHERE p.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY p.id DESC';

    const [products] = await db.execute(query, params);
    const [variants] = await db.execute('SELECT * FROM product_variants ORDER BY product_id ASC, id ASC');

    return products.map((product) => ({
      ...product,
      variants: variants.filter((variant) => variant.product_id === product.id)
    }));
  }

  static async findById(id) {
    const [products] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (!products[0]) return null;

    const product = products[0];
    const [variants] = await db.execute(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY id ASC',
      [id]
    );

    product.variants = variants;
    return product;
  }

  static async create(productData) {
    const { category_id, name, description, base_price, image_url, variants = [] } = productData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO products (category_id, name, description, base_price, image_url) VALUES (?, ?, ?, ?, ?)',
        [category_id || null, name, description || '', base_price, image_url || '']
      );
      const productId = result.insertId;

      const safeVariants = variants.length > 0
        ? variants
        : [{ size: 'FreeSize', color: 'Mặc định', stock_quantity: 100 }];

      for (const variant of safeVariants) {
        await connection.execute(
          'INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES (?, ?, ?, ?)',
          [
            productId,
            variant.size || 'FreeSize',
            variant.color || 'Mặc định',
            Number(variant.stock_quantity) || 0
          ]
        );
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, productData) {
    const { category_id, name, description, base_price, image_url, variants } = productData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, image_url = ? WHERE id = ?',
        [category_id || null, name, description || '', base_price, image_url || '', id]
      );

      // Khi admin sửa sản phẩm, danh sách biến thể được ghi lại toàn bộ để tránh lệch tồn kho cũ.
      if (Array.isArray(variants)) {
        await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);

        const safeVariants = variants.length > 0
          ? variants
          : [{ size: 'FreeSize', color: 'Mặc định', stock_quantity: 0 }];

        for (const variant of safeVariants) {
          await connection.execute(
            'INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES (?, ?, ?, ?)',
            [
              id,
              variant.size || 'FreeSize',
              variant.color || 'Mặc định',
              Number(variant.stock_quantity) || 0
            ]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
}

export default Product;
