import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  store: [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sản phẩm', href: '/products' },
    { label: 'Giỏ hàng', href: '/cart' },
    { label: 'Tài khoản', href: '/profile' },
  ],
  info: [
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
  ],
  categories: [
    { label: 'Tiểu thuyết', href: '/products?category=tieu-thuyet' },
    { label: 'Lập trình', href: '/products?category=lap-trinh' },
    { label: 'Kinh doanh', href: '/products?category=kinh-doanh' },
    { label: 'Bán chạy', href: '/products?sort=bestseller' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Nhà Sách</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mang đến những đầu sách chất lượng cùng trải nghiệm mua sắm tiện lợi, nhanh chóng và đáng tin cậy.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Cửa hàng</h3>
            <ul className="space-y-2">
              {footerLinks.store.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Thông tin</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                79 Hồ Tùng Mậu, Từ Liêm, Hà Nội
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                0901 234 567
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                contact@bookstore.vn
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nhà Sách. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
