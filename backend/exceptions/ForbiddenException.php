<?php
require_once __DIR__ . '/AppException.php';

class ForbiddenException extends AppException {
    protected $statusCode = 403;
}
