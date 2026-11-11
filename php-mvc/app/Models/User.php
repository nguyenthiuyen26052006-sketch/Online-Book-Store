<?php

class User extends Model
{
    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function register(string $name, string $email, string $password): int
    {
        $stmt = $this->db->prepare('INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        return (int) $this->db->lastInsertId();
    }
}
