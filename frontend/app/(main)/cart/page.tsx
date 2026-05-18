'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { cartService } from '@/services/cart.service';
import { formatCurrency } from '@/utils/helpers';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, setItems, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCart = async () => {
      try {
        // Only sync with backend if local cart is empty
        // This preserves locally added items while syncing authenticated user's backend cart
        if (items.length === 0) {
          const backendItems = await cartService.getMyCart();
          if (backendItems.length > 0) {
            setItems(backendItems);
          }
        }
      } catch (error) {
        console.error('Cart sync error:', error);
        // Don't show error toast to avoid annoying users
      }
    };

    loadCart();
  }, [isAuthenticated]);

  const handleRemove = async (bookId: string, title: string, cartItemId?: string) => {
    try {
      if (isAuthenticated && cartItemId) {
        await cartService.removeItem(cartItemId);
      }
      removeItem(bookId);
      toast.success('Đã xóa khỏi giỏ hàng', { description: title });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa sản phẩm');
    }
  };

  const handleQuantityChange = async (
    bookId: string,
    title: string,
    quantity: number,
    cartItemId?: string,
  ) => {
    try {
      if (quantity <= 0) {
        await handleRemove(bookId, title, cartItemId);
        return;
      }
      if (isAuthenticated && cartItemId) {
        await cartService.updateQuantity(cartItemId, quantity);
      }
      updateQuantity(bookId, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật số lượng');
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="mb-6 text-muted-foreground">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link href="/products">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Giỏ hàng</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Danh sách sản phẩm */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {items.map((item) => (
                <div key={item.book.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/products/${item.book.slug}`}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={item.book.image}
                      alt={item.book.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <Link href={`/products/${item.book.slug}`} className="font-medium hover:text-primary">
                      {item.book.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.book.author}</p>
                    <p className="mt-1 font-semibold text-primary">{formatCurrency(item.book.price)}</p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.book.id, item.book.title, item.quantity - 1, item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.book.id, item.book.title, item.quantity + 1, item.id)}
                          disabled={item.quantity >= item.book.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.book.id, item.book.title, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span className="text-lg text-primary">{formatCurrency(getTotalPrice())}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isAuthenticated ? (
                <Link href="/checkout" className="w-full">
                  <Button size="lg" className="w-full">Tiến hành thanh toán</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login?redirect=/checkout" className="w-full">
                    <Button size="lg" className="w-full">Đăng nhập để thanh toán</Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground">
                    Hoặc{' '}
                    <Link href="/register" className="text-primary hover:underline">
                      tạo tài khoản mới
                    </Link>
                  </p>
                </>
              )}
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}