import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

const requestedCountArg = process.argv.find((arg) => arg.startsWith('--count='));
const requestedCount = Number(requestedCountArg?.split('=')[1] || 1200);
const PRODUCT_COUNT = Number.isFinite(requestedCount) && requestedCount >= 100 ? requestedCount : 1200;

const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;
const databaseName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'shop_quan_ao';

const connectionConfig = connectionUrl
  ? { uri: connectionUrl, multipleStatements: true }
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASS || process.env.MYSQLPASSWORD || '',
      database: databaseName,
      multipleStatements: true
    };

const categories = [
  { id: 1, name: 'Áo thun nam', description: 'Áo thun basic, oversize và graphic tee cho nam' },
  { id: 2, name: 'Áo thun nữ', description: 'Áo thun nữ, croptop và áo kiểu dễ phối' },
  { id: 3, name: 'Quần jean nam', description: 'Quần jean slim, straight và relaxed fit' },
  { id: 4, name: 'Quần short', description: 'Quần short kaki, jean và thun cho mùa hè' },
  { id: 5, name: 'Áo khoác', description: 'Áo khoác bomber, denim, blazer và chống nắng' },
  { id: 6, name: 'Váy công sở', description: 'Váy, đầm và chân váy thanh lịch' },
  { id: 7, name: 'Đồ tập gym', description: 'Trang phục thể thao co giãn, thoáng khí' },
  { id: 8, name: 'Phụ kiện', description: 'Túi, nón, thắt lưng, ví và phụ kiện thời trang' },
  { id: 9, name: 'Giày sneaker', description: 'Sneaker lifestyle, chạy bộ và phối đồ hằng ngày' },
  { id: 10, name: 'Đồ ngủ', description: 'Đồ mặc nhà, pyjama và set thoải mái' },
  { id: 11, name: 'Sơ mi trắng', description: 'Sơ mi trắng công sở và casual' },
  { id: 12, name: 'Sơ mi họa tiết', description: 'Sơ mi họa tiết nổi bật cho đi chơi' },
  { id: 13, name: 'Áo len', description: 'Áo len cổ lọ, cardigan và sweater' },
  { id: 14, name: 'Quần tây', description: 'Quần tây nam nữ thanh lịch' },
  { id: 15, name: 'Áo hoodie', description: 'Hoodie, sweater và áo nỉ đường phố' }
];

const imagePools = {
  1: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80'],
  2: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80'],
  3: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'],
  4: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=700&q=80'],
  5: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80'],
  6: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80'],
  7: ['https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=700&q=80'],
  8: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=700&q=80'],
  9: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80'],
  10: ['https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=700&q=80'],
  11: ['https://images.unsplash.com/photo-1596755094514-f87e32f1b7fc?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80'],
  12: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=700&q=80'],
  13: ['https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=700&q=80'],
  14: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80'],
  15: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80']
};

const productBlueprints = [
  { categoryId: 1, names: ['Cotton Essential', 'Oversize Urban', 'Graphic Weekend', 'Polo Pique', 'Relaxed Tee'], price: [169000, 349000], tags: ['nam', 'áo thun', 'basic', 'casual'] },
  { categoryId: 2, names: ['Ribbed Slim', 'Croptop Basic', 'Blouse Casual', 'Baby Tee', 'Fitted Top'], price: [159000, 369000], tags: ['nữ', 'áo thun', 'croptop', 'daily'] },
  { categoryId: 3, names: ['Slim Indigo', 'Straight Wash', 'Black Denim', 'Relaxed Fit', 'Vintage Blue'], price: [399000, 699000], tags: ['nam', 'quần jean', 'denim'] },
  { categoryId: 4, names: ['Kaki Summer', 'Jean Short', 'Linen Beach', 'Sport Active', 'Cargo Short'], price: [179000, 399000], tags: ['short', 'mùa hè', 'du lịch'] },
  { categoryId: 5, names: ['Bomber City', 'Denim Jacket', 'Blazer Minimal', 'Windbreaker', 'Utility Jacket'], price: [429000, 899000], tags: ['áo khoác', 'outerwear', 'đi Đà Lạt'] },
  { categoryId: 6, names: ['Chữ A Office', 'Midi Floral', 'Pleated Skirt', 'Minimal Dress', 'Elegant Workwear'], price: [329000, 699000], tags: ['váy', 'đầm', 'công sở', 'nữ'] },
  { categoryId: 7, names: ['DryFit Training', 'Legging Sculpt', 'Sport Bra', 'Jogger Active', 'Yoga Set'], price: [199000, 599000], tags: ['gym', 'thể thao', 'co giãn'] },
  { categoryId: 8, names: ['Tote Canvas', 'Cap Basic', 'Leather Belt', 'Mini Wallet', 'Crossbody Bag'], price: [99000, 399000], tags: ['phụ kiện', 'túi', 'nón'] },
  { categoryId: 9, names: ['Classic Sneaker', 'Active Runner', 'Canvas Low', 'Chunky Street', 'Daily Trainer'], price: [399000, 999000], tags: ['giày', 'sneaker', 'streetwear'] },
  { categoryId: 10, names: ['Satin Pajama', 'Cotton Home Set', 'Lounge Unisex', 'Sleep Dress', 'Soft Nightwear'], price: [249000, 549000], tags: ['đồ ngủ', 'mặc nhà', 'thoải mái'] },
  { categoryId: 11, names: ['Oxford White', 'Silk White', 'Mandarin Collar', 'Oversize White', 'Office White'], price: [299000, 549000], tags: ['sơ mi trắng', 'công sở'] },
  { categoryId: 12, names: ['Tropical Print', 'Casual Check', 'Floral Shirt', 'Blue Stripe', 'Vacation Pattern'], price: [299000, 499000], tags: ['sơ mi', 'họa tiết', 'du lịch'] },
  { categoryId: 13, names: ['Turtleneck Knit', 'Basic Cardigan', 'Minimal Sweater', 'Knit Vest', 'Soft Pullover'], price: [349000, 699000], tags: ['áo len', 'cardigan', 'giữ ấm'] },
  { categoryId: 14, names: ['Slim Trouser', 'Wide Leg Office', 'Culottes', 'Cropped Trouser', 'Formal Pants'], price: [359000, 649000], tags: ['quần tây', 'công sở', 'thanh lịch'] },
  { categoryId: 15, names: ['Oversize Hoodie', 'Zip Hoodie', 'Crewneck Basic', 'Graphic Hoodie', 'Street Sweatshirt'], price: [359000, 699000], tags: ['hoodie', 'áo nỉ', 'streetwear'] }
];

const colors = ['Đen', 'Trắng', 'Xanh navy', 'Be', 'Xám', 'Nâu', 'Hồng pastel', 'Xanh rêu'];
const clothingSizes = ['S', 'M', 'L', 'XL'];
const shoeSizes = ['39', '40', '41', '42'];
const accessorySizes = ['FreeSize'];
const seasons = ['Xuân', 'Hè', 'Thu', 'Đông'];
const fits = ['Regular', 'Slim', 'Oversize', 'Relaxed'];

const toSlug = (value) => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const pick = (items, index) => items[index % items.length];
const priceFor = ([min, max], index) => Math.round((min + ((index * 37000) % (max - min))) / 1000) * 1000;

const buildProduct = (index) => {
  const blueprint = productBlueprints[index % productBlueprints.length];
  const category = categories.find((item) => item.id === blueprint.categoryId);
  const modelName = pick(blueprint.names, Math.floor(index / productBlueprints.length));
  const season = pick(seasons, index);
  const fit = pick(fits, index + blueprint.categoryId);
  const code = String(index + 1).padStart(4, '0');
  const name = `${category.name} ${modelName} ${fit} ${code}`;
  const basePrice = priceFor(blueprint.price, index);
  const imageUrl = `${pick(imagePools[blueprint.categoryId], index)}&sig=${index + 1}`;
  const description = `${name} thuộc nhóm ${category.name.toLowerCase()}, chất liệu dễ mặc, form ${fit.toLowerCase()}, phù hợp mùa ${season.toLowerCase()} và nhu cầu mua sắm hằng ngày.`;
  const tags = [...new Set([...blueprint.tags, season.toLowerCase(), fit.toLowerCase(), category.name.toLowerCase()])];

  return { categoryId: blueprint.categoryId, name, description, basePrice, imageUrl, tags };
};

const chunk = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
};

const insertRows = async (connection, sqlPrefix, rows, chunkSize = 500) => {
  for (const part of chunk(rows, chunkSize)) {
    const placeholders = part.map((row) => `(${row.map(() => '?').join(',')})`).join(',');
    await connection.execute(`${sqlPrefix} VALUES ${placeholders}`, part.flat());
  }
};

const connection = await mysql.createConnection(connectionConfig);

try {
  await connection.beginTransaction();
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE product_tag_map');
  await connection.query('TRUNCATE TABLE product_tags');
  await connection.query('TRUNCATE TABLE product_likes');
  await connection.query('TRUNCATE TABLE product_comment_reply_reactions');
  await connection.query('TRUNCATE TABLE product_comment_reactions');
  await connection.query('TRUNCATE TABLE product_comment_replies');
  await connection.query('TRUNCATE TABLE product_comments');
  await connection.query('TRUNCATE TABLE product_reviews');
  await connection.query('TRUNCATE TABLE order_items');
  await connection.query('TRUNCATE TABLE orders');
  await connection.query('TRUNCATE TABLE product_variants');
  await connection.query('TRUNCATE TABLE products');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  for (const category of categories) {
    await connection.execute(
      `INSERT INTO categories (id, name, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [category.id, category.name, category.description]
    );
  }

  const products = Array.from({ length: PRODUCT_COUNT }, (_, index) => buildProduct(index));
  await insertRows(
    connection,
    'INSERT INTO products (category_id, name, description, base_price, image_url)',
    products.map((product) => [product.categoryId, product.name, product.description, product.basePrice, product.imageUrl]),
    300
  );

  const [productRows] = await connection.execute('SELECT id, category_id FROM products ORDER BY id ASC');
  const variantRows = [];
  for (const [index, product] of productRows.entries()) {
    const sizePool = product.category_id === 8 ? accessorySizes : product.category_id === 9 ? shoeSizes : clothingSizes;
    for (let variantIndex = 0; variantIndex < 3; variantIndex += 1) {
      const color = pick(colors, index + variantIndex);
      variantRows.push([
        product.id,
        pick(sizePool, index + variantIndex),
        color,
        `${pick(imagePools[product.category_id], index + variantIndex)}&variant=${product.id}-${variantIndex}`,
        8 + ((index + 1) * (variantIndex + 3)) % 56
      ]);
    }
  }
  await insertRows(
    connection,
    'INSERT INTO product_variants (product_id, size, color, image_url, stock_quantity)',
    variantRows,
    600
  );

  const allTags = [...new Set(products.flatMap((product) => product.tags))].sort();
  await insertRows(
    connection,
    'INSERT INTO product_tags (name, slug)',
    allTags.map((tag) => [tag, toSlug(tag)]),
    300
  );

  const [tagRows] = await connection.execute('SELECT id, name FROM product_tags');
  const tagByName = new Map(tagRows.map((tag) => [tag.name, tag.id]));
  const tagMapRows = [];
  for (const [index, product] of products.entries()) {
    const productId = productRows[index].id;
    for (const tag of product.tags) tagMapRows.push([productId, tagByName.get(tag)]);
  }
  await insertRows(
    connection,
    'INSERT IGNORE INTO product_tag_map (product_id, tag_id)',
    tagMapRows.filter(([, tagId]) => tagId),
    800
  );

  await connection.commit();
  console.log(`Đã seed ${products.length} sản phẩm, ${variantRows.length} biến thể và ${allTags.length} tag.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
