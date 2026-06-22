<?php

class AppException extends Exception {
    protected $statusCode = 500;

    public function __construct($message = "", $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }

    // Retrieves the configured HTTP status code for this exception
    public function getStatusCode() {
        return $this->statusCode;
    }
}
