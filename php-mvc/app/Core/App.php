<?php

session_start();

$root = dirname(__DIR__);
$baseUrl = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
define('APP_ROOT', $root);
define('BASE_URL', $baseUrl === '' ? '' : $baseUrl);

require_once APP_ROOT . '/config/database.php';
require_once APP_ROOT . '/app/Core/Controller.php';
require_once APP_ROOT . '/app/Core/Model.php';
require_once APP_ROOT . '/app/Core/View.php';
require_once APP_ROOT . '/app/Models/User.php';
require_once APP_ROOT . '/app/Models/Book.php';
require_once APP_ROOT . '/app/Models/Order.php';
require_once APP_ROOT . '/app/Controllers/HomeController.php';
require_once APP_ROOT . '/app/Controllers/AuthController.php';
require_once APP_ROOT . '/app/Controllers/BookController.php';
require_once APP_ROOT . '/app/Controllers/CartController.php';
require_once APP_ROOT . '/app/Controllers/OrderController.php';
require_once APP_ROOT . '/app/Controllers/AdminController.php';

class App
{
    public function run(): void
    {
        $route = trim((string) ($_GET['r'] ?? ''), '/');
        $parts = $route === '' ? [] : explode('/', $route);
        $controllerName = $parts[0] ?? 'home';
        $method = $parts[1] ?? 'index';
        $argument = $parts[2] ?? null;

        $routes = [
            'home' => HomeController::class,
            'auth' => AuthController::class,
            'books' => BookController::class,
            'cart' => CartController::class,
            'orders' => OrderController::class,
            'admin' => AdminController::class,
        ];

        if (!isset($routes[$controllerName])) {
            http_response_code(404);
            View::render('errors/404');
            return;
        }

        $controller = new $routes[$controllerName]();
        if (!method_exists($controller, $method) || str_starts_with($method, '_')) {
            http_response_code(404);
            View::render('errors/404');
            return;
        }

        $argument === null ? $controller->$method() : $controller->$method($argument);
    }
}
