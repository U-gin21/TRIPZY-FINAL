<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class BookingValidator {
    // Validates structural data formats and business rules for booking reservations
    public static function validate($input) {
        $required = ['service_id', 'start_date', 'end_date', 'price'];
        foreach ($required as $field) {
            if (empty($input[$field]) && (!isset($input[$field]) || $input[$field] !== '0' && $input[$field] !== 0)) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (!is_numeric($input['service_id'])) {
            throw new ValidationException("Service ID must be an integer.");
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['start_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['end_date'])) {
            throw new ValidationException("Dates must be in YYYY-MM-DD format.");
        }

        if (strtotime($input['start_date']) > strtotime($input['end_date'])) {
            throw new ValidationException("Start date cannot be after end date.");
        }

        if (!is_numeric($input['price']) || floatval($input['price']) <= 0) {
            throw new ValidationException("Price must be a positive number.");
        }
    }
}
