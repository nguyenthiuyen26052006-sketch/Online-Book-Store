import { PageHero } from '@/components/layout/page-hero';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chính sách bảo mật</h1>
        <p className="mt-2 text-muted-foreground">Chúng tôi tôn trọng quyền riêng tư và bảo vệ thông tin cá nhân của bạn.</p>
      </div>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-muted-foreground sm:px-6 lg:px-8">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Thu thập thông tin</h2>
          <p className="leading-relaxed">
            Chúng tôi thu thập họ tên, email, số điện thoại, địa chỉ giao hàng khi bạn đăng ký hoặc đặt hàng
            nhằm xử lý đơn và liên hệ hỗ trợ.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Sử dụng thông tin</h2>
          <p className="leading-relaxed">
            Dữ liệu được dùng để xác nhận đơn hàng, giao sách, gửi thông báo trạng thái và cải thiện trải nghiệm
            mua sắm. Chúng tôi không bán thông tin cho bên thứ ba.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Bảo mật</h2>
          <p className="leading-relaxed">
            Mật khẩu được mã hóa. Giao dịch và dữ liệu nhạy cảm được bảo vệ theo tiêu chuẩn an toàn phổ biến.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Quyền của bạn</h2>
          <p className="leading-relaxed">
            Bạn có thể yêu cầu cập nhật hoặc xóa thông tin cá nhân bằng cách liên hệ qua trang Liên hệ.
          </p>
        </section>
        </div>
    </div>
  );
}
