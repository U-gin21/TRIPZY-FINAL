<?php

class SessionMiddleware {
    // Starts and configures secure session storage, setting SameSite attributes and managing inactivity timeouts
    public static function handle() {
        $session_dir = dirname(__DIR__) . '/sessions';
        if (!file_exists($session_dir)) {
            @mkdir($session_dir, 0777, true);
        }
        session_save_path($session_dir);

        $isHTTPS = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        $cookieSameSite = $isHTTPS ? 'None' : 'Lax';
        $cookieSecure = $isHTTPS;

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $cookieSecure,
            'httponly' => true,
            'samesite' => $cookieSameSite
        ]);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $inactivity_timeout = 1800;
        if (isset($_SESSION['user_id'])) {
            if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $inactivity_timeout)) {
                $_SESSION = array();
                if (ini_get("session.use_cookies")) {
                    $params = session_get_cookie_params();
                    setcookie(session_name(), '', time() - 42000,
                        $params["path"], $params["domain"],
                        $params["secure"], $params["httponly"]
                    );
                }
                session_destroy();
                session_start();
            } else {
                $_SESSION['last_activity'] = time();
            }
        }
    }
}
