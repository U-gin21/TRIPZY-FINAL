<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class ServiceValidator {
    // Validates provider service fields including types, contacts, emails, and prices
    public static function validate($input) {
        $required = ['service_type', 'name_of_institute', 'contact_no', 'email', 'price', 'description'];
        foreach ($required as $field) {
            if (empty($input[$field]) && (!isset($input[$field]) || $input[$field] !== '0' && $input[$field] !== 0)) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (!in_array($input['service_type'], ['hotel', 'vehicle', 'guide', 'camping_tool'])) {
            throw new ValidationException("Invalid service type category.");
        }

        if (strlen($input['name_of_institute']) > 150 || preg_match('/^\d+$/', $input['name_of_institute'])) {
            throw new ValidationException("Institution name cannot consist only of numbers and must not exceed 150 characters.");
        }

        if (!preg_match('/^[0-9]{10}$/', $input['contact_no'])) {
            throw new ValidationException("Contact number must be exactly 10 digits.");
        }

        if (strlen($input['email']) > 150 || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException("Invalid email format or length exceeds 150 characters.");
        }

        if (!is_numeric($input['price']) || floatval($input['price']) <= 0) {
            throw new ValidationException("Price must be a positive number.");
        }
    }

    // Validates ratings and review comments submitted by tourists
    public static function validateReview($input) {
        if (empty($input['rating'])) {
            throw new ValidationException("Rating is required.");
        }
        if (!is_numeric($input['rating']) || intval($input['rating']) < 1 || intval($input['rating']) > 5) {
            throw new ValidationException("Rating must be an integer between 1 and 5.");
        }
        if (empty($input['comment'])) {
            throw new ValidationException("Comment is required.");
        }
    }
}
