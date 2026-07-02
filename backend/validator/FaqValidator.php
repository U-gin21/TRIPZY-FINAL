<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class FaqValidator {
    // Validates mandatory fields and length restrictions for FAQ entries
    public static function validate($input) {
        if (empty($input['question']) || empty($input['answer'])) {
            throw new ValidationException("Question and Answer are required fields.");
        }
        if (strlen($input['question']) > 1000 || strlen($input['answer']) > 1000) {
            throw new ValidationException("Question and Answer cannot exceed 1000 characters.");
        }
    }
}
