<?php
require_once __DIR__ . '/../exceptions/ValidationException.php';

class DestinationValidator {
    // Validates fields, coordinates, categories, and length restrictions for travel destinations
    public static function validate($input) {
        $required = ['name', 'district', 'description', 'budget_category', 'interest_category', 'latitude', 'longitude'];
        foreach ($required as $field) {
            if (empty($input[$field]) && (!isset($input[$field]) || $input[$field] !== '0' && $input[$field] !== 0)) {
                throw new ValidationException("Field '$field' is required.");
            }
        }

        if (strlen($input['name']) > 150 || preg_match('/^\d+$/', $input['name'])) {
            throw new ValidationException("Destination name cannot consist only of numbers and must not exceed 150 characters.");
        }

        if (!in_array($input['budget_category'], ['budget', 'mid-range', 'luxury'])) {
            throw new ValidationException("Invalid budget category.");
        }

        $interests = ['Beaches', 'Mountains', 'Camping', 'Wildlife', 'Historical places', 'Adventure', 'Nature', 'Cultural destinations'];
        if (!in_array($input['interest_category'], $interests)) {
            throw new ValidationException("Invalid interest category.");
        }

        if (!is_numeric($input['latitude']) || $input['latitude'] < -90 || $input['latitude'] > 90) {
            throw new ValidationException("Latitude must be a number between -90 and 90.");
        }

        if (!is_numeric($input['longitude']) || $input['longitude'] < -180 || $input['longitude'] > 180) {
            throw new ValidationException("Longitude must be a number between -180 and 180.");
        }
    }
}
