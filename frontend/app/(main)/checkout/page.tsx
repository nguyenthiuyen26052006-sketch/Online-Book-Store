'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { orderService } from '@/services/order.service';
import { checkoutSchema, type CheckoutFormData } from '@/validators';
import { formatCurrency } from '@/utils/helpers';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      paymentMethod: 'cod',
      note: '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [isAuthenticated, items.length, orderSuccess, router]);

  if (!isAuthenticated || (items.length === 0 && !orderSuccess)) return null;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const order = await orderService.create({
        userId: user.id,
        items,
        shippingAddress: data.address,
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        note: data.note,
      });
      setOrderId(order.id);
      setOrderSuccess(true);
      clearCart();
      localStorage.removeItem('bookstore-cart');
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      console.error('Không thể tạo đơn hàng:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Đặt hàng thành công!</h1>
        <p className="mb-2 text-muted-foreground">Cảm ơn bạn đã mua sách tại BookStore</p>
        <p className="mb-8 text-sm text-muted-foreground">
          Mã đơn hàng: <span className="font-mono font-semibold">{orderId}</span>
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/profile/orders">
            <Button>Xem đơn hàng</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Tiếp tục mua sắm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại giỏ hàng
        </Link>
        <h1 className="text-3xl font-bold">Thanh toán</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Thông tin giao hàng */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên người nhận *</Label>
                  <Input id="name" {...register('name')} placeholder="Nhập tên người nhận" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input id="phone" {...register('phone')} placeholder="Nhập số điện thoại" />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                  <Textarea id="address" {...register('address')} placeholder="Nhập địa chỉ đầy đủ" rows={3} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea id="note" {...register('note')} placeholder="Ghi chú đơn hàng (không bắt buộc)" rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Phương thức thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setValue('paymentMethod', value as 'cod' | 'banking')}
                  className="space-y-3"
                >
                  <div className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex flex-1 cursor-pointer items-center gap-3">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-sm text-muted-foreground">Trả tiền mặt khi nhận được đơn hàng</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                    <RadioGroupItem value="banking" id="banking" />
                    <Label htmlFor="banking" className="flex flex-1 cursor-pointer items-center gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Chuyển khoản ngân hàng</p>
                        <p className="text-sm text-muted-foreground">Thanh toán qua tài khoản ngân hàng</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-destructive">{errors.paymentMethod.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.book.id} className="flex gap-3">
                      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={item.book.image}
                          alt={item.book.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="line-clamp-2 font-medium">{item.book.title}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(item.book.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-lg text-primary">{formatCurrency(getTotalPrice())}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}