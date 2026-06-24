<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class CompanionValidator {
    // Validates inputs for posting a companion traveler request
    public static function validatePost($input) {
        $required = ['destination_place', 'start_date', 'end_date', 'budget_range', 'companions_needed'];
        foreach ($required as $field) {
            if (empty($input[$field]) && (!isset($input[$field]) || $input[$field] !== '0' && $input[$field] !== 0)) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (strlen($input['destination_place']) > 150 || preg_match('/^\d+$/', $input['destination_place'])) {
            throw new ValidationException("Destination place cannot consist only of numbers and must not exceed 150 characters.");
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['start_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['end_date'])) {
            throw new ValidationException("Dates must be in YYYY-MM-DD format.");
        }

        if (strtotime($input['start_date']) > strtotime($input['end_date'])) {
            throw new ValidationException("Start date cannot be after end date.");
        }

        if (!is_numeric($input['budget_range']) || floatval($input['budget_range']) <= 0) {
            throw new ValidationException("Budget must be a positive number.");
        }

        if (!is_numeric($input['companions_needed']) || intval($input['companions_needed']) < 1) {
            throw new ValidationException("Companions needed must be an integer of at least 1.");
        }
    }

    // Validates request details submitted to join a traveler companion post
    public static function validateRequest($input) {
        if (empty($input['post_id'])) {
            throw new ValidationException("Post ID is required.");
        }
        if (!is_numeric($input['post_id'])) {
            throw new ValidationException("Post ID must be an integer.");
        }
        if (isset($input['message']) && strlen($input['message']) > 1000) {
            throw new ValidationException("Message cannot exceed 1000 characters.");
        }
    }
}
