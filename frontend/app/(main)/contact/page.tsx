'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Đã gửi tin nhắn', {
        description: 'Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.',
      });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Liên hệ</h1>
        <p className="mt-2 text-muted-foreground">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>79 Hồ Tùng Mậu, Từ Liêm, Hà Nội</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <span>0901 234 567 (8:00 – 21:00)</span>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <span>contact@bookstore.vn</span>
            </li>
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" required placeholder="Nguyễn Văn A" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required placeholder="Nhập địa chỉ email" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="message">Nội dung</Label>
            <Textarea id="message" required rows={5} placeholder="Nội dung tin nhắn..." className="mt-2 min-h-30" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Button>
        </form>
      </div>
    </div>
  );
}
