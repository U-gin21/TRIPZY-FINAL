<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class UserValidator {
    // Validates register inputs including passwords, email formats, and age limits
    public static function validateRegister($input) {
        $required = ['email', 'password', 'user_type', 'full_name', 'name_with_initial', 'nic_passport', 'contact_no', 'gender', 'date_of_birth'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (strlen($input['password']) < 8) {
            throw new ValidationException("Password must be at least 8 characters long.");
        }

        if (strlen($input['email']) > 150 || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException("Invalid email format or length exceeds 150 characters.");
        }

        if (strlen($input['full_name']) > 150 || preg_match('/^\d+$/', $input['full_name'])) {
            throw new ValidationException("Full name cannot consist only of numbers and must not exceed 150 characters.");
        }

        if (strlen($input['name_with_initial']) > 100 || preg_match('/^\d+$/', $input['name_with_initial'])) {
            throw new ValidationException("Name with initial cannot consist only of numbers and must not exceed 100 characters.");
        }

        if (strlen($input['nic_passport']) > 50) {
            throw new ValidationException("NIC/Passport cannot exceed 50 characters.");
        }

        if (!preg_match('/^[0-9]{10}$/', $input['contact_no'])) {
            throw new ValidationException("Contact number must be exactly 10 digits.");
        }

        if (!in_array($input['gender'], ['male', 'female'])) {
            throw new ValidationException("Gender must be 'male' or 'female'.");
        }

        if (!in_array($input['user_type'], ['tourist', 'provider', 'admin'])) {
            throw new ValidationException("User type must be 'tourist', 'provider', or 'admin'.");
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['date_of_birth'])) {
            throw new ValidationException("Date of birth must be in YYYY-MM-DD format.");
        }

        $dobDate = new DateTime($input['date_of_birth']);
        $now = new DateTime();
        $age = $now->diff($dobDate)->y;
        if ($age < 18) {
            throw new ValidationException("Registration restricted: You must be at least 18 years old.");
        }
    }

    // Validates subset fields allowed for user profile updates
    public static function validateProfileUpdate($input) {
        if (isset($input['full_name'])) {
            if (strlen($input['full_name']) > 150 || preg_match('/^\d+$/', $input['full_name'])) {
                throw new ValidationException("Full name cannot consist only of numbers and must not exceed 150 characters.");
            }
        }

        if (isset($input['name_with_initial'])) {
            if (strlen($input['name_with_initial']) > 100 || preg_match('/^\d+$/', $input['name_with_initial'])) {
                throw new ValidationException("Name with initials cannot consist only of numbers and must not exceed 100 characters.");
            }
        }

        if (isset($input['contact_no'])) {
            if (!preg_match('/^[0-9]{10}$/', $input['contact_no'])) {
                throw new ValidationException("Contact number must be exactly 10 digits.");
            }
        }
    }
}
