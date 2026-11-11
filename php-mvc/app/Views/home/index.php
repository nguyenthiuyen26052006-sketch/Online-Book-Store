<?php
$user = Auth::user();
$e = [View::class, 'escape'];
?>
<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $e($title) ?> | Online Book Store</title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/style.css">
</head>
<body>
<header class="header"><div class="wrap nav">
    <a class="brand" href="<?= BASE_URL ?>/?r=home">Book Store</a>
    <nav><a href="<?= BASE_URL ?>/?r=books">Sách</a><a href="<?= BASE_URL ?>/?r=cart">Giỏ hàng</a>
    <?php if ($user): ?><a href="<?= BASE_URL ?>/?r=orders">Đơn hàng</a><?php endif; ?>
    <?php if ($user && in_array($user['role'], ['admin', 'super_admin'], true)): ?><a href="<?= BASE_URL ?>/?r=admin">Quản trị</a><?php endif; ?></nav>
    <div><?php if ($user): ?><span><?= $e($user['name']) ?></span> · <a href="<?= BASE_URL ?>/?r=auth/logout">Đăng xuất</a><?php else: ?><a href="<?= BASE_URL ?>/?r=auth/login">Đăng nhập</a> · <a href="<?= BASE_URL ?>/?r=auth/register">Đăng ký</a><?php endif; ?></div>
</div></header>
<main class="wrap main"><?= $content ?></main>
<footer class="footer">Online Book Store · PHP OOP / MVC · XAMPP</footer>
</body>
</html>
