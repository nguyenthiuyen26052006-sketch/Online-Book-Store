<?php

final class View
{
    public static function render(string $view, array $data = []): void
    {
        $file = APP_ROOT . '/app/Views/' . $view . '.php';
        if (!is_file($file)) {
            http_response_code(404);
            echo 'Không tìm thấy trang.';
            return;
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $file;
        $content = ob_get_clean();
        $title = $title ?? 'Online Book Store';
        require APP_ROOT . '/app/Views/layout.php';
    }

    public static function escape(?string $value): string
    {
        return htmlspecialchars($value ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
