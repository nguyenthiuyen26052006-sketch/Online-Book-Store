<?php

class Order extends Model
{
    public function forUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC');
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function findForUser(int $id, int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1');
        $stmt->execute([$id, $userId]);
        return $stmt->fetch() ?: null;
    }

    public function items(int $orderId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public function checkout(int $userId, array $cart, array $delivery): int
    {
        if (!$cart) {
            throw new RuntimeException('Giỏ hàng đang trống.');
        }

        $this->db->beginTransaction();
        try {
            $products = [];
            $total = 0.0;
            $lock = $this->db->prepare('SELECT * FROM books WHERE id = ? FOR UPDATE');
            foreach ($cart as $bookId => $quantity) {
                $lock->execute([(int) $bookId]);
                $book = $lock->fetch();
                $quantity = max(1, (int) $quantity);
                if (!$book || (int) $book['stock'] < $quantity) {
                    throw new RuntimeException('Sách không tồn tại hoặc số lượng tồn kho không đủ.');
                }
                $products[] = [$book, $quantity];
                $total += (float) $book['price'] * $quantity;
            }

            $stmt = $this->db->prepare('INSERT INTO orders (user_id, total_amount, status, shipping_address, phone, payment_method, note) VALUES (?, ?, \'pending\', ?, ?, ?, ?)');
            $stmt->execute([$userId, $total, $delivery['address'], $delivery['phone'], $delivery['payment'], $delivery['note']]);
            $orderId = (int) $this->db->lastInsertId();

            $insert = $this->db->prepare('INSERT INTO order_items (order_id, book_id, title, image, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?, ?)');
            $stock = $this->db->prepare('UPDATE books SET stock = stock - ? WHERE id = ?');
            foreach ($products as [$book, $quantity]) {
                $insert->execute([$orderId, $book['id'], $book['title'], $book['image'], $quantity, $book['price']]);
                $stock->execute([$quantity, $book['id']]);
            }

            $this->db->commit();
            return $orderId;
        } catch (Throwable $error) {
            $this->db->rollBack();
            throw $error;
        }
    }
}
