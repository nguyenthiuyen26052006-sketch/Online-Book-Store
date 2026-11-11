<?php

abstract class Controller
{
    protected function render(string $view, array $data = []): void
    {
        View::render($view, $data);
    }

    protected function redirect(string $route): never
    {
        header('Location: ' . BASE_URL . '/?r=' . rawurlencode($route));
        exit;
    }

    protected function requireLogin(): array
    {
        $user = Auth::user();
        if (!$user) {
            $this->redirect('auth/login');
        }
        return $user;
    }

    protected function requireAdmin(): array
    {
        $user = $this->requireLogin();
        if (!in_array($user['role'], ['admin', 'super_admin'], true)) {
            http_response_code(403);
            exit('Bạn không có quyền truy cập.');
        }
        return $user;
    }
}
