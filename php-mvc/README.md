# PHP MVC version (XAMPP)

Đây là phiên bản PHP OOP + MVC mới, được thêm độc lập trong thư mục `php-mvc/`. Mã nguồn hiện có trong `backend/` (Python/FastAPI) và `frontend/` (Next.js/TypeScript) được giữ nguyên; cơ sở dữ liệu PHP dùng tên riêng `online_book_store_php` để tránh ghi đè database hiện tại.

## Chạy trên XAMPP

1. Sao chép thư mục `php-mvc` vào `C:\xampp\htdocs\php-mvc`.
2. Mở XAMPP Control Panel và khởi động Apache, MySQL.
3. Vào `http://localhost/phpmyadmin`, chọn Import và import `php-mvc/database/schema.sql`.
4. Kiểm tra cấu hình MySQL trong `php-mvc/config/database.php` (mặc định user `root`, mật khẩu rỗng).
5. Mở `http://localhost/php-mvc/public/`.

Không cần Composer. PHP cần bật extension `pdo_mysql` trong cấu hình XAMPP.

## Tạo admin

1. Tạo tài khoản thường tại trang Đăng ký.
2. Trong phpMyAdmin, chạy lệnh sau và thay email bằng email tài khoản của bạn:

```sql
UPDATE users SET role = 'admin' WHERE email = 'email-cua-ban@example.com';
```

## Tính năng hiện có

- Đăng ký, đăng nhập, đăng xuất; mật khẩu được lưu bằng `password_hash`.
- Danh sách sách, tìm kiếm, trang chi tiết.
- Giỏ hàng session; tạo đơn hàng trong transaction và kiểm tra/cập nhật tồn kho.
- Danh sách đơn hàng và trang quản trị thêm sách.
- PDO prepared statements, MVC cơ bản và kiểm tra CSRF cho form ghi dữ liệu.

Đây là nền tảng PHP độc lập ban đầu; các tính năng nâng cao của ứng dụng Python hiện tại như review, phân quyền quản trị chi tiết và tracking đơn hàng chưa được chuyển đầy đủ. Có thể phát triển tiếp mà không làm mất phiên bản Python.
