<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $search = trim((string) ($_GET['search'] ?? ''));
        $this->render('home/index', [
            'title' => 'Sách mới nhất',
            'books' => (new Book())->all($search),
            'search' => $search,
        ]);
    }
}
