<?php

class AuthController extends Controller
{
    public function login(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            Auth::verifyCsrf();
            $user = (new User())->findByEmail(trim((string) ($_POST['email'] ?? '')));
            if (!$user || !password_verify((string) ($_POST['password'] ?? ''), $user['hashed_password'])) {
                $this->render('auth/login', ['title' => 'Đăng nhập', 'error' => 'Email hoặc mật khẩu không chính xác.']);
                return;
            }
            if (!(int) $user['is_active']) {
                $this->render('auth/login', ['title' => 'Đăng nhập', 'error' => 'Tài khoản đã bị vô hiệu hóa.']);
                return;
            }
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $this->redirect('home');
        }
        $this->render('auth/login', ['title' => 'Đăng nhập']);
    }

    public function register(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            Auth::verifyCsrf();
            $name = trim((string) ($_POST['name'] ?? ''));
            $email = trim((string) ($_POST['email'] ?? ''));
            $password = (string) ($_POST['password'] ?? '');
            if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
                $this->render('auth/register', ['title' => 'Đăng ký', 'error' => 'Hãy nhập tên, email hợp lệ và mật khẩu tối thiểu 8 ký tự.']);
                return;
            }
            if ((new User())->findByEmail($email)) {
                $this->render('auth/register', ['title' => 'Đăng ký', 'error' => 'Email đã được sử dụng.']);
                return;
            }
            $_SESSION['user_id'] = (new User())->register($name, $email, $password);
            session_regenerate_id(true);
            $this->redirect('home');
        }
        $this->render('auth/register', ['title' => 'Đăng ký']);
    }

    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        $this->redirect('home');
    }
}
