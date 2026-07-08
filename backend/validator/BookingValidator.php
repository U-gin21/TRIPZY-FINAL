<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class BookingValidator {
    // Validates structural data formats and business rules for booking reservations
    public static function validate($input) {
        $required = ['service_id', 'start_date', 'end_date'];
        foreach ($required as $field) {
            if (empty($input[$field]) && (!isset($input[$field]) || $input[$field] !== '0' && $input[$field] !== 0)) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (!is_numeric($input['service_id'])) {
            throw new ValidationException("Service ID must be an integer.");
        }

        if (isset($input['service_type']) && $input['service_type'] === 'hotel') {
            if (!isset($input['no_of_rooms']) || !is_numeric($input['no_of_rooms']) || intval($input['no_of_rooms']) <= 0) {
                throw new ValidationException("Number of rooms is required and must be a positive integer for hotel bookings.");
            }
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['start_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['end_date'])) {
            throw new ValidationException("Dates must be in YYYY-MM-DD format.");
        }

        if (strtotime($input['start_date']) > strtotime($input['end_date'])) {
            throw new ValidationException("Start date cannot be after end date.");
        }
    }
}
