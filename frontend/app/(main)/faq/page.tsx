import { PageHero } from '@/components/layout/page-hero';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Làm sao để đặt hàng?',
    a: 'Chọn sách, thêm vào giỏ hàng, điền thông tin giao hàng và xác nhận đơn. Bạn có thể thanh toán COD hoặc chuyển khoản.',
  },
  {
    q: 'Thời gian giao hàng bao lâu?',
    a: 'Nội thành TP.HCM: 1–2 ngày làm việc. Các tỉnh thành khác: 3–5 ngày làm việc tùy đơn vị vận chuyển.',
  },
  {
    q: 'Tôi có thể đổi hoặc trả sách không?',
    a: 'Sách nguyên vẹn, chưa sử dụng có thể đổi/trả trong 7 ngày kể từ khi nhận hàng (trừ sách đặt riêng theo yêu cầu).',
  },
  {
    q: 'Làm sao theo dõi đơn hàng?',
    a: 'Đăng nhập tài khoản, vào mục Đơn hàng của tôi để xem trạng thái và lịch sử cập nhật giao hàng.',
  },
  {
    q: 'Tôi có thể đánh giá sách sau khi mua không?',
    a: 'Có. Mỗi tài khoản có thể đánh giá một lần cho mỗi cuốn sách đã mua hoặc trải nghiệm.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Câu hỏi thường gặp</h1>
        <p className="mt-2 text-muted-foreground">Giải đáp nhanh các thắc mắc về đặt hàng, giao hàng và dịch vụ.</p>
      </div>
      
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="rounded-xl border bg-card px-2 shadow-sm transition-shadow hover:shadow-md"
            >
              <AccordionTrigger className="px-4 py-5 text-left text-base font-semibold hover:no-underline sm:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5 text-base leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}