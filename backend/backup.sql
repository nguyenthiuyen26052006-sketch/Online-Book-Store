-- ============================================================
-- Online Book Store — dữ liệu mẫu
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (
    id, name, email, hashed_password, phone, address, role, is_active, created_at
) VALUES
(1001, N'Quản trị viên A',  'superadmin1@bookstore.com', '$argon2id$v=19$m=65540,t=3,p=4$ek8JwRjD+H+vNcYYw3ivlQ$HleJvInUwpR7DsTqf954haRWkNzVZx88fK8yQiKgxLA', NULL, NULL, 'super_admin', 1, NOW()),
(1006, N'Quản trị viên B',  'superadmin2@bookstore.com', '$argon2id$v=19$m=65540,t=3,p=4$ek8JwRjD+H+vNcYYw3ivlQ$HleJvInUwpR7DsTqf954haRWkNzVZx88fK8yQiKgxLA', NULL, NULL, 'super_admin', 1, NOW()),
(1002, N'Nhà sách A',       'admin1@bookstore.com',      '$argon2id$v=19$m=65540,t=3,p=4$u/ee8z5nLMVYC8HYe4/R2g$q0uvbDITBx6soXRHCaen/ZeXHkUNZi0JAEX1N1R/yrA', NULL, NULL, 'admin',       1, NOW()),
(1003, N'Nhà sách B',       'admin2@bookstore.com',      '$argon2id$v=19$m=65540,t=3,p=4$u/ee8z5nLMVYC8HYe4/R2g$q0uvbDITBx6soXRHCaen/ZeXHkUNZi0JAEX1N1R/yrA', NULL, NULL, 'admin',       1, NOW()),
(1004, N'Nguyễn Văn Dũng',  'user1@bookstore.com',       '$argon2id$v=19$m=65540,t=3,p=4$fe+dc+7dm5PSGuO8t1YKYQ$vs7Z/uj2cXY179YFC/G9uNs4MKlfedp08A6gaaB5KGY', '0901234567', N'123 Đường Lê Lợi, Quận 1, TP.HCM', 'user', 1, NOW()),
(1005, N'Nguyễn Thị Uyên',  'user2@bookstore.com',       '$argon2id$v=19$m=65540,t=3,p=4$fe+dc+7dm5PSGuO8t1YKYQ$vs7Z/uj2cXY179YFC/G9uNs4MKlfedp08A6gaaB5KGY', '0912345678', N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', 'user', 1, NOW());

-- ============================================================
-- CATEGORIES (13 danh mục)
-- ============================================================
INSERT INTO categories (id, name, slug, description, image, created_at) VALUES
('cat-fiction',    N'Văn học',             'van-hoc',              N'Tiểu thuyết, truyện ngắn trong và ngoài nước',        'https://i0.wp.com/highschool.latimes.com/wp-content/uploads/2019/02/classic-lit-.jpg', NOW()),
('cat-business',   N'Kinh doanh',          'kinh-doanh',           N'Quản trị, khởi nghiệp, marketing, tài chính cá nhân', 'https://media.istockphoto.com/id/1765977662/photo/big-group-of-mixed-race-business-people-are-discussing-a-new-project.jpg', NOW()),
('cat-technology', N'Công nghệ',           'cong-nghe',            N'Lĩnh vực công nghệ hiện đại, bao gồm đổi mới sáng tạo, phần mềm, phần cứng và các xu hướng phát triển số trên toàn cầu', 'https://www.simplilearn.com/ice9/free_resources_article_thumb/What_is_the_Importance_of_Technology.jpg', NOW()),
('cat-manga',      N'Truyện tranh',        'truyen-tranh',         N'Manga, comic và graphic novel',                       'https://i.pinimg.com/736x/62/d9/8a/62d98add096431ab19d5e439e108184d.jpg', NOW()),
('cat-self-help',  N'Phát triển bản thân', 'phat-trien-ban-than',  N'Tự phát triển, kỹ năng sống và động lực',            'https://chefjob.vn/wp-content/uploads/2018/02/ke-hoach-phat-trien-ban-than-giup-ban-xac-dinh-muc-tieu.jpg', NOW()),
('cat-children',   N'Thiếu nhi',           'thieu-nhi',            N'Sách cho trẻ em',                                     'https://thumbs.dreamstime.com/b/back-to-school-set-school-kids-education-concept-vector-illustration-72366188.jpg', NOW()),
('cat-health',     N'Sức khỏe',            'suc-khoe',             N'Sức khỏe, dinh dưỡng và tâm linh',                   'https://apollouniversity.edu.in/blog/wp-content/uploads/2025/02/Public-Health.jpg', NOW()),
('cat-sci-fi',     N'Viễn tưởng',          'vien-tuong',           N'Khoa học viễn tưởng và fantasy',                     'https://images.alphacoders.com/100/thumb-1920-1002901.jpg', NOW()),
('cat-history',    N'Lịch sử',             'lich-su',              N'Lịch sử thế giới, Việt Nam và tiểu sử danh nhân',    'https://highlandfling.net/wp-content/uploads/2024/09/History-alternative-image-for-PA-Times.jpg', NOW()),
('cat-psychology', N'Tâm lý',              'tam-ly',               N'Tâm lý học và hành vi con người',                    'https://www.hoasen.edu.vn/tuyensinh/wp-content/uploads/sites/7/2024/12/bo-mon-tam-ly-hoc-va-ung-dung-de-hieu-ban-than-tot-hon-hinh-1.jpg', NOW()),
('cat-philosophy', N'Triết học',           'triet-hoc',            N'Triết học và tư tưởng',                              'https://png.pngtree.com/thumb_back/fh260/background/20241231/pngtree-ancient-greece-philosophy-image_16542413.jpg', NOW()),
('cat-education',  N'Giáo dục',            'giao-duc',             N'Sách giáo khoa và tham khảo',                        'https://centrepointschools.com/blogs/wp-content/uploads/2025/03/What-you-need-to-know-about-higher-education.jpg', NOW());

-- ============================================================
-- BOOKS
-- ============================================================
INSERT INTO books (
    id, uuid, title, slug, author, description, price, image,
    category_id, admin_id, stock, created_at, updated_at
) VALUES
(3001, 'a3000001-0001-4001-8001-000000003001', N'Sapiens: Lược sử loài người', 'sapiens-luoc-su-loai-nguoi', 'Yuval Noah Harari',
 N'Lịch sử loài người từ thời đồ đá đến hiện đại.', 199000,
 'https://www.netabooks.vn/Data/Sites/1/Product/12090/sapiens-luoc-su-loai-nguoi-4.jpg',
 'cat-history', 1002, 48, NOW(), NOW()),

(3002, 'a3000002-0002-4002-8002-000000003002', N'Atomic Habits', 'atomic-habits', 'James Clear',
 N'Xây dựng thói quen tốt và phá bỏ thói quen xấu.', 159000,
 'https://storage.ghost.io/c/1b/54/1b54d596-eb39-4219-9d73-be25167375fe/content/images/size/w2000/2024/02/image_67203329.JPG',
 'cat-self-help', 1002, 62, NOW(), NOW()),

(3003, 'a3000003-0003-4003-8003-000000003003', N'Deep Work', 'deep-work', 'Cal Newport',
 N'Làm việc tập trung sâu trong thế giới đầy xao nhãng.', 179000,
 'https://bizweb.dktcdn.net/thumb/grande/100/197/269/products/a-2711f783-0084-45cf-bf28-00b008da2cc3.jpg',
 'cat-business', 1003, 35, NOW(), NOW()),

(3004, 'a3000005-0005-4005-8005-000000003005', N'Tư duy nhanh và chậm', 'tu-duy-nhanh-va-cham', 'Daniel Kahneman',
 N'Kinh tế học hành vi và ra quyết định.', 219000,
 'https://cdn-img-v2.mybota.vn/uploadv2/web/17/17409/news/2024/07/01/09/08/1719799368_12665.jpg',
 'cat-psychology', 1002, 40, NOW(), NOW()),

(3005, 'a3000006-0006-4006-8006-000000003006', N'The Phoenix Project', 'the-phoenix-project', 'Gene Kim',
 N'Câu chuyện DevOps và quản trị IT.', 189000,
 'https://m.media-amazon.com/images/I/914-sUgELZL._AC_UF1000,1000_QL80_.jpg',
 'cat-technology', 1003, 28, NOW(), NOW()),

(3006, 'a3000007-0007-4007-8007-000000003007', N'Clean Code', 'clean-code-robert-martin', 'Robert C. Martin',
 N'Kỹ năng viết mã sạch và bảo trì.', 249000,
 'https://cdn1.fahasa.com/media/catalog/product/8/9/8936107813361.jpg',
 'cat-technology', 1002, 33, NOW(), NOW()),

(3007, 'a3000009-0009-4009-8009-000000003009', N'Design Patterns', 'design-patterns-gang-of-four', 'Gang of Four',
 N'Các mẫu thiết kế hướng đối tượng.', 229000,
 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/f9e255ba-6512-410c-b6c7-f545d8a65992.__CR197,0,1105,1383_PT0_SX362_V1___.jpg',
 'cat-technology', 1002, 22, NOW(), NOW()),

(3008, 'a3000008-0008-4008-8008-000000003008', N'Mắt biếc', 'mat-biec', N'Nguyễn Nhật Ánh',
 N'Câu chuyện tuổi thơ và tình bạn.', 139000,
 'https://library.phenikaa-uni.edu.vn/sites/default/files/Review-sach-Mat-biec-Nguyen-Nhat-Anh.jpg',
 'cat-fiction', 1003, 70, NOW(), NOW()),

(3009, 'a3000011-0011-4011-8011-000000003011', N'Tôi thấy hoa vàng trên cỏ xanh', 'toi-thay-hoa-vang-tren-co-xanh', N'Nguyễn Nhật Ánh',
 N'Câu chuyện tuổi thơ miền quê đầy cảm xúc.', 129000,
 'https://upload.wikimedia.org/wikipedia/vi/3/3d/T%C3%B4i_th%E1%BA%A5y_hoa_v%C3%A0ng_tr%C3%AAn_c%E1%BB%8F_xanh.jpg',
 'cat-fiction', 1003, 55, NOW(), NOW()),

(3010, 'a3000012-0012-4012-8012-000000003012', N'Nhà giả kim', 'nha-gia-kim', 'Paulo Coelho',
 N'Hành trình theo đuổi giấc mơ của chàng chăn cừu Santiago.', 149000,
 'https://hd1.hotdeal.vn/images/uploads/2016/Thang%206/09/265266/265266-nha-gia-kim-0-body%20%281%29.jpg',
 'cat-fiction', 1002, 80, NOW(), NOW()),

(3011, 'a3000010-0010-4010-8010-000000003010', N'Dune', 'dune-frank-herbert', 'Frank Herbert',
 N'Khoa học viễn tưởng kinh điển trên sa mạc Arrakis.', 169000,
 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/hostedimages/1649161732i/32773948._SY540_.jpg',
 'cat-sci-fi', 1003, 38, NOW(), NOW()),

(3012, 'a3000013-0013-4013-8013-000000003013', N'1984', '1984-george-orwell', 'George Orwell',
 N'Xã hội toàn trị và cuộc nổi dậy của tư tưởng tự do.', 145000,
 'https://images.squarespace-cdn.com/content/v1/57923bb33e00be1777423ef5/1709142941476-W1OS1PWK1WOWLQ5JKJ0T/IMG_8509.jpg',
 'cat-sci-fi', 1002, 45, NOW(), NOW()),

(3013, 'a3000014-0014-4014-8014-000000003014', N'Cha giàu cha nghèo', 'cha-giau-cha-ngheo', 'Robert T. Kiyosaki',
 N'Tư duy tài chính và con đường đến tự do tài chính.', 159000,
 'https://cdn1.fahasa.com/media/catalog/product/c/h/cha-giau-cha-ngheo.jpg',
 'cat-business', 1003, 90, NOW(), NOW()),

(3014, 'a3000015-0015-4015-8015-000000003015', N'Khởi nghiệp tinh gọn', 'khoi-nghiep-tinh-gon', 'Eric Ries',
 N'Phương pháp Lean Startup xây dựng sản phẩm và doanh nghiệp.', 189000,
 'https://nhasachbaoanh.com/wp-content/uploads/2022/06/khoi-nghiep-tinh-gon-1.jpg',
 'cat-business', 1002, 30, NOW(), NOW()),

(3015, 'a3000016-0016-4016-8016-000000003015', N'Đắc nhân tâm', 'dac-nhan-tam', 'Dale Carnegie',
 N'Nghệ thuật giao tiếp và gây ảnh hưởng đến người khác.', 139000,
 'https://nxbhcm.com.vn/Image/Biasach/dacnhantam86.jpg',
 'cat-self-help', 1003, 100, NOW(), NOW()),

(3016, 'a3000017-0017-4017-8017-000000003016', N'Thói quen lúc 5 giờ sáng', 'thoi-quen-luc-5-gio-sang', 'Robin Sharma',
 N'Làm chủ buổi sáng để làm chủ cuộc đời.', 159000,
 'https://cdn1.fahasa.com/media/catalog/product/l/a/lam_chu_binh_minh_song_doi_xuat_chung_bia1.jpg',
 'cat-health', 1002, 42, NOW(), NOW()),

(3017, 'a3000018-0018-4018-8018-000000003017', N'Đời ngắn đừng ngủ dài', 'doi-ngan-dung-ngu-dai', 'Robin Sharma',
 N'Triết lý sống đơn giản, ý nghĩa và trọn vẹn.', 149000,
 'https://www.netabooks.vn/Data/Sites/1/Product/24213/doi-ngan-dung-ngu-dai-3.jpg',
 'cat-philosophy', 1003, 35, NOW(), NOW()),

(3018, 'a3000019-0019-4019-8019-000000003018', N'Tâm lý học tội phạm: Chân dung kẻ phạm tội', 'tam-ly-hoc-toi-pham-chan-dung-ke-pham-toi', 'Ichiro Kishimi',
 N'Tâm lý học tội phạm — phân tích chân dung và hành vi kẻ phạm tội dưới góc nhìn khoa học.', 169000,
 'https://cdn1.fahasa.com/media/catalog/product/p/h/ph_c-h_a-ch_n-dung-k_-ph_m-t_i.jpg',
 'cat-psychology', 1002, 50, NOW(), NOW());

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (id, user_id, book_id, rating, comment, created_at, updated_at) VALUES
(8001, 1004, 3001, 5, N'Sách rất hay, góc nhìn lịch sử đầy thuyết phục.',            NOW(), NOW()),
(8002, 1004, 3001, 5, N'Tác giả có lối viết dễ hiểu dù đề tài phức tạp.',            NOW(), NOW()),
(8003, 1004, 3001, 4, N'Rất đáng đọc, một số luận điểm còn gây tranh cãi.',          NOW(), NOW()),
(8004, 1005, 3001, 4, N'Mở mang tầm nhìn về lịch sử và văn minh nhân loại.',         NOW(), NOW()),
(8005, 1004, 3002, 5, N'Ứng dụng được ngay vào thói quen hằng ngày.',                NOW(), NOW()),
(8006, 1004, 3002, 5, N'Cuốn sách thay đổi cách tôi nhìn nhận thói quen.',           NOW(), NOW()),
(8007, 1005, 3002, 5, N'Rất thực tế, nhiều ví dụ sinh động và dễ áp dụng.',          NOW(), NOW()),
(8008, 1004, 3002, 4, N'Hay nhưng một số ý lặp lại nhiều lần.',                      NOW(), NOW()),
(8009, 1004, 3003, 4, N'Ý tưởng tập trung sâu rất đáng đọc.',                        NOW(), NOW()),
(8010, 1004, 3003, 4, N'Giúp tôi cải thiện năng suất làm việc đáng kể.',             NOW(), NOW()),
(8011, 1005, 3003, 3, N'Hay nhưng hơi dài, nên đọc bản tóm tắt trước.',              NOW(), NOW()),
(8012, 1004, 3004, 5, N'Một tác phẩm đáng suy ngẫm.',                                NOW(), NOW()),
(8013, 1005, 3004, 4, N'Hơi dày nhưng nội dung xứng đáng từng trang.',               NOW(), NOW()),
(8014, 1004, 3004, 4, N'Giải thích hành vi con người rất khoa học và thú vị.',       NOW(), NOW()),
(8015, 1004, 3004, 5, N'Kinh điển về tâm lý học hành vi, nên đọc ít nhất một lần.', NOW(), NOW()),
(8016, 1004, 3005, 5, N'Phần kể chuyện IT rất thú vị, phù hợp dân công nghệ.',      NOW(), NOW()),
(8017, 1005, 3005, 4, N'Giúp hiểu DevOps qua câu chuyện hơn là lý thuyết khô khan.',NOW(), NOW()),
(8018, 1004, 3005, 4, N'Recommended cho team leader và IT manager.',                  NOW(), NOW()),
(8019, 1004, 3006, 4, N'Phù hợp dev muốn nâng cao tay nghề.',                        NOW(), NOW()),
(8020, 1004, 3006, 5, N'Bắt buộc phải đọc nếu làm phần mềm chuyên nghiệp.',         NOW(), NOW()),
(8021, 1005, 3006, 4, N'Nhiều nguyên tắc vẫn còn nguyên giá trị đến nay.',           NOW(), NOW()),
(8022, 1004, 3006, 3, N'Một số ví dụ hơi cũ nhưng triết lý vẫn đúng.',               NOW(), NOW()),
(8023, 1004, 3007, 4, N'Classic, nên đọc cùng ví dụ hiện đại.',                      NOW(), NOW()),
(8024, 1005, 3007, 4, N'Kiến thức nền tảng quan trọng cho mọi lập trình viên.',      NOW(), NOW()),
(8025, 1004, 3007, 3, N'Hơi khó tiếp cận với người mới, nên có kinh nghiệm trước.', NOW(), NOW()),
(8026, 1004, 3008, 5, N'Rất Việt Nam, cảm động.',                                    NOW(), NOW()),
(8027, 1004, 3008, 5, N'Đọc mà thấy cả tuổi thơ ùa về, viết rất chân thực.',        NOW(), NOW()),
(8028, 1004, 3008, 5, N'Nguyễn Nhật Ánh luôn biết cách chạm đến trái tim.',         NOW(), NOW()),
(8029, 1004, 3008, 4, N'Câu chuyện nhẹ nhàng nhưng đọng lại rất lâu.',               NOW(), NOW()),
(8030, 1004, 3009, 5, N'Tuổi thơ miền quê đẹp quá, đọc mà mắt rưng rưng.',         NOW(), NOW()),
(8031, 1004, 3009, 5, N'Tác phẩm xuất sắc của Nguyễn Nhật Ánh.',                    NOW(), NOW()),
(8032, 1004, 3009, 4, N'Hình ảnh quê hương hiện lên rất sống động.',                 NOW(), NOW()),
(8033, 1004, 3010, 5, N'Câu chuyện truyền cảm hứng mạnh mẽ, đọc đi đọc lại nhiều lần.', NOW(), NOW()),
(8034, 1004, 3010, 5, N'Triết lý nhân sinh sâu sắc trong từng trang sách.',          NOW(), NOW()),
(8035, 1004, 3010, 4, N'Ngắn gọn nhưng chứa đựng nhiều bài học quý.',                NOW(), NOW()),
(8036, 1004, 3010, 5, N'Một trong những cuốn sách hay nhất tôi từng đọc.',           NOW(), NOW()),
(8037, 1004, 3011, 5, N'Thế giới Arrakis sống động và hấp dẫn.',                     NOW(), NOW()),
(8038, 1004, 3011, 4, N'Cốt truyện phức tạp nhưng rất đáng đọc.',                   NOW(), NOW()),
(8039, 1005, 3011, 4, N'Kinh điển khoa học viễn tưởng không thể bỏ qua.',            NOW(), NOW()),
(8040, 1004, 3012, 5, N'Tác phẩm kinh điển, cảnh báo sâu sắc về xã hội toàn trị.', NOW(), NOW()),
(8041, 1005, 3012, 5, N'Đọc mà rùng mình, quá xuất sắc.',                            NOW(), NOW()),
(8042, 1004, 3012, 4, N'Nặng nề nhưng là trải nghiệm đọc sách rất đáng giá.',        NOW(), NOW()),
(8043, 1004, 3013, 5, N'Thay đổi cách tôi nghĩ về tiền bạc hoàn toàn.',             NOW(), NOW()),
(8044, 1004, 3013, 4, N'Nền tảng tư duy tài chính rất tốt cho người mới.',           NOW(), NOW()),
(8045, 1004, 3013, 4, N'Hay, nhưng một số lời khuyên cần kiểm chứng thêm.',          NOW(), NOW()),
(8046, 1004, 3013, 5, N'Cuốn sách đầu tiên nên đọc về tài chính cá nhân.',           NOW(), NOW()),
(8047, 1004, 3014, 4, N'Lean Startup là phương pháp thực tiễn rất hiệu quả.',        NOW(), NOW()),
(8048, 1005, 3014, 4, N'Phù hợp cho founder và product manager.',                     NOW(), NOW()),
(8049, 1004, 3014, 3, N'Hay nhưng một số ví dụ khá cũ so với hiện tại.',             NOW(), NOW()),
(8050, 1005, 3015, 5, N'Kinh điển về giao tiếp, ai cũng nên đọc ít nhất một lần.',  NOW(), NOW()),
(8051, 1004, 3015, 5, N'Thay đổi cách tôi giao tiếp và xây dựng mối quan hệ.',      NOW(), NOW()),
(8052, 1005, 3015, 4, N'Vẫn còn nguyên giá trị dù ra đời từ rất lâu.',               NOW(), NOW()),
(8053, 1004, 3015, 5, N'Áp dụng được ngay trong cuộc sống và công việc.',             NOW(), NOW()),
(8054, 1004, 3016, 5, N'Đã thay đổi thói quen buổi sáng của tôi hoàn toàn.',        NOW(), NOW()),
(8055, 1004, 3016, 4, N'Truyền cảm hứng mạnh, cần thực hành kiên trì.',              NOW(), NOW()),
(8056, 1005, 3016, 4, N'Lý thuyết tốt nhưng khó áp dụng lúc đầu.',                  NOW(), NOW()),
(8057, 1004, 3017, 4, N'Triết lý sống tích cực, ngôn từ dễ đọc.',                   NOW(), NOW()),
(8058, 1004, 3017, 4, N'Nhắc nhở mình sống trọn vẹn hơn mỗi ngày.',                 NOW(), NOW()),
(8059, 1005, 3017, 3, N'Nội dung ổn nhưng không có nhiều điểm mới.',                 NOW(), NOW()),
(8060, 1004, 3018, 5, N'Tâm lý học Adler thực sự thay đổi góc nhìn của tôi.',      NOW(), NOW()),
(8061, 1004, 3018, 5, N'Dạng hội thoại dễ đọc, triết lý sâu sắc.',                  NOW(), NOW()),
(8062, 1005, 3018, 4, N'Rất hay, đặc biệt với ai đang tìm kiếm sự tự do nội tâm.', NOW(), NOW()),
(8063, 1004, 3018, 5, N'Một trong những cuốn sách tâm lý hay nhất tôi đọc.',        NOW(), NOW());

-- ============================================================
-- REVIEW REPLIES
-- ============================================================
INSERT INTO review_replies (id, review_id, message, display_name, created_at) VALUES
(9001, 8001, N'Cảm ơn bạn đã tin tưởng và chia sẻ cảm nhận. Chúc bạn đọc sách vui!', 'Store Team', NOW()),
(9002, 8005, N'Rất vui khi cuốn sách hữu ích với bạn. Nhà sách luôn sẵn sàng tư vấn thêm.', 'Customer Support', NOW()),
(9003, 8026, N'Cảm ơn bạn đã ủng hộ tác phẩm của Nguyễn Nhật Ánh!', 'Store Team', NOW()),
(9004, 8033, N'Nhà giả kim là một trong những cuốn sách bán chạy nhất của chúng tôi. Cảm ơn bạn!', 'Admin', NOW()),
(9005, 8050, N'Đắc nhân tâm xứng đáng là sách gối đầu giường. Cảm ơn bạn đã chia sẻ!', 'Store Team', NOW());

-- ============================================================
-- THÊM DỮ LIỆU ORDERS (tiếp theo từ 5011) — đa dạng trạng thái
-- ============================================================

INSERT INTO orders (id, user_id, total_amount, status, shipping_address, phone, payment_method, note, created_at, updated_at) VALUES
(5011, 1004, 348000,  'delivered',  N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(5012, 1005, 558000,  'delivered',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'cod',     NULL,                        DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(5013, 1004, 189000,  'shipping',   N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'cod',     N'Giao buổi sáng giúp mình', DATE_SUB(NOW(), INTERVAL 3  DAY), DATE_SUB(NOW(), INTERVAL 1  DAY)),
(5014, 1005, 388000,  'delivered',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY)),
(5015, 1004, 527000,  'confirmed',  N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 2  DAY), DATE_SUB(NOW(), INTERVAL 1  DAY)),
(5016, 1005, 169000,  'pending',    N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'cod',     NULL,                        NOW(),                             NOW()),
(5017, 1004, 706000,  'delivered',  N'78 Đường Trần Hưng Đạo, Quận 5, TP.HCM', '0901234567', 'banking', N'Giao trước 12h trưa',      DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),
(5018, 1005, 314000,  'shipping',   N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'cod',     NULL,                        DATE_SUB(NOW(), INTERVAL 4  DAY), DATE_SUB(NOW(), INTERVAL 2  DAY)),
(5019, 1004, 159000,  'cancelled',  N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'cod',     N'Đặt nhầm địa chỉ',         DATE_SUB(NOW(), INTERVAL 52 DAY), DATE_SUB(NOW(), INTERVAL 51 DAY)),
(5020, 1005, 487000,  'delivered',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 52 DAY)),
(5021, 1004, 457000,  'pending',    N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'banking', NULL,                        NOW(),                             NOW()),
(5022, 1005, 219000,  'confirmed',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'cod',     NULL,                        DATE_SUB(NOW(), INTERVAL 1  DAY), DATE_SUB(NOW(), INTERVAL 1  DAY)),
(5023, 1004, 607000,  'delivered',  N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'cod',     NULL,                        DATE_SUB(NOW(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 62 DAY)),
(5024, 1005, 338000,  'cancelled',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'banking', N'Hết hàng, huỷ đơn',        DATE_SUB(NOW(), INTERVAL 68 DAY), DATE_SUB(NOW(), INTERVAL 67 DAY)),
(5025, 1004, 493000,  'shipping',   N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 5  DAY), DATE_SUB(NOW(), INTERVAL 3  DAY)),
(5026, 1005, 189000,  'delivered',  N'78 Đường Trần Hưng Đạo, Quận 5, TP.HCM', '0912345678', 'cod',     NULL,                        DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY)),
(5027, 1004, 268000,  'confirmed',  N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'banking', N'Wrap quà tặng giúp mình',  DATE_SUB(NOW(), INTERVAL 2  DAY), DATE_SUB(NOW(), INTERVAL 1  DAY)),
(5028, 1005, 557000,  'delivered',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'banking', NULL,                        DATE_SUB(NOW(), INTERVAL 85 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY)),
(5029, 1004, 139000,  'pending',    N'123 Đường Lê Lợi, Quận 1, TP.HCM',       '0901234567', 'cod',     NULL,                        NOW(),                             NOW()),
(5030, 1005, 667000,  'cancelled',  N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM',   '0912345678', 'banking', N'Thanh toán thất bại',      DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 89 DAY));

-- ============================================================
-- ORDER ITEMS
-- ============================================================

INSERT INTO order_items (id, order_id, book_id, title, image, quantity, price_at_purchase) VALUES
-- 5011 delivered: Deep Work + Đời ngắn đừng ngủ dài
(6023, 5011, 3003, N'Deep Work',                              'https://bizweb.dktcdn.net/thumb/grande/100/197/269/products/a-2711f783-0084-45cf-bf28-00b008da2cc3.jpg', 1, 179000),
(6024, 5011, 3017, N'Đời ngắn đừng ngủ dài',                 'https://www.netabooks.vn/Data/Sites/1/Product/24213/doi-ngan-dung-ngu-dai-3.jpg', 1, 149000),
-- 5012 delivered: Clean Code + Khởi nghiệp tinh gọn + Thói quen lúc 5h
(6025, 5012, 3006, N'Clean Code',                             'https://cdn1.fahasa.com/media/catalog/product/8/9/8936107813361.jpg', 1, 249000),
(6026, 5012, 3014, N'Khởi nghiệp tinh gọn',                  'https://nhasachbaoanh.com/wp-content/uploads/2022/06/khoi-nghiep-tinh-gon-1.jpg', 1, 189000),
(6027, 5012, 3016, N'Thói quen lúc 5 giờ sáng',              'https://cdn1.fahasa.com/media/catalog/product/l/a/lam_chu_binh_minh_song_doi_xuat_chung_bia1.jpg', 1, 159000),
-- 5013 shipping: The Phoenix Project
(6028, 5013, 3005, N'The Phoenix Project',                    'https://m.media-amazon.com/images/I/914-sUgELZL._AC_UF1000,1000_QL80_.jpg', 1, 189000),
-- 5014 delivered: Mắt biếc + Nhà giả kim + Tôi thấy hoa vàng
(6029, 5014, 3008, N'Mắt biếc',                               'https://library.phenikaa-uni.edu.vn/sites/default/files/Review-sach-Mat-biec-Nguyen-Nhat-Anh.jpg', 1, 139000),
(6030, 5014, 3010, N'Nhà giả kim',                            'https://hd1.hotdeal.vn/images/uploads/2016/Thang%206/09/265266/265266-nha-gia-kim-0-body%20%281%29.jpg', 1, 149000),
(6031, 5014, 3009, N'Tôi thấy hoa vàng trên cỏ xanh',        'https://upload.wikimedia.org/wikipedia/vi/3/3d/T%C3%B4i_th%E1%BA%A5y_hoa_v%C3%A0ng_tr%C3%AAn_c%E1%BB%8F_xanh.jpg', 1, 129000),
-- 5015 confirmed: Design Patterns + Atomic Habits + Đắc nhân tâm
(6032, 5015, 3007, N'Design Patterns',                        'https://m.media-amazon.com/images/S/aplus-media-library-service-media/f9e255ba-6512-410c-b6c7-f545d8a65992.__CR197,0,1105,1383_PT0_SX362_V1___.jpg', 1, 229000),
(6033, 5015, 3002, N'Atomic Habits',                          'https://storage.ghost.io/c/1b/54/1b54d596-eb39-4219-9d73-be25167375fe/content/images/size/w2000/2024/02/image_67203329.JPG', 1, 159000),
(6034, 5015, 3015, N'Đắc nhân tâm',                          'https://nxbhcm.com.vn/Image/Biasach/dacnhantam86.jpg', 1, 139000),
-- 5016 pending: Dune
(6035, 5016, 3011, N'Dune',                                   'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/hostedimages/1649161732i/32773948._SY540_.jpg', 1, 169000),
-- 5017 delivered: Sapiens x2 + Cha giàu + Tư duy nhanh và chậm
(6036, 5017, 3001, N'Sapiens: Lược sử loài người',            'https://www.netabooks.vn/Data/Sites/1/Product/12090/sapiens-luoc-su-loai-nguoi-4.jpg', 2, 199000),
(6037, 5017, 3013, N'Cha giàu cha nghèo',                     'https://cdn1.fahasa.com/media/catalog/product/c/h/cha-giau-cha-ngheo.jpg', 1, 159000),
(6038, 5017, 3004, N'Tư duy nhanh và chậm',                   'https://cdn-img-v2.mybota.vn/uploadv2/web/17/17409/news/2024/07/01/09/08/1719799368_12665.jpg', 1, 219000),
-- 5018 shipping: 1984 + Tâm lý học tội phạm
(6039, 5018, 3012, N'1984',                                   'https://images.squarespace-cdn.com/content/v1/57923bb33e00be1777423ef5/1709142941476-W1OS1PWK1WOWLQ5JKJ0T/IMG_8509.jpg', 1, 145000),
(6040, 5018, 3018, N'Tâm lý học tội phạm: Chân dung kẻ phạm tội', 'https://cdn1.fahasa.com/media/catalog/product/p/h/ph_c-h_a-ch_n-dung-k_-ph_m-t_i.jpg', 1, 169000),
-- 5019 cancelled: Atomic Habits
(6041, 5019, 3002, N'Atomic Habits',                          'https://storage.ghost.io/c/1b/54/1b54d596-eb39-4219-9d73-be25167375fe/content/images/size/w2000/2024/02/image_67203329.JPG', 1, 159000),
-- 5020 delivered: Deep Work + Dune + Đắc nhân tâm
(6042, 5020, 3003, N'Deep Work',                              'https://bizweb.dktcdn.net/thumb/grande/100/197/269/products/a-2711f783-0084-45cf-bf28-00b008da2cc3.jpg', 1, 179000),
(6043, 5020, 3011, N'Dune',                                   'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/hostedimages/1649161732i/32773948._SY540_.jpg', 1, 169000),
(6044, 5020, 3015, N'Đắc nhân tâm',                          'https://nxbhcm.com.vn/Image/Biasach/dacnhantam86.jpg', 1, 139000),
-- 5021 pending: Nhà giả kim + Thói quen lúc 5h + Đời ngắn
(6045, 5021, 3010, N'Nhà giả kim',                            'https://hd1.hotdeal.vn/images/uploads/2016/Thang%206/09/265266/265266-nha-gia-kim-0-body%20%281%29.jpg', 1, 149000),
(6046, 5021, 3016, N'Thói quen lúc 5 giờ sáng',              'https://cdn1.fahasa.com/media/catalog/product/l/a/lam_chu_binh_minh_song_doi_xuat_chung_bia1.jpg', 1, 159000),
(6047, 5021, 3017, N'Đời ngắn đừng ngủ dài',                 'https://www.netabooks.vn/Data/Sites/1/Product/24213/doi-ngan-dung-ngu-dai-3.jpg', 1, 149000),
-- 5022 confirmed: Tư duy nhanh và chậm
(6048, 5022, 3004, N'Tư duy nhanh và chậm',                   'https://cdn-img-v2.mybota.vn/uploadv2/web/17/17409/news/2024/07/01/09/08/1719799368_12665.jpg', 1, 219000),
-- 5023 delivered: Clean Code + The Phoenix Project + Tâm lý học tội phạm
(6049, 5023, 3006, N'Clean Code',                             'https://cdn1.fahasa.com/media/catalog/product/8/9/8936107813361.jpg', 1, 249000),
(6050, 5023, 3005, N'The Phoenix Project',                    'https://m.media-amazon.com/images/I/914-sUgELZL._AC_UF1000,1000_QL80_.jpg', 1, 189000),
(6051, 5023, 3018, N'Tâm lý học tội phạm: Chân dung kẻ phạm tội', 'https://cdn1.fahasa.com/media/catalog/product/p/h/ph_c-h_a-ch_n-dung-k_-ph_m-t_i.jpg', 1, 169000),
-- 5024 cancelled: Sapiens + Mắt biếc
(6052, 5024, 3001, N'Sapiens: Lược sử loài người',            'https://www.netabooks.vn/Data/Sites/1/Product/12090/sapiens-luoc-su-loai-nguoi-4.jpg', 1, 199000),
(6053, 5024, 3008, N'Mắt biếc',                               'https://library.phenikaa-uni.edu.vn/sites/default/files/Review-sach-Mat-biec-Nguyen-Nhat-Anh.jpg', 1, 139000),
-- 5025 shipping: 1984 + Khởi nghiệp tinh gọn + Atomic Habits
(6054, 5025, 3012, N'1984',                                   'https://images.squarespace-cdn.com/content/v1/57923bb33e00be1777423ef5/1709142941476-W1OS1PWK1WOWLQ5JKJ0T/IMG_8509.jpg', 1, 145000),
(6055, 5025, 3014, N'Khởi nghiệp tinh gọn',                  'https://nhasachbaoanh.com/wp-content/uploads/2022/06/khoi-nghiep-tinh-gon-1.jpg', 1, 189000),
(6056, 5025, 3002, N'Atomic Habits',                          'https://storage.ghost.io/c/1b/54/1b54d596-eb39-4219-9d73-be25167375fe/content/images/size/w2000/2024/02/image_67203329.JPG', 1, 159000),
-- 5026 delivered: The Phoenix Project
(6057, 5026, 3005, N'The Phoenix Project',                    'https://m.media-amazon.com/images/I/914-sUgELZL._AC_UF1000,1000_QL80_.jpg', 1, 189000),
-- 5027 confirmed: Tôi thấy hoa vàng + Đắc nhân tâm
(6058, 5027, 3009, N'Tôi thấy hoa vàng trên cỏ xanh',        'https://upload.wikimedia.org/wikipedia/vi/3/3d/T%C3%B4i_th%E1%BA%A5y_hoa_v%C3%A0ng_tr%C3%AAn_c%E1%BB%8F_xanh.jpg', 1, 129000),
(6059, 5027, 3015, N'Đắc nhân tâm',                          'https://nxbhcm.com.vn/Image/Biasach/dacnhantam86.jpg', 1, 139000),
-- 5028 delivered: Design Patterns + Dune + Cha giàu
(6060, 5028, 3007, N'Design Patterns',                        'https://m.media-amazon.com/images/S/aplus-media-library-service-media/f9e255ba-6512-410c-b6c7-f545d8a65992.__CR197,0,1105,1383_PT0_SX362_V1___.jpg', 1, 229000),
(6061, 5028, 3011, N'Dune',                                   'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/hostedimages/1649161732i/32773948._SY540_.jpg', 1, 169000),
(6062, 5028, 3013, N'Cha giàu cha nghèo',                     'https://cdn1.fahasa.com/media/catalog/product/c/h/cha-giau-cha-ngheo.jpg', 1, 159000),
-- 5029 pending: Mắt biếc
(6063, 5029, 3008, N'Mắt biếc',                               'https://library.phenikaa-uni.edu.vn/sites/default/files/Review-sach-Mat-biec-Nguyen-Nhat-Anh.jpg', 1, 139000),
-- 5030 cancelled: Sapiens x2 + Tư duy nhanh + Clean Code
(6064, 5030, 3001, N'Sapiens: Lược sử loài người',            'https://www.netabooks.vn/Data/Sites/1/Product/12090/sapiens-luoc-su-loai-nguoi-4.jpg', 2, 199000),
(6065, 5030, 3004, N'Tư duy nhanh và chậm',                   'https://cdn-img-v2.mybota.vn/uploadv2/web/17/17409/news/2024/07/01/09/08/1719799368_12665.jpg', 1, 219000),
(6066, 5030, 3006, N'Clean Code',                             'https://cdn1.fahasa.com/media/catalog/product/8/9/8936107813361.jpg', 1, 249000);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

INSERT INTO order_status_history (id, order_id, status, changed_at, note) VALUES
-- 5011 delivered
(7028, 5011, 'pending',   DATE_SUB(NOW(), INTERVAL 25 DAY), N'Đặt hàng thành công'),
(7029, 5011, 'confirmed', DATE_SUB(NOW(), INTERVAL 24 DAY), N'Cửa hàng đã xác nhận'),
(7030, 5011, 'shipping',  DATE_SUB(NOW(), INTERVAL 23 DAY), N'Đang trên đường giao'),
(7031, 5011, 'delivered', DATE_SUB(NOW(), INTERVAL 22 DAY), N'Giao hàng thành công'),
-- 5012 delivered
(7032, 5012, 'pending',   DATE_SUB(NOW(), INTERVAL 28 DAY), N'Đặt hàng thành công'),
(7033, 5012, 'confirmed', DATE_SUB(NOW(), INTERVAL 27 DAY), N'Cửa hàng đã xác nhận'),
(7034, 5012, 'shipping',  DATE_SUB(NOW(), INTERVAL 26 DAY), N'Đang trên đường giao'),
(7035, 5012, 'delivered', DATE_SUB(NOW(), INTERVAL 25 DAY), N'Giao hàng thành công'),
-- 5013 shipping (đang giao, chưa xong)
(7036, 5013, 'pending',   DATE_SUB(NOW(), INTERVAL 3  DAY), N'Đặt hàng thành công'),
(7037, 5013, 'confirmed', DATE_SUB(NOW(), INTERVAL 2  DAY), N'Cửa hàng đã xác nhận'),
(7038, 5013, 'shipping',  DATE_SUB(NOW(), INTERVAL 1  DAY), N'Đang trên đường giao'),
-- 5014 delivered
(7039, 5014, 'pending',   DATE_SUB(NOW(), INTERVAL 35 DAY), N'Đặt hàng thành công'),
(7040, 5014, 'confirmed', DATE_SUB(NOW(), INTERVAL 34 DAY), N'Cửa hàng đã xác nhận'),
(7041, 5014, 'shipping',  DATE_SUB(NOW(), INTERVAL 33 DAY), N'Đang trên đường giao'),
(7042, 5014, 'delivered', DATE_SUB(NOW(), INTERVAL 32 DAY), N'Giao hàng thành công'),
-- 5015 confirmed (chờ lấy hàng)
(7043, 5015, 'pending',   DATE_SUB(NOW(), INTERVAL 2  DAY), N'Đặt hàng thành công'),
(7044, 5015, 'confirmed', DATE_SUB(NOW(), INTERVAL 1  DAY), N'Cửa hàng đã xác nhận'),
-- 5016 pending (mới đặt)
(7045, 5016, 'pending',   NOW(),                             N'Đặt hàng thành công'),
-- 5017 delivered
(7046, 5017, 'pending',   DATE_SUB(NOW(), INTERVAL 45 DAY), N'Đặt hàng thành công'),
(7047, 5017, 'confirmed', DATE_SUB(NOW(), INTERVAL 44 DAY), N'Cửa hàng đã xác nhận'),
(7048, 5017, 'shipping',  DATE_SUB(NOW(), INTERVAL 43 DAY), N'Đang trên đường giao'),
(7049, 5017, 'delivered', DATE_SUB(NOW(), INTERVAL 42 DAY), N'Giao hàng thành công'),
-- 5018 shipping
(7050, 5018, 'pending',   DATE_SUB(NOW(), INTERVAL 4  DAY), N'Đặt hàng thành công'),
(7051, 5018, 'confirmed', DATE_SUB(NOW(), INTERVAL 3  DAY), N'Cửa hàng đã xác nhận'),
(7052, 5018, 'shipping',  DATE_SUB(NOW(), INTERVAL 2  DAY), N'Đang trên đường giao'),
-- 5019 cancelled
(7053, 5019, 'pending',   DATE_SUB(NOW(), INTERVAL 52 DAY), N'Đặt hàng thành công'),
(7054, 5019, 'cancelled', DATE_SUB(NOW(), INTERVAL 51 DAY), N'Khách huỷ do đặt nhầm địa chỉ'),
-- 5020 delivered
(7055, 5020, 'pending',   DATE_SUB(NOW(), INTERVAL 55 DAY), N'Đặt hàng thành công'),
(7056, 5020, 'confirmed', DATE_SUB(NOW(), INTERVAL 54 DAY), N'Cửa hàng đã xác nhận'),
(7057, 5020, 'shipping',  DATE_SUB(NOW(), INTERVAL 53 DAY), N'Đang trên đường giao'),
(7058, 5020, 'delivered', DATE_SUB(NOW(), INTERVAL 52 DAY), N'Giao hàng thành công'),
-- 5021 pending (mới đặt)
(7059, 5021, 'pending',   NOW(),                             N'Đặt hàng thành công'),
-- 5022 confirmed
(7060, 5022, 'pending',   DATE_SUB(NOW(), INTERVAL 1  DAY), N'Đặt hàng thành công'),
(7061, 5022, 'confirmed', DATE_SUB(NOW(), INTERVAL 1  DAY), N'Cửa hàng đã xác nhận'),
-- 5023 delivered
(7062, 5023, 'pending',   DATE_SUB(NOW(), INTERVAL 65 DAY), N'Đặt hàng thành công'),
(7063, 5023, 'confirmed', DATE_SUB(NOW(), INTERVAL 64 DAY), N'Cửa hàng đã xác nhận'),
(7064, 5023, 'shipping',  DATE_SUB(NOW(), INTERVAL 63 DAY), N'Đang trên đường giao'),
(7065, 5023, 'delivered', DATE_SUB(NOW(), INTERVAL 62 DAY), N'Giao hàng thành công'),
-- 5024 cancelled
(7066, 5024, 'pending',   DATE_SUB(NOW(), INTERVAL 68 DAY), N'Đặt hàng thành công'),
(7067, 5024, 'cancelled', DATE_SUB(NOW(), INTERVAL 67 DAY), N'Huỷ do hết hàng'),
-- 5025 shipping
(7068, 5025, 'pending',   DATE_SUB(NOW(), INTERVAL 5  DAY), N'Đặt hàng thành công'),
(7069, 5025, 'confirmed', DATE_SUB(NOW(), INTERVAL 4  DAY), N'Cửa hàng đã xác nhận'),
(7070, 5025, 'shipping',  DATE_SUB(NOW(), INTERVAL 3  DAY), N'Đang trên đường giao'),
-- 5026 delivered
(7071, 5026, 'pending',   DATE_SUB(NOW(), INTERVAL 75 DAY), N'Đặt hàng thành công'),
(7072, 5026, 'confirmed', DATE_SUB(NOW(), INTERVAL 74 DAY), N'Cửa hàng đã xác nhận'),
(7073, 5026, 'shipping',  DATE_SUB(NOW(), INTERVAL 73 DAY), N'Đang trên đường giao'),
(7074, 5026, 'delivered', DATE_SUB(NOW(), INTERVAL 72 DAY), N'Giao hàng thành công'),
-- 5027 confirmed
(7075, 5027, 'pending',   DATE_SUB(NOW(), INTERVAL 2  DAY), N'Đặt hàng thành công'),
(7076, 5027, 'confirmed', DATE_SUB(NOW(), INTERVAL 1  DAY), N'Cửa hàng đã xác nhận'),
-- 5028 delivered
(7077, 5028, 'pending',   DATE_SUB(NOW(), INTERVAL 85 DAY), N'Đặt hàng thành công'),
(7078, 5028, 'confirmed', DATE_SUB(NOW(), INTERVAL 84 DAY), N'Cửa hàng đã xác nhận'),
(7079, 5028, 'shipping',  DATE_SUB(NOW(), INTERVAL 83 DAY), N'Đang trên đường giao'),
(7080, 5028, 'delivered', DATE_SUB(NOW(), INTERVAL 82 DAY), N'Giao hàng thành công'),
-- 5029 pending (mới đặt)
(7081, 5029, 'pending',   NOW(),                             N'Đặt hàng thành công'),
-- 5030 cancelled
(7082, 5030, 'pending',   DATE_SUB(NOW(), INTERVAL 90 DAY), N'Đặt hàng thành công'),
(7083, 5030, 'cancelled', DATE_SUB(NOW(), INTERVAL 89 DAY), N'Huỷ do thanh toán thất bại');

-- ============================================================
-- AUTO INCREMENT
-- ============================================================
ALTER TABLE users                AUTO_INCREMENT = 1007;
ALTER TABLE books                AUTO_INCREMENT = 3019;
ALTER TABLE reviews              AUTO_INCREMENT = 8064;
ALTER TABLE review_replies       AUTO_INCREMENT = 9006;
ALTER TABLE orders               AUTO_INCREMENT = 5031;
ALTER TABLE order_items          AUTO_INCREMENT = 6067;
ALTER TABLE order_status_history AUTO_INCREMENT = 7084;

SET FOREIGN_KEY_CHECKS = 1;