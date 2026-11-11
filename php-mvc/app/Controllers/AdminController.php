<?php

class OrderController extends Controller
{
    public function index(): void
    {
        $user = $this->requireLogin();
        $this->render('orders/index', ['title' => 'Đơn hàng', 'orders' => (new Order())->forUser((int) $user['id'])]);
    }

    public function create(): void
    {
        $user = $this->requireLogin();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            Auth::verifyCsrf();
            try {
                $orderId = (new Order())->checkout((int) $user['id'], $_SESSION['cart'] ?? [], [
                    'address' => trim((string) ($_POST['address'] ?? '')),
                    'phone' => trim((string) ($_POST['phone'] ?? '')),
                    'payment' => trim((string) ($_POST['payment_method'] ?? 'cod')),
                    'note' => trim((string) ($_POST['note'] ?? '')),
                ]);
                unset($_SESSION['cart']);
                $this->redirect('orders/detail/' . $orderId);
            } catch (RuntimeException $error) {
                $this->render('orders/checkout', ['title' => 'Thanh toán', 'error' => $error->getMessage()]);
                return;
            }
        }
        $this->render('orders/checkout', ['title' => 'Thanh toán']);
    }

    public function detail(string $id): void
    {
        $user = $this->requireLogin();
        $order = (new Order())->findForUser((int) $id, (int) $user['id']);
        if (!$order) {
            http_response_code(404);
            $this->render('errors/404');
            return;
        }
        $this->render('orders/detail', ['title' => 'Chi tiết đơn hàng', 'order' => $order, 'items' => (new Order())->items((int) $id)]);
    }
}
