import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Vui lòng nhập họ tên')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không trùng khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Checkout Schema
export const checkoutSchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  address: z
    .string()
    .min(1, 'Vui lòng nhập địa chỉ')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  paymentMethod: z.enum(['cod', 'banking'], {
    required_error: 'Vui lòng chọn phương thức thanh toán',
  }),
  note: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Profile Update Schema
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
  address: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Book Schema (Admin)
export const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Vui lòng nhập tiêu đề sách')
    .min(2, 'Tiêu đề phải có ít nhất 2 ký tự'),
  author: z
    .string()
    .min(1, 'Vui lòng nhập tên tác giả'),
  price: z
    .number({ invalid_type_error: 'Giá phải là số' })
    .min(1000, 'Giá phải lớn hơn 1.000 VND'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z
    .string()
    .min(1, 'Vui lòng nhập mô tả')
    .min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  stock: z
    .number({ invalid_type_error: 'Kho hàng phải là số' })
    .min(0, 'Kho hàng không thể âm'),
  image: z.string().min(1, 'Vui lòng nhập URL hình ảnh'),
});

export type BookFormData = z.infer<typeof bookSchema>;

// Category Schema (Admin)
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên danh mục')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
