<?php

class CartController extends Controller
{
    public function index(): void
    {
        $items = [];
        $total = 0.0;
        foreach ($_SESSION['cart'] ?? [] as $id => $quantity) {
            $book = (new Book())->find((int) $id);
            if (!$book) continue;
            $quantity = max(1, (int) $quantity);
            $items[] = ['book' => $book, 'quantity' => $quantity];
            $total += (float) $book['price'] * $quantity;
        }
        $this->render('cart/index', ['title' => 'Giỏ hàng', 'items' => $items, 'total' => $total]);
    }

    public function add(string $id): void
    {
        $book = (new Book())->find((int) $id);
        if ($book && (int) $book['stock'] > 0) {
            $cart = $_SESSION['cart'] ?? [];
            $cart[(int) $id] = min((int) $book['stock'], ($cart[(int) $id] ?? 0) + 1);
            $_SESSION['cart'] = $cart;
        }
        $this->redirect('cart');
    }

    public function remove(string $id): void
    {
        Auth::verifyCsrf();
        unset($_SESSION['cart'][(int) $id]);
        $this->redirect('cart');
    }
}
