<?php

class CORSMiddleware {
    // Configures cross-origin resource sharing (CORS) headers and handles preflight OPTIONS requests
    public static function handle() {
        $allowed_origins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
        ];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin) {
            if (in_array($origin, $allowed_origins) || preg_match('/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
                header("Access-Control-Allow-Origin: $origin");
            }
        }
        header("Vary: Origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        header("Content-Type: application/json; charset=UTF-8");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
