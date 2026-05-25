import db from '../config/db.js';

const enrichProducts = async (products, currentUserId = null) => {
  const [variants] = await db.execute('SELECT * FROM product_variants ORDER BY product_id ASC, id ASC');
  const [tags] = await db.execute(`
    SELECT ptm.product_id, t.id, t.name, t.slug
    FROM product_tag_map ptm
    JOIN product_tags t ON ptm.tag_id = t.id
  `);
  const [ratings] = await db.execute(`
    SELECT product_id, ROUND(AVG(rating), 1) as average_rating, COUNT(*) as rating_count
    FROM product_reviews
    GROUP BY product_id
  `);
  const [likes] = await db.execute('SELECT product_id, COUNT(*) as like_count FROM product_likes GROUP BY product_id');
  const [myLikes] = currentUserId
    ? await db.execute('SELECT product_id FROM product_likes WHERE user_id = ?', [currentUserId])
    : [[]];

  return products.map((product) => {
    const rating = ratings.find((item) => item.product_id === product.id);
    const like = likes.find((item) => item.product_id === product.id);

    return {
      ...product,
      variants: variants.filter((variant) => variant.product_id === product.id),
      tags: tags.filter((tag) => tag.product_id === product.id),
      average_rating: rating?.average_rating || 0,
      rating_count: rating?.rating_count || 0,
      like_count: like?.like_count || 0,
      liked: myLikes.some((item) => item.product_id === product.id)
    };
  });
};

class Product {
  static async findAll(categoryId = null, currentUserId = null) {
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
    return enrichProducts(products, currentUserId);
  }

  static async findById(id, currentUserId = null) {
    const [products] = await db.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (!products[0]) return null;

    const [product] = await enrichProducts(products, currentUserId);
    product.comments = await this.getComments(id);
    product.reviews = await this.getReviews(id);
    return product;
  }

  static async getComments(productId) {
    const [rows] = await db.execute(`
      SELECT pc.*, u.full_name, u.avatar_url
      FROM product_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.product_id = ?
      ORDER BY pc.id DESC
    `, [productId]);
    return rows;
  }

  static async getReviews(productId) {
    const [rows] = await db.execute(`
      SELECT pr.*, u.full_name, u.avatar_url
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ?
      ORDER BY pr.id DESC
    `, [productId]);
    return rows;
  }

  static async create(productData) {
    const { category_id, name, description, base_price, image_url, variants = [], tags = [] } = productData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO products (category_id, name, description, base_price, image_url) VALUES (?, ?, ?, ?, ?)',
        [category_id || null, name, description || '', base_price, image_url || '']
      );
      const productId = result.insertId;
      await this.replaceVariants(connection, productId, variants);
      await this.replaceTags(connection, productId, tags);

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
    const { category_id, name, description, base_price, image_url, variants, tags } = productData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        'UPDATE products SET category_id = ?, name = ?, description = ?, base_price = ?, image_url = ? WHERE id = ?',
        [category_id || null, name, description || '', base_price, image_url || '', id]
      );

      if (Array.isArray(variants)) await this.replaceVariants(connection, id, variants);
      if (Array.isArray(tags)) await this.replaceTags(connection, id, tags);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async replaceVariants(connection, productId, variants) {
    await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
    const safeVariants = variants.length > 0
      ? variants
      : [{ size: 'FreeSize', color: 'Mặc định', stock_quantity: 100 }];

    for (const variant of safeVariants) {
      await connection.execute(
        'INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES (?, ?, ?, ?)',
        [productId, variant.size || 'FreeSize', variant.color || 'Mặc định', Number(variant.stock_quantity) || 0]
      );
    }
  }

  static async replaceTags(connection, productId, tags = []) {
    await connection.execute('DELETE FROM product_tag_map WHERE product_id = ?', [productId]);
    for (const rawTag of tags) {
      const name = String(rawTag).trim().replace(/^#/, '');
      if (!name) continue;
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await connection.execute('INSERT IGNORE INTO product_tags (name, slug) VALUES (?, ?)', [name, slug]);
      const [tagRows] = await connection.execute('SELECT id FROM product_tags WHERE slug = ?', [slug]);
      if (tagRows[0]) {
        await connection.execute('INSERT IGNORE INTO product_tag_map (product_id, tag_id) VALUES (?, ?)', [productId, tagRows[0].id]);
      }
    }
  }

  static async delete(id) {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }

  static async toggleLike(productId, userId) {
    const [rows] = await db.execute('SELECT 1 FROM product_likes WHERE product_id = ? AND user_id = ?', [productId, userId]);
    if (rows.length) {
      await db.execute('DELETE FROM product_likes WHERE product_id = ? AND user_id = ?', [productId, userId]);
      return false;
    }

    await db.execute('INSERT INTO product_likes (product_id, user_id) VALUES (?, ?)', [productId, userId]);
    return true;
  }

  static async addComment(productId, userId, content) {
    const [result] = await db.execute(
      'INSERT INTO product_comments (product_id, user_id, content) VALUES (?, ?, ?)',
      [productId, userId, content]
    );
    return result.insertId;
  }

  static async addReview(productId, userId, rating, content = '') {
    await db.execute(
      `INSERT INTO product_reviews (product_id, user_id, rating, content)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), content = VALUES(content), created_at = CURRENT_TIMESTAMP`,
      [productId, userId, rating, content]
    );
    return true;
  }
}

export default Product;
