<?php
// PHP MVC standalone entry point for XAMPP. Configure these values for your MySQL.
declare(strict_types=1);
session_start();

const DB_HOST = '127.0.0.1';
const DB_NAME = 'online_book_store_php';
const DB_USER = 'root';
const DB_PASSWORD = ''; // Enter your MySQL password here, if any.

function e($value): string
{
    return htmlspecialchars((string)($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function money($amount): string
{
    return number_format((float)$amount, 0, ',', '.') . ' đ';
}
function csrf(): string
{
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function verify_csrf(): void
{
    if (!hash_equals((string)($_SESSION['csrf'] ?? ''), (string)($_POST['csrf'] ?? ''))) {
        http_response_code(419);
        exit('Phiên làm việc hết hạn. Hãy tải lại trang và thử lại.');
    }
}
function redirect(string $url): never
{
    header('Location: ' . $url);
    exit;
}
function route_url(string $page, array $params = []): string
{
    return '?' . http_build_query(['page' => $page] + $params);
}
function current_user(PDO $db): ?array
{
    if (empty($_SESSION['user_id'])) return null;
    $stmt = $db->prepare('SELECT id, name, email, role FROM users WHERE id = ? AND is_active = 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}
function require_login(?array $user): void
{
    if (!$user) redirect(route_url('login'));
}
function require_admin(?array $user): void
{
    require_login($user);
    if (!in_array($user['role'], ['admin', 'super_admin'], true)) {
        http_response_code(403);
        exit('Tài khoản của bạn không có quyền quản trị.');
    }
}
function flash(string $message): void
{
    $_SESSION['flash'] = $message;
}
function show_flash(): void
{
    if (!empty($_SESSION['flash'])) {
        echo '<div class="notice">' . e($_SESSION['flash']) . '</div>';
        unset($_SESSION['flash']);
    }
}
function page_start(string $title, ?array $user): void
{
    $cartCount = array_sum(array_map('intval', $_SESSION['cart'] ?? []));
    echo '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . e($title) . ' - Nhà sách</title>';
    echo '<style>
    *{box-sizing:border-box}body{margin:0;background:#f5f6fa;color:#202124;font:16px Arial,sans-serif}a{color:#4936a8;text-decoration:none}a:hover{text-decoration:underline}.top{background:#4936a8;color:#fff;padding:18px max(calc((100% - 1120px)/2),20px);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.top a{color:white;margin-right:14px}.brand{font-size:23px;font-weight:bold}.top nav{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.wrap{max-width:1120px;margin:26px auto;padding:0 18px}.box,.card{background:#fff;border:1px solid #e3e3e8;border-radius:10px;padding:20px}.box{margin-bottom:20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}.card h3{margin:0 0 8px}.price{color:#b42318;font-weight:bold;font-size:19px}.muted{color:#666}.notice{background:#e8f5e9;padding:12px 15px;border-radius:7px;margin-bottom:16px}.error{background:#ffebee;color:#9b1c1c;padding:12px;border-radius:7px;margin-bottom:16px}.search{display:flex;gap:8px;flex-wrap:wrap}input,textarea,select{width:100%;padding:11px;border:1px solid #c9c9d0;border-radius:6px;margin:5px 0 14px;font:inherit}input[type=search]{width:min(520px,70%);margin:0}button,.btn{display:inline-block;background:#4936a8;color:white;border:0;border-radius:6px;padding:10px 15px;font:inherit;cursor:pointer}.btn:hover,button:hover{background:#352682;text-decoration:none}.danger{background:#a82f36}.row{display:flex;gap:18px;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;padding:13px 0}.form{max-width:560px}.cover{width:100%;height:220px;object-fit:cover;border-radius:7px;background:#eee}.table{width:100%;border-collapse:collapse}.table th,.table td{text-align:left;padding:11px;border-bottom:1px solid #eee}.footer{text-align:center;padding:30px;color:#777}@media(max-width:600px){.top{padding:16px}.row{align-items:flex-start;flex-direction:column}.table{font-size:14px}}
    </style></head><body><header class="top"><a class="brand" href="' . e(route_url('home')) . '">📚 Nhà sách</a><nav><a href="' . e(route_url('home')) . '">Trang chủ</a><a href="' . e(route_url('books')) . '">Sách</a><a href="' . e(route_url('cart')) . '">Giỏ hàng (' . (int)$cartCount . ')</a>';
    if ($user) {
        echo '<a href="' . e(route_url('orders')) . '">Đơn hàng</a>';
        if (in_array($user['role'], ['admin','super_admin'], true)) echo '<a href="' . e(route_url('admin')) . '">Quản trị</a>';
        echo '<span>Xin chào, ' . e($user['name']) . '</span><a href="' . e(route_url('logout')) . '">Đăng xuất</a>';
    } else {
        echo '<a href="' . e(route_url('login')) . '">Đăng nhập</a><a href="' . e(route_url('register')) . '">Đăng ký</a>';
    }
    echo '</nav></header><main class="wrap">';
    show_flash();
}
function page_end(): void
{
    echo '</main><footer class="footer">Online Book Store · PHP + MySQL</footer></body></html>';
}
function book_card(array $book): void
{
    echo '<article class="card">';
    if (!empty($book['image'])) echo '<a href="' . e(route_url('book', ['id' => (int)$book['id']])) . '"><img class="cover" src="' . e($book['image']) . '" alt="Bìa ' . e($book['title']) . '"></a>';
    echo '<h3><a href="' . e(route_url('book', ['id' => (int)$book['id']])) . '">' . e($book['title']) . '</a></h3><p class="muted">Tác giả: ' . e($book['author']) . '</p><p class="price">' . money($book['price']) . '</p><p class="muted">Còn ' . (int)$book['stock'] . ' quyển</p>';
    if ((int)$book['stock'] > 0) echo '<form method="post" action="' . e(route_url('cart-add')) . '"><input type="hidden" name="csrf" value="' . e(csrf()) . '"><input type="hidden" name="book_id" value="' . (int)$book['id'] . '"><button>Thêm vào giỏ</button></form>';
    echo '</article>';
}

try {
    $db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
} catch (Throwable $ex) {
    http_response_code(500);
    exit('<h2>Không kết nối được MySQL</h2><p>Kiểm tra XAMPP MySQL, database <b>' . e(DB_NAME) . '</b>, và cấu hình đầu file.</p><pre>' . e($ex->getMessage()) . '</pre>');
}
$user = current_user($db);
$page = (string)($_GET['page'] ?? 'home');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        verify_csrf();
        if ($page === 'register') {
            $name = trim((string)($_POST['name'] ?? ''));
            $email = trim((string)($_POST['email'] ?? ''));
            $password = (string)($_POST['password'] ?? '');
            if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) throw new RuntimeException('Hãy nhập tên, email hợp lệ và mật khẩu ít nhất 8 ký tự.');
            $stmt = $db->prepare('SELECT id FROM users WHERE email = ?'); $stmt->execute([$email]);
            if ($stmt->fetch()) throw new RuntimeException('Email này đã được đăng ký.');
            $stmt = $db->prepare('INSERT INTO users (name,email,hashed_password) VALUES (?,?,?)');
            $stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT)]);
            session_regenerate_id(true); $_SESSION['user_id'] = (int)$db->lastInsertId(); flash('Tạo tài khoản thành công.'); redirect(route_url('home'));
        }
        if ($page === 'login') {
            $email = trim((string)($_POST['email'] ?? '')); $password = (string)($_POST['password'] ?? '');
            $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1'); $stmt->execute([$email]); $found = $stmt->fetch();
            if (!$found || !password_verify($password, $found['hashed_password'])) throw new RuntimeException('Email hoặc mật khẩu không chính xác.');
            session_regenerate_id(true); $_SESSION['user_id'] = (int)$found['id']; flash('Đăng nhập thành công.'); redirect(route_url('home'));
        }
        if ($page === 'cart-add') {
            $id = filter_var($_POST['book_id'] ?? null,FILTER_VALIDATE_INT); $stmt=$db->prepare('SELECT stock FROM books WHERE id=?'); $stmt->execute([$id]); $book=$stmt->fetch();
            if (!$book || (int)$book['stock'] < 1) throw new RuntimeException('Sách không tồn tại hoặc đã hết hàng.');
            $_SESSION['cart'][$id] = min((int)($_SESSION['cart'][$id] ?? 0)+1,(int)$book['stock']); flash('Đã thêm sách vào giỏ.'); redirect(route_url('cart'));
        }
        if ($page === 'cart-update') {
            foreach (($_POST['quantity'] ?? []) as $id=>$qty) { $id=(int)$id; $qty=max(0,(int)$qty); if ($qty===0) { unset($_SESSION['cart'][$id]); continue; } $stmt=$db->prepare('SELECT stock FROM books WHERE id=?'); $stmt->execute([$id]); $stock=(int)($stmt->fetchColumn() ?: 0); if($stock<1) unset($_SESSION['cart'][$id]); else $_SESSION['cart'][$id]=min($qty,$stock); }
            flash('Đã cập nhật giỏ hàng.'); redirect(route_url('cart'));
        }
        if ($page === 'checkout') {
            require_login($user); $cart=$_SESSION['cart'] ?? []; if (!$cart) throw new RuntimeException('Giỏ hàng đang trống.');
            $address=trim((string)($_POST['address']??'')); $phone=trim((string)($_POST['phone']??'')); $payment=(string)($_POST['payment_method']??'cod'); $note=trim((string)($_POST['note']??''));
            if($address==='' || $phone==='') throw new RuntimeException('Vui lòng nhập địa chỉ giao hàng và số điện thoại.');
            $db->beginTransaction();
            try {
                $items=[]; $total=0.0; $lock=$db->prepare('SELECT * FROM books WHERE id=? FOR UPDATE');
                foreach($cart as $id=>$quantity){$lock->execute([(int)$id]);$b=$lock->fetch();$quantity=(int)$quantity;if(!$b || $quantity<1 || (int)$b['stock']<$quantity) throw new RuntimeException('Sách không tồn tại hoặc tồn kho không đủ.');$items[]=[$b,$quantity];$total+=(float)$b['price']*$quantity;}
                $stmt=$db->prepare("INSERT INTO orders (user_id,total_amount,status,shipping_address,phone,payment_method,note) VALUES (?,?, 'pending',?,?,?,?)");$stmt->execute([(int)$user['id'],$total,$address,$phone,$payment,$note]);$orderId=(int)$db->lastInsertId();
                $insert=$db->prepare('INSERT INTO order_items (order_id,book_id,title,image,quantity,price_at_purchase) VALUES (?,?,?,?,?,?)');$stock=$db->prepare('UPDATE books SET stock=stock-? WHERE id=?');$history=$db->prepare('INSERT INTO order_status_history (order_id,status,note) VALUES (?,?,?)');$history->execute([$orderId,'pending','Đơn hàng mới']);
                foreach($items as [$b,$quantity]){$insert->execute([$orderId,$b['id'],$b['title'],$b['image'],$quantity,$b['price']]);$stock->execute([$quantity,$b['id']]);}
                $db->commit();unset($_SESSION['cart']);flash('Đặt hàng thành công.');redirect(route_url('order',['id'=>$orderId]));
            } catch(Throwable $ex){if($db->inTransaction())$db->rollBack();throw $ex;}
        }
        if ($page === 'admin-add') {
            require_admin($user);$title=trim((string)($_POST['title']??''));$author=trim((string)($_POST['author']??''));$price=filter_var($_POST['price']??null,FILTER_VALIDATE_FLOAT);$stock=max(0,(int)($_POST['stock']??0));
            if($title==='' || $author==='' || $price===false || $price<0) throw new RuntimeException('Tên sách, tác giả hoặc giá không hợp lệ.');
            $base=strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/','-',iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$title)),'-'));$slug=($base?:'book').'-'.bin2hex(random_bytes(4));
            $stmt=$db->prepare('INSERT INTO books (uuid,title,slug,author,description,price,image,category_id,admin_id,stock) VALUES (?,?,?,?,?,?,?,?,?,?)');$stmt->execute([bin2hex(random_bytes(16)),$title,$slug,$author,trim((string)($_POST['description']??'')) ?: null, $price,trim((string)($_POST['image']??'')) ?: null,null,(int)$user['id'],$stock]);flash('Đã thêm sách.');redirect(route_url('admin'));
        }
    }

    if ($page === 'logout') { $_SESSION=[];session_destroy();redirect(route_url('home')); }
    if (in_array($page,['home','books'],true)) {
        $search=trim((string)($_GET['search']??''));
        if($search!==''){$stmt=$db->prepare('SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY id DESC');$term='%'.$search.'%';$stmt->execute([$term,$term]);$books=$stmt->fetchAll();}else{$books=$db->query('SELECT * FROM books ORDER BY id DESC')->fetchAll();}
        page_start($page==='home'?'Trang chủ':'Danh sách sách',$user);echo '<section class="box"><h1>Chào mừng đến nhà sách</h1><p>Tìm kiếm sách, thêm vào giỏ hàng và đặt mua trực tuyến.</p><form class="search" method="get"><input type="hidden" name="page" value="books"><input type="search" name="search" placeholder="Tên sách hoặc tác giả" value="'.e($search??'').'"> <button>Tìm sách</button></form></section><h2>'.($search!==''?'Kết quả tìm kiếm':'Sách mới nhất').'</h2>';
        if(!$books)echo '<div class="box">Chưa có sách phù hợp. Tài khoản quản trị có thể thêm sách trong mục Quản trị.</div>';else{echo '<div class="grid">';foreach($books as $b)book_card($b);echo '</div>'; } page_end();
    } elseif ($page==='book') {
        $stmt=$db->prepare('SELECT * FROM books WHERE id=?');$stmt->execute([(int)($_GET['id']??0)]);$b=$stmt->fetch();if(!$b){http_response_code(404);throw new RuntimeException('Không tìm thấy sách.');}
        page_start($b['title'],$user);echo '<section class="box">';if($b['image'])echo '<img style="max-width:280px;max-height:360px;object-fit:contain" src="'.e($b['image']).'" alt="Bìa sách">';echo '<h1>'.e($b['title']).'</h1><p>Tác giả: '.e($b['author']).'</p><p>'.e($b['description']).'</p><p class="price">'.money($b['price']).'</p><p>Tồn kho: '.(int)$b['stock'].'</p>';if((int)$b['stock']>0)echo '<form method="post" action="'.e(route_url('cart-add')).'"><input type="hidden" name="csrf" value="'.e(csrf()).'"><input type="hidden" name="book_id" value="'.(int)$b['id'].'"><button>Thêm vào giỏ hàng</button></form>';echo '</section>';page_end();
    } elseif ($page==='register' || $page==='login') {
        page_start($page==='register'?'Đăng ký':'Đăng nhập',$user);echo '<section class="box form"><h1>'.($page==='register'?'Tạo tài khoản':'Đăng nhập').'</h1>';if(!empty($formError))echo '<div class="error">'.e($formError).'</div>';echo '<form method="post"><input type="hidden" name="csrf" value="'.e(csrf()).'">';if($page==='register')echo '<label>Họ tên</label><input name="name" required maxlength="100">';echo '<label>Email</label><input type="email" name="email" required><label>Mật khẩu</label><input type="password" name="password" required '.($page==='register'?'minlength="8"':'').'><button>'.($page==='register'?'Đăng ký':'Đăng nhập').'</button></form></section>';page_end();
    } elseif ($page==='cart') {
        $items=[];$total=0.0;foreach($_SESSION['cart']??[] as $id=>$quantity){$stmt=$db->prepare('SELECT * FROM books WHERE id=?');$stmt->execute([(int)$id]);$b=$stmt->fetch();if($b){$quantity=min((int)$quantity,(int)$b['stock']);if($quantity>0){$b['quantity']=$quantity;$b['subtotal']=$quantity*(float)$b['price'];$items[]=$b;$total+=$b['subtotal'];}}}
        page_start('Giỏ hàng',$user);echo '<h1>Giỏ hàng</h1>';if(!$items)echo '<section class="box">Giỏ hàng đang trống. <a href="'.e(route_url('books')).'">Tiếp tục mua sách</a></section>';else{echo '<form method="post" action="'.e(route_url('cart-update')).'"><input type="hidden" name="csrf" value="'.e(csrf()).'">';foreach($items as $b)echo '<div class="box row"><div><strong>'.e($b['title']).'</strong><div>'.money($b['price']).' / quyển</div></div><label>Số lượng <input style="width:90px" type="number" min="0" max="'.(int)$b['stock'].'" name="quantity['.(int)$b['id'].']" value="'.(int)$b['quantity'].'"></label><strong>'.money($b['subtotal']).'</strong></div>';echo '<button>Cập nhật giỏ hàng</button> <strong style="margin-left:18px">Tổng: '.money($total).'</strong></form><p><a class="btn" href="'.e(route_url('checkout')).'">Tiến hành đặt hàng</a></p>';}page_end();
    } elseif ($page==='checkout') {
        require_login($user);page_start('Thanh toán',$user);echo '<section class="box form"><h1>Thông tin giao hàng</h1>';if(empty($_SESSION['cart']))echo '<p>Giỏ hàng đang trống.</p>';else echo '<form method="post"><input type="hidden" name="csrf" value="'.e(csrf()).'"><label>Địa chỉ nhận hàng</label><input name="address" required><label>Số điện thoại</label><input name="phone" required><label>Phương thức thanh toán</label><select name="payment_method"><option value="cod">Thanh toán khi nhận hàng</option><option value="bank">Chuyển khoản</option></select><label>Ghi chú</label><textarea name="note" rows="3"></textarea><button>Đặt hàng</button></form>';page_end();
    } elseif ($page==='orders') {
        require_login($user);$stmt=$db->prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC');$stmt->execute([(int)$user['id']]);$orders=$stmt->fetchAll();page_start('Đơn hàng',$user);echo '<h1>Đơn hàng của tôi</h1>';if(!$orders)echo '<div class="box">Bạn chưa có đơn hàng.</div>';else{echo '<div class="box"><table class="table"><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Trạng thái</th><th>Tổng tiền</th><th></th></tr>';foreach($orders as $o)echo '<tr><td>#'.(int)$o['id'].'</td><td>'.e($o['created_at']).'</td><td>'.e($o['status']).'</td><td>'.money($o['total_amount']).'</td><td><a href="'.e(route_url('order',['id'=>(int)$o['id']])).'">Chi tiết</a></td></tr>';echo '</table></div>'; }page_end();
    } elseif ($page==='order') {
        require_login($user);$stmt=$db->prepare('SELECT * FROM orders WHERE id=? AND user_id=?');$stmt->execute([(int)($_GET['id']??0),(int)$user['id']]);$o=$stmt->fetch();if(!$o){http_response_code(404);throw new RuntimeException('Không tìm thấy đơn hàng.');}$stmt=$db->prepare('SELECT * FROM order_items WHERE order_id=?');$stmt->execute([(int)$o['id']]);$items=$stmt->fetchAll();page_start('Chi tiết đơn hàng',$user);echo '<section class="box"><h1>Đơn hàng #'.(int)$o['id'].'</h1><p>Trạng thái: '.e($o['status']).'</p><p>Địa chỉ: '.e($o['shipping_address']).' · Điện thoại: '.e($o['phone']).'</p>';foreach($items as $i)echo '<div class="row"><span>'.e($i['title']).' × '.(int)$i['quantity'].'</span><strong>'.money((float)$i['price_at_purchase']*(int)$i['quantity']).'</strong></div>';echo '<h3>Tổng: '.money($o['total_amount']).'</h3></section>';page_end();
    } elseif ($page==='admin') {
        require_admin($user);$books=$db->query('SELECT id,title,author,price,stock FROM books ORDER BY id DESC')->fetchAll();page_start('Quản trị sách',$user);echo '<h1>Quản trị sách</h1><section class="box form"><h2>Thêm sách</h2><form method="post" action="'.e(route_url('admin-add')).'"><input type="hidden" name="csrf" value="'.e(csrf()).'"><label>Tên sách</label><input name="title" required><label>Tác giả</label><input name="author" required><label>Mô tả</label><textarea name="description" rows="3"></textarea><label>Giá (VND)</label><input type="number" name="price" min="0" step="1000" required><label>Đường dẫn ảnh (không bắt buộc)</label><input name="image" type="url"><label>Số lượng tồn kho</label><input type="number" name="stock" min="0" value="0"><button>Thêm sách</button></form></section><section class="box"><h2>Danh sách sách</h2><table class="table"><tr><th>Sách</th><th>Tác giả</th><th>Giá</th><th>Tồn kho</th></tr>';foreach($books as $b)echo '<tr><td>'.e($b['title']).'</td><td>'.e($b['author']).'</td><td>'.money($b['price']).'</td><td>'.(int)$b['stock'].'</td></tr>';echo '</table></section>';page_end();
    } else {
        http_response_code(404);page_start('Không tìm thấy trang',$user);echo '<section class="box"><h1>Không tìm thấy trang</h1><a href="'.e(route_url('home')).'">Về trang chủ</a></section>';page_end();
    }
} catch (RuntimeException $ex) {
    $formError=$ex->getMessage();
    if (in_array($page,['register','login'],true)) { page_start($page==='register'?'Đăng ký':'Đăng nhập',$user);echo '<section class="box form"><h1>'.($page==='register'?'Tạo tài khoản':'Đăng nhập').'</h1><div class="error">'.e($formError).'</div><form method="post"><input type="hidden" name="csrf" value="'.e(csrf()).'">';if($page==='register')echo '<label>Họ tên</label><input name="name" required maxlength="100">';echo '<label>Email</label><input type="email" name="email" required><label>Mật khẩu</label><input type="password" name="password" required '.($page==='register'?'minlength="8"':'').'><button>'.($page==='register'?'Đăng ký':'Đăng nhập').'</button></form></section>';page_end(); }
    else { page_start('Thông báo',$user);echo '<div class="error">'.e($formError).'</div><a href="javascript:history.back()">Quay lại</a>';page_end(); }
} catch (Throwable $ex) {
    error_log((string)$ex);http_response_code(500);page_start('Lỗi',$user);echo '<div class="error">Có lỗi khi xử lý yêu cầu. Kiểm tra schema.sql đã được import và cấu trúc database đúng.</div>';page_end();
}
