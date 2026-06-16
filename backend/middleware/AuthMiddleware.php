<?php
require_once __DIR__ . '/../exceptions/UnauthorizedException.php';
require_once __DIR__ . '/../exceptions/ForbiddenException.php';

class AuthMiddleware {
    // Assures the client session contains user authentication credentials
    public static function requireLogin() {
        if (!isset($_SESSION['user_id'])) {
            throw new UnauthorizedException("Unauthorized. Please log in first.");
        }
    }

    // Assures the authenticated user has one of the allowed role types
    public static function requireRole($roles) {
        self::requireLogin();
        
        if (!is_array($roles)) {
            $roles = [$roles];
        }

        if (!isset($_SESSION['user_type']) || !in_array($_SESSION['user_type'], $roles)) {
            throw new ForbiddenException("Forbidden. Access denied.");
        }
    }

    // Restricts route access to administrator users
    public static function requireAdmin() {
        self::requireRole('admin');
    }

    // Restricts route access to tourist users
    public static function requireTourist() {
        self::requireRole('tourist');
    }

    // Restricts route access to service provider users
    public static function requireProvider() {
        self::requireRole('provider');
    }
}
