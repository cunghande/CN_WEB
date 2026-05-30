import db from '../config/db.js';
import Notification from './Notification.model.js';

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
    product.comments = await this.getComments(id, currentUserId);
    product.reviews = await this.getReviews(id);
    product.can_review = currentUserId ? await this.hasDeliveredPurchase(id, currentUserId) : false;
    return product;
  }

  static async hasDeliveredPurchase(productId, userId) {
    const [rows] = await db.execute(`
      SELECT 1
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN product_variants pv ON pv.id = oi.variant_id
      WHERE o.user_id = ?
        AND o.status = 'delivered'
        AND pv.product_id = ?
      LIMIT 1
    `, [userId, productId]);
    return rows.length > 0;
  }

  static async getComments(productId, currentUserId = null) {
    const [rows] = await db.execute(`
      SELECT pc.*, u.full_name, u.avatar_url, pr.rating AS user_rating, pr.image_url AS review_image_url
      FROM product_comments pc
      JOIN users u ON pc.user_id = u.id
      LEFT JOIN product_reviews pr ON pr.product_id = pc.product_id AND pr.user_id = pc.user_id
      WHERE pc.product_id = ?
      ORDER BY pc.id DESC
    `, [productId]);

    if (rows.length === 0) return [];

    const commentIds = rows.map((item) => item.id);
    const placeholders = commentIds.map(() => '?').join(',');
    const [reactionCounts] = await db.execute(`
      SELECT comment_id,
        SUM(reaction = 'like') AS like_count,
        SUM(reaction = 'dislike') AS dislike_count
      FROM product_comment_reactions
      WHERE comment_id IN (${placeholders})
      GROUP BY comment_id
    `, commentIds);

    const [myReactions] = currentUserId
      ? await db.execute(`
        SELECT comment_id, reaction
        FROM product_comment_reactions
        WHERE user_id = ? AND comment_id IN (${placeholders})
      `, [currentUserId, ...commentIds])
      : [[]];

    const [replies] = await db.execute(`
      SELECT pcr.*, u.full_name, u.avatar_url
      FROM product_comment_replies pcr
      JOIN users u ON pcr.user_id = u.id
      WHERE pcr.comment_id IN (${placeholders})
      ORDER BY pcr.id ASC
    `, commentIds);

    const replyIds = replies.map((reply) => reply.id);
    let replyReactionCounts = [];
    let myReplyReactions = [];
    if (replyIds.length > 0) {
      const replyPlaceholders = replyIds.map(() => '?').join(',');
      const [replyCounts] = await db.execute(`
        SELECT reply_id,
          SUM(reaction = 'like') AS like_count,
          SUM(reaction = 'dislike') AS dislike_count
        FROM product_comment_reply_reactions
        WHERE reply_id IN (${replyPlaceholders})
        GROUP BY reply_id
      `, replyIds);
      replyReactionCounts = replyCounts;

      if (currentUserId) {
        const [myRows] = await db.execute(`
          SELECT reply_id, reaction
          FROM product_comment_reply_reactions
          WHERE user_id = ? AND reply_id IN (${replyPlaceholders})
        `, [currentUserId, ...replyIds]);
        myReplyReactions = myRows;
      }
    }

    return rows.map((comment) => {
      const counts = reactionCounts.find((item) => item.comment_id === comment.id);
      const myReaction = myReactions.find((item) => item.comment_id === comment.id);
      return {
        ...comment,
        like_count: Number(counts?.like_count || 0),
        dislike_count: Number(counts?.dislike_count || 0),
        my_reaction: myReaction?.reaction || null,
        replies: replies
          .filter((reply) => reply.comment_id === comment.id)
          .map((reply) => {
            const counts = replyReactionCounts.find((item) => item.reply_id === reply.id);
            const myReaction = myReplyReactions.find((item) => item.reply_id === reply.id);
            return {
              ...reply,
              like_count: Number(counts?.like_count || 0),
              dislike_count: Number(counts?.dislike_count || 0),
              my_reaction: myReaction?.reaction || null
            };
          })
      };
    });
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
      : [{ size: 'FreeSize', color: 'Mặc định', image_url: '', stock_quantity: 100 }];

    for (const variant of safeVariants) {
      await connection.execute(
        'INSERT INTO product_variants (product_id, size, color, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?)',
        [
          productId,
          variant.size || 'FreeSize',
          variant.color || 'Mặc định',
          variant.image_url || '',
          Number(variant.stock_quantity) || 0
        ]
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
    const canReview = await this.hasDeliveredPurchase(productId, userId);
    if (!canReview) return null;

    const [result] = await db.execute(
      'INSERT INTO product_comments (product_id, user_id, content) VALUES (?, ?, ?)',
      [productId, userId, content]
    );

    const [users] = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
    const [products] = await db.execute('SELECT name FROM products WHERE id = ?', [productId]);
    await Notification.createForAdmins({
      actor_user_id: userId,
      title: 'Có bình luận sản phẩm mới',
      message: `${users[0]?.full_name || 'Khách hàng'} đã bình luận về ${products[0]?.name || 'sản phẩm'}.`,
      type: 'product_comment',
      target_url: `/products/${productId}#comment-${result.insertId}`,
      entity_type: 'product_comment',
      entity_id: result.insertId
    });

    return result.insertId;
  }

  static async setCommentReaction(productId, commentId, userId, reaction) {
    const [comments] = await db.execute(
      `SELECT pc.*, u.full_name AS owner_name
       FROM product_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.id = ? AND pc.product_id = ?`,
      [commentId, productId]
    );
    const comment = comments[0];
    if (!comment) return null;

    const [actorRows] = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
    const [existing] = await db.execute(
      'SELECT reaction FROM product_comment_reactions WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (existing[0]?.reaction === reaction) {
      await db.execute('DELETE FROM product_comment_reactions WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
      return { reaction: null };
    }

    await db.execute(
      `INSERT INTO product_comment_reactions (comment_id, user_id, reaction)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE reaction = VALUES(reaction), updated_at = CURRENT_TIMESTAMP`,
      [commentId, userId, reaction]
    );

    if (comment.user_id !== userId) {
      await Notification.create({
        user_id: comment.user_id,
        actor_user_id: userId,
        title: reaction === 'like' ? 'Bình luận của bạn có lượt thích' : 'Bình luận của bạn có lượt không thích',
        message: `${actorRows[0]?.full_name || 'Một người dùng'} đã ${reaction === 'like' ? 'thích' : 'không thích'} bình luận của bạn.`,
        type: 'comment_reaction',
        target_url: `/products/${productId}#comment-${commentId}`,
        entity_type: 'product_comment',
        entity_id: commentId
      });
    }

    return { reaction };
  }

  static async deleteCommentReaction(productId, commentId, userId) {
    await db.execute(
      `DELETE pcr FROM product_comment_reactions pcr
       JOIN product_comments pc ON pcr.comment_id = pc.id
       WHERE pcr.comment_id = ? AND pc.product_id = ? AND pcr.user_id = ?`,
      [commentId, productId, userId]
    );
    return true;
  }

  static async addCommentReply(productId, commentId, userId, content) {
    const [comments] = await db.execute('SELECT * FROM product_comments WHERE id = ? AND product_id = ?', [commentId, productId]);
    const comment = comments[0];
    if (!comment) return null;

    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
    const isAdmin = users[0]?.role === 'admin';
    const isCommentOwner = comment.user_id === userId;
    if (!isAdmin && !isCommentOwner) return 'FORBIDDEN';

    const [result] = await db.execute(
      'INSERT INTO product_comment_replies (comment_id, product_id, user_id, content) VALUES (?, ?, ?, ?)',
      [commentId, productId, userId, content]
    );

    const [actorRows] = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
    const actorName = actorRows[0]?.full_name || 'Một người dùng';
    const targetUrl = `/products/${productId}#comment-${commentId}`;

    if (comment.user_id !== userId) {
      await Notification.create({
        user_id: comment.user_id,
        actor_user_id: userId,
        title: 'Có phản hồi bình luận mới',
        message: `${actorName} đã phản hồi bình luận của bạn.`,
        type: 'comment_reply',
        target_url: targetUrl,
        entity_type: 'product_comment_reply',
        entity_id: result.insertId
      });
    }

    await Notification.createForAdmins({
      actor_user_id: userId,
      title: 'Có phản hồi bình luận sản phẩm',
      message: `${actorName} đã phản hồi một bình luận sản phẩm.`,
      type: 'comment_reply',
      target_url: targetUrl,
      entity_type: 'product_comment_reply',
      entity_id: result.insertId
    });

    return result.insertId;
  }

  static async addReview(productId, userId, rating, content = '', imageUrl = '') {
    const canReview = await this.hasDeliveredPurchase(productId, userId);
    if (!canReview) return null;

    if (imageUrl) {
      await db.execute(
        `INSERT INTO product_reviews (product_id, user_id, rating, content, image_url)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), content = VALUES(content), image_url = VALUES(image_url), created_at = CURRENT_TIMESTAMP`,
        [productId, userId, rating, content, imageUrl]
      );
    } else {
      await db.execute(
        `INSERT INTO product_reviews (product_id, user_id, rating, content)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), content = VALUES(content), created_at = CURRENT_TIMESTAMP`,
        [productId, userId, rating, content]
      );
    }
    return true;
  }

  static async setReplyReaction(productId, commentId, replyId, userId, reaction) {
    const [replies] = await db.execute(
      `SELECT pcr.*, pc.user_id AS comment_owner_id
       FROM product_comment_replies pcr
       JOIN product_comments pc ON pc.id = pcr.comment_id
       WHERE pcr.id = ? AND pcr.comment_id = ? AND pcr.product_id = ?`,
      [replyId, commentId, productId]
    );
    const reply = replies[0];
    if (!reply) return null;

    const [existing] = await db.execute(
      'SELECT reaction FROM product_comment_reply_reactions WHERE reply_id = ? AND user_id = ?',
      [replyId, userId]
    );

    if (existing[0]?.reaction === reaction) {
      await db.execute('DELETE FROM product_comment_reply_reactions WHERE reply_id = ? AND user_id = ?', [replyId, userId]);
      return { reaction: null };
    }

    await db.execute(
      `INSERT INTO product_comment_reply_reactions (reply_id, user_id, reaction)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE reaction = VALUES(reaction), updated_at = CURRENT_TIMESTAMP`,
      [replyId, userId, reaction]
    );

    if (reply.user_id !== userId) {
      const [actorRows] = await db.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
      await Notification.create({
        user_id: reply.user_id,
        actor_user_id: userId,
        title: reaction === 'like' ? 'Phản hồi của bạn có lượt thích' : 'Phản hồi của bạn có lượt không thích',
        message: `${actorRows[0]?.full_name || 'Một người dùng'} đã ${reaction === 'like' ? 'thích' : 'không thích'} phản hồi của bạn.`,
        type: 'reply_reaction',
        target_url: `/products/${productId}#comment-${commentId}`,
        entity_type: 'product_comment_reply',
        entity_id: replyId
      });
    }

    return { reaction };
  }
}

export default Product;
