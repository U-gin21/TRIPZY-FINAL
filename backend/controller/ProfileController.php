<?php
require_once __DIR__ . '/../services/ProfileService.php';
require_once __DIR__ . '/../helper/UploadHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController {
    private $profileService;

    public function __construct() {
        $this->profileService = new ProfileService();
    }

    // Endpoint handles profile picture uploads and user profile updates
    public function update($input, $args) {
        AuthMiddleware::requireLogin();
        
        $userId = $_SESSION['user_id'];
        
        $photo = null;
        if (isset($_FILES['profile_photo'])) {
            $targetDir = dirname(__DIR__) . '/uploads/profiles/';
            $uploaded = UploadHelper::uploadImageFile('profile_photo', $targetDir);
            if ($uploaded) {
                $photo = 'profiles/' . $uploaded;
            }
        }
        
        $updateData = $input;
        if ($photo) {
            $updateData['profile_photo'] = $photo;
        }

        $photoResult = $this->profileService->update($userId, $updateData);
        return ["success" => true, "message" => "Profile updated successfully.", "profile_photo" => $photoResult];
    }
}
