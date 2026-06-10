<?php
require_once __DIR__ . '/AppException.php';

class AuthException extends AppException {
    protected $statusCode = 401;
}
