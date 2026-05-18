'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { profileSchema, type ProfileFormData } from '@/validators';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }
      const updatedUser = await authService.updateProfile(token, data);
      setUser(updatedUser);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Tài khoản của tôi</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Vai trò: {user.role}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">
                      <User className="mr-2 inline h-4 w-4" />
                      Họ và tên
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Nhập họ và tên của bạn"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="mr-2 inline h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="mr-2 inline h-4 w-4" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="0901234567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">
                      <MapPin className="mr-2 inline h-4 w-4" />
                      Địa chỉ
                    </Label>
                    <Textarea
                      id="address"
                      {...register('address')}
                      placeholder="Nhập địa chỉ của bạn"
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading || !isDirty}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
              <CardDescription>
                Quản lý mật khẩu và các cài đặt bảo mật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Đổi mật khẩu</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Tính năng này đang được phát triển
                </p>
                <Button disabled>Đổi mật khẩu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}