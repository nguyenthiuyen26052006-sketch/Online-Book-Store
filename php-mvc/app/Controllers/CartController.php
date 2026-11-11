<?php

class BookController extends Controller
{
    public function index(): void
    {
        $search = trim((string) ($_GET['search'] ?? ''));
        $this->render('books/index', ['title' => 'Danh sách sách', 'books' => (new Book())->all($search), 'search' => $search]);
    }

    public function detail(string $id): void
    {
        $book = (new Book())->find((int) $id);
        if (!$book) {
            http_response_code(404);
            $this->render('errors/404');
            return;
        }
        $this->render('books/detail', ['title' => $book['title'], 'book' => $book]);
    }
}
