<?php
require_once __DIR__ . '/AppException.php';

class UnauthorizedException extends AppException {
    protected $statusCode = 401;
}
