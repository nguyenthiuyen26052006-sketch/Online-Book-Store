'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { superAdminService } from '@/services/super-admin.service';
import type { Book } from '@/types';
import { formatCurrency } from '@/utils/helpers';

export default function SuperAdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    superAdminService.getAllBooks().then(setBooks);
  }, []);

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>Quản lý sách toàn hệ thống</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn kho</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{formatCurrency(book.price)}</TableCell>
                <TableCell>{book.stock}</TableCell>
              </TableRow>
            ))}
            {!books.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Chưa có sách trong hệ thống.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
