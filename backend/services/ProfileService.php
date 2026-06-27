<?php
require_once __DIR__ . '/../validator/UserValidator.php';
require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';

class ProfileService {
    private $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    // Updates a user's role-specific profile details after checking existence and validating updated fields
    public function update($userId, $data) {
        $user = $this->userRepo->getById($userId);
        if (!$user) {
            throw new NotFoundException("User not found.");
        }

        // Merge and validate
        $updateData = [
            'full_name' => $data['full_name'] ?? $user['full_name'],
            'name_with_initial' => $data['name_with_initial'] ?? $user['name_with_initial'],
            'contact_no' => $data['contact_no'] ?? $user['contact_no'],
            'profile_photo' => $data['profile_photo'] ?? $user['profile_photo']
        ];

        UserValidator::validateProfileUpdate($updateData);

        $baseUser = $this->userRepo->getBaseUserById($userId);
        if (!$baseUser) {
            throw new NotFoundException("Base credentials not found.");
        }

        $profileTable = '';
        if ($baseUser['user_type'] === 'tourist') {
            $profileTable = 'tourist_profiles';
        } elseif ($baseUser['user_type'] === 'provider') {
            $profileTable = 'provider_profiles';
        } elseif ($baseUser['user_type'] === 'admin') {
            $profileTable = 'admin_profiles';
        } else {
            throw new ValidationException("Invalid user type.");
        }

        if ($this->userRepo->updateProfile($userId, $profileTable, $updateData)) {
            return $updateData['profile_photo'];
        }
        throw new Exception("Failed to update profile.");
    }
}
