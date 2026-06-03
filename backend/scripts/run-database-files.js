import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

const mode = process.argv[2];
const allowedModes = new Set(['migrate', 'seed', 'all']);

if (!allowedModes.has(mode)) {
  console.error('Cách dùng: npm run db:migrate | npm run db:seed | npm run db:setup');
  process.exit(1);
}

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

const migrationFiles = [
  '001_create_users.sql',
  '002_create_categories.sql',
  '003_create_products.sql',
  '004_create_product_variants.sql',
  '005_create_user_addresses.sql',
  '006_create_orders.sql',
  '007_create_order_items.sql',
  '008_create_notifications.sql',
  '009_create_product_likes.sql',
  '010_create_product_comments.sql',
  '011_create_product_comment_reactions.sql',
  '012_create_product_comment_replies.sql',
  '013_create_product_comment_reply_reactions.sql',
  '014_create_product_reviews.sql',
  '015_create_product_tags.sql',
  '016_create_product_tag_map.sql',
  '017_create_coupons.sql',
  '018_create_coupon_redemptions.sql',
  '019_create_user_coupons.sql',
  '020_add_user_admin_fields.sql'
];

const seederFiles = [
  'categories.sql',
  'products.sql',
  'users.sql',
  'coupons.sql',
  'social_demo.sql'
];

const normalizeSql = (sql) => {
  const targetDatabase = databaseName.replace(/`/g, '');
  return sql
    .replace(/USE\s+shop_quan_ao\s*;/gi, `USE \`${targetDatabase}\`;`)
    .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+shop_quan_ao[^;]*;/gi, '');
};

const runFiles = async (connection, folder, files) => {
  for (const file of files) {
    const filePath = path.join(projectRoot, 'database', folder, file);
    const rawSql = await fs.readFile(filePath, 'utf8');
    const sql = normalizeSql(rawSql);
    console.log(`Đang chạy ${folder}/${file}`);
    await connection.query(sql);
  }
};

const connection = await mysql.createConnection(connectionConfig);

try {
  if (mode === 'migrate' || mode === 'all') {
    await runFiles(connection, 'migrations', migrationFiles);
  }

  if (mode === 'seed' || mode === 'all') {
    await runFiles(connection, 'seeders', seederFiles);
  }

  console.log('Hoàn tất cập nhật database.');
} finally {
  await connection.end();
}
