<?php

class Book extends Model
{
    public function all(string $search = ''): array
    {
        if ($search !== '') {
            $stmt = $this->db->prepare('SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY id DESC');
            $term = '%' . $search . '%';
            $stmt->execute([$term, $term]);
            return $stmt->fetchAll();
        }

        return $this->db->query('SELECT * FROM books ORDER BY id DESC')->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM books WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data, int $adminId): void
    {
        $stmt = $this->db->prepare('INSERT INTO books (uuid, title, slug, author, description, price, image, category_id, admin_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            bin2hex(random_bytes(16)), $data['title'], $data['slug'], $data['author'],
            $data['description'] ?: null, $data['price'], $data['image'] ?: null,
            $data['category_id'] ?: null, $adminId, $data['stock'],
        ]);
    }
}
