<section class="hero"><h1>Khám phá cuốn sách tiếp theo của bạn</h1><p>Tìm kiếm sách và đặt hàng dễ dàng.</p>
<form method="get"><input type="hidden" name="r" value="home"><input name="search" value="<?= View::escape($search) ?>" placeholder="Tìm theo tên sách hoặc tác giả"><button class="button">Tìm kiếm</button></form></section>
<h2>Sách</h2>
<div class="grid">
<?php foreach ($books as $book): ?>
<article class="card"><div class="cover">📚</div><div class="card-body"><h3><?= View::escape($book['title']) ?></h3><p><?= View::escape($book['author']) ?></p><strong><?= number_format((float) $book['price'], 0, ',', '.') ?> ₫</strong><p>Còn <?= (int) $book['stock'] ?> cuốn</p><a class="button" href="<?= BASE_URL ?>/?r=books/detail/<?= (int) $book['id'] ?>">Chi tiết</a> <a class="button secondary" href="<?= BASE_URL ?>/?r=cart/add/<?= (int) $book['id'] ?>">Thêm giỏ</a></div></article>
<?php endforeach; ?>
</div>
