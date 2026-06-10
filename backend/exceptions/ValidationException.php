<?php
require_once __DIR__ . '/AppException.php';

class ValidationException extends AppException {
    protected $statusCode = 400;
}
