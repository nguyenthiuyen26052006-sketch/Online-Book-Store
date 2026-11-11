<?php

class AdminController extends Controller
{
    public function index(): void
    {
        $this->requireAdmin();
        $this->render('admin/index', ['title' => 'Quản lý sách', 'books' => (new Book())->all()]);
    }

    public function addBook(): void
    {
        $admin = $this->requireAdmin();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->render('admin/add-book', ['title' => 'Thêm sách']);
            return;
        }
        Auth::verifyCsrf();
        $title = trim((string) ($_POST['title'] ?? ''));
        $author = trim((string) ($_POST['author'] ?? ''));
        $price = filter_var($_POST['price'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($title === '' || $author === '' || $price === false || $price < 0) {
            $this->render('admin/add-book', ['title' => 'Thêm sách', 'error' => 'Thông tin sách không hợp lệ.']);
            return;
        }
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title)), '-'));
        (new Book())->create([
            'title' => $title,
            'slug' => $slug . '-' . bin2hex(random_bytes(3)),
            'author' => $author,
            'description' => trim((string) ($_POST['description'] ?? '')),
            'price' => $price,
            'image' => trim((string) ($_POST['image'] ?? '')),
            'category_id' => null,
            'stock' => max(0, (int) ($_POST['stock'] ?? 0)),
        ], (int) $admin['id']);
        $this->redirect('admin');
    }
}
