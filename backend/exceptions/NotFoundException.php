<?php
require_once __DIR__ . '/AppException.php';

class NotFoundException extends AppException {
    protected $statusCode = 404;
}
