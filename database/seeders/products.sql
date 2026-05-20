SET NAMES utf8mb4;
USE shop_quan_ao;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO products (category_id, name, description, base_price, image_url) VALUES
(1, 'Áo thun nam Cotton Essential', 'Áo thun cotton mềm, form regular phù hợp mặc hằng ngày.', 189000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'),
(1, 'Áo thun nam Oversize Urban', 'Form oversize trẻ trung, chất thun dày vừa và dễ phối jean.', 229000, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80'),
(1, 'Áo thun nam Graphic Weekend', 'Áo graphic tee nổi bật cho phong cách dạo phố cuối tuần.', 249000, 'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?auto=format&fit=crop&w=700&q=80'),
(1, 'Áo polo nam Pique Classic', 'Áo polo pique đứng form, phù hợp đi làm và gặp gỡ khách hàng.', 329000, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=700&q=80'),
(2, 'Áo thun nữ Ribbed Slim', 'Chất rib co giãn nhẹ, ôm vừa và tôn dáng.', 199000, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80'),
(2, 'Áo croptop nữ Basic', 'Croptop basic dễ phối cùng jean, chân váy và quần short.', 179000, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80'),
(2, 'Áo kiểu nữ cổ vuông', 'Thiết kế cổ vuông nữ tính, chất vải nhẹ và thoáng.', 289000, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80'),
(2, 'Áo blouse nữ tay phồng', 'Blouse thanh lịch cho công sở, cafe hoặc đi chơi.', 349000, 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80'),
(3, 'Quần jean nam Slim Indigo', 'Jean slim màu indigo, chất denim bền và đứng dáng.', 499000, 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80'),
(3, 'Quần jean nam Straight Wash', 'Ống straight thoải mái, wash xanh hiện đại.', 529000, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80'),
(3, 'Quần jean nam Black Denim', 'Jean đen tối giản, dễ phối áo thun và sơ mi.', 479000, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80'),
(3, 'Quần jean nam Relaxed Fit', 'Form relaxed thoải mái cho phong cách casual.', 559000, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80'),
(4, 'Quần short kaki nam', 'Short kaki đứng form, túi tiện dụng và thoáng mát.', 269000, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80'),
(4, 'Quần short jean nữ', 'Short jean năng động cho mùa hè và du lịch.', 299000, 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=700&q=80'),
(4, 'Quần short thể thao Unisex', 'Short thun co giãn, phù hợp tập luyện và mặc nhà.', 189000, 'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?auto=format&fit=crop&w=700&q=80'),
(4, 'Quần short linen nữ', 'Chất linen nhẹ, thoáng và phù hợp du lịch biển.', 319000, 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=700&q=80'),
(5, 'Áo khoác bomber nam', 'Bomber nhẹ, phối bo tay gọn và phong cách thành thị.', 629000, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80'),
(5, 'Áo khoác denim unisex', 'Denim jacket bụi bặm, dễ phối nhiều lớp.', 699000, 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80'),
(5, 'Áo blazer nữ Minimal', 'Blazer nữ tối giản, phù hợp công sở và sự kiện nhẹ.', 759000, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80'),
(5, 'Áo khoác gió chống nắng', 'Áo khoác gió mỏng nhẹ, có mũ và chống nắng tốt.', 459000, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80'),
(6, 'Váy công sở chữ A', 'Váy chữ A thanh lịch, chất vải đứng form.', 429000, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80'),
(6, 'Đầm midi hoa nhí', 'Đầm midi họa tiết hoa nhí, nhẹ nhàng và nữ tính.', 499000, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80'),
(6, 'Chân váy xếp ly', 'Chân váy xếp ly dễ phối áo thun hoặc blouse.', 379000, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80'),
(6, 'Đầm suông tối giản', 'Đầm suông hiện đại, thoải mái cho công sở.', 469000, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=700&q=80'),
(7, 'Áo gym nam DryFit', 'Áo tập co giãn, thoát mồ hôi nhanh.', 249000, 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=700&q=80'),
(7, 'Quần legging nữ Sculpt', 'Legging ôm vừa, lưng cao và co giãn tốt.', 329000, 'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?auto=format&fit=crop&w=700&q=80'),
(7, 'Áo bra thể thao nữ', 'Áo bra thể thao nâng đỡ vừa, phù hợp yoga và gym.', 279000, 'https://images.unsplash.com/photo-1506629905607-d405b7a30db9?auto=format&fit=crop&w=700&q=80'),
(7, 'Quần jogger thể thao', 'Jogger thun thoải mái, phù hợp tập luyện và di chuyển.', 359000, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=700&q=80'),
(8, 'Túi tote canvas', 'Túi tote rộng, bền và tiện dụng khi đi học hoặc đi làm.', 199000, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80'),
(8, 'Nón lưỡi trai basic', 'Nón lưỡi trai form cứng, phối logo tối giản.', 159000, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=700&q=80'),
(8, 'Thắt lưng da nam', 'Thắt lưng da phối khóa kim loại, dễ dùng hằng ngày.', 269000, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=700&q=80'),
(8, 'Ví mini nữ', 'Ví mini nhỏ gọn, nhiều ngăn và màu sắc thanh lịch.', 239000, 'https://images.unsplash.com/photo-1583838849754-51a5f088617a?auto=format&fit=crop&w=700&q=80'),
(9, 'Sneaker trắng Classic', 'Sneaker trắng tối giản, dễ phối mọi outfit.', 699000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80'),
(9, 'Giày chạy bộ Active', 'Giày chạy bộ nhẹ, đế êm và thoáng khí.', 849000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=700&q=80'),
(9, 'Sneaker canvas Low', 'Giày canvas cổ thấp trẻ trung cho đi học, đi chơi.', 459000, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=700&q=80'),
(9, 'Sneaker chunky Street', 'Thiết kế chunky nổi bật, phù hợp streetwear.', 899000, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80'),
(10, 'Bộ pyjama nữ satin', 'Pyjama satin mềm mịn, thoải mái khi ngủ.', 399000, 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=700&q=80'),
(10, 'Bộ mặc nhà nam cotton', 'Set mặc nhà cotton thoáng mát và dễ giặt.', 349000, 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=700&q=80'),
(10, 'Đầm ngủ hai dây', 'Đầm ngủ nhẹ, nữ tính và thoải mái.', 289000, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80'),
(10, 'Set lounge unisex', 'Set lounge tối giản cho mặc nhà hoặc dạo phố nhẹ.', 429000, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80'),
(11, 'Sơ mi trắng Oxford nam', 'Sơ mi Oxford đứng form, phù hợp công sở.', 389000, 'https://images.unsplash.com/photo-1596755094514-f87e32f1b7fc?auto=format&fit=crop&w=700&q=80'),
(11, 'Sơ mi trắng nữ lụa', 'Sơ mi nữ chất lụa nhẹ, thanh lịch và mềm mại.', 429000, 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80'),
(11, 'Sơ mi trắng cổ tàu', 'Sơ mi cổ tàu gọn gàng, phù hợp phong cách tối giản.', 359000, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80'),
(11, 'Sơ mi trắng oversize', 'Sơ mi oversize mặc ngoài áo thun hoặc phối layering.', 379000, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80'),
(12, 'Sơ mi họa tiết tropical', 'Họa tiết nhiệt đới phù hợp du lịch và mùa hè.', 369000, 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80'),
(12, 'Sơ mi caro casual', 'Sơ mi caro mềm, dễ phối áo thun bên trong.', 339000, 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=700&q=80'),
(12, 'Sơ mi họa tiết nữ', 'Sơ mi nữ họa tiết nhẹ, nổi bật nhưng vẫn thanh lịch.', 389000, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80'),
(12, 'Sơ mi sọc xanh', 'Sơ mi sọc xanh mát mắt, phù hợp đi làm và đi chơi.', 349000, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=700&q=80'),
(13, 'Áo len cổ lọ nữ', 'Áo len cổ lọ giữ ấm, form gọn và dễ phối.', 459000, 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=700&q=80'),
(13, 'Cardigan basic', 'Cardigan mềm, dùng khoác nhẹ trong văn phòng.', 429000, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80'),
(13, 'Sweater nam minimal', 'Sweater nam tối giản, chất nỉ mềm và ấm.', 449000, 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=700&q=80'),
(13, 'Áo len gile unisex', 'Gile len phối sơ mi, phong cách học đường hiện đại.', 399000, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80'),
(14, 'Quần tây nam slim', 'Quần tây slim vừa vặn, phù hợp công sở.', 469000, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80'),
(14, 'Quần tây nữ ống suông', 'Quần tây nữ ống suông, tôn dáng và thanh lịch.', 489000, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80'),
(14, 'Quần culottes nữ', 'Quần culottes rộng vừa, thoải mái khi di chuyển.', 429000, 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=700&q=80'),
(14, 'Quần tây nam cropped', 'Quần tây cropped trẻ trung, phù hợp sneaker.', 459000, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80'),
(15, 'Hoodie oversize unisex', 'Hoodie oversize ấm, phù hợp streetwear.', 459000, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80'),
(15, 'Hoodie zip basic', 'Hoodie khóa kéo tiện dụng, dễ mặc nhiều mùa.', 489000, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80'),
(15, 'Áo nỉ crewneck', 'Crewneck nỉ trơn, form thoải mái và dễ phối.', 399000, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80'),
(15, 'Hoodie graphic street', 'Hoodie in hình nổi bật cho phong cách cá tính.', 529000, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80');

INSERT INTO product_variants (product_id, size, color, stock_quantity)
SELECT
  p.id,
  CASE
    WHEN p.category_id = 8 THEN 'FreeSize'
    WHEN p.category_id = 9 THEN CASE v.n WHEN 1 THEN '40' WHEN 2 THEN '41' ELSE '42' END
    ELSE CASE v.n WHEN 1 THEN 'S' WHEN 2 THEN 'M' ELSE 'L' END
  END AS size,
  CASE v.n
    WHEN 1 THEN 'Đen'
    WHEN 2 THEN 'Trắng'
    ELSE 'Xanh navy'
  END AS color,
  CASE v.n
    WHEN 1 THEN 18 + (p.id % 9)
    WHEN 2 THEN 25 + (p.id % 11)
    ELSE 12 + (p.id % 7)
  END AS stock_quantity
FROM products p
CROSS JOIN (
  SELECT 1 AS n
  UNION ALL SELECT 2
  UNION ALL SELECT 3
) v
ORDER BY p.id, v.n;
