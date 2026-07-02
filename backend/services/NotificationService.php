<?php
require_once __DIR__ . '/../repository/NotificationRepository.php';

class NotificationService {
    private $notifRepo;

    public function __construct() {
        $this->notifRepo = new NotificationRepository();
    }

    // Creates a notification record for a specific user ID
    public function create($userId, $message) {
        return $this->notifRepo->create($userId, $message);
    }

    // Creates a notification record for a user identified by their email address
    public function createByEmail($email, $message) {
        return $this->notifRepo->createByEmail($email, $message);
    }

    // Retrieves all notifications associated with a user ID
    public function getByUserId($userId) {
        return $this->notifRepo->getByUserId($userId);
    }

    // Marks a specific notification as read for a given user ID
    public function markAsRead($id, $userId) {
        return $this->notifRepo->markAsRead($id, $userId);
    }
    
    // Marks all notifications as read for a given user ID
    public function markAllAsRead($userId) {
        return $this->notifRepo->markAllAsRead($userId);
    }

    // Deletes a specific notification record for a given user ID
    public function delete($id, $userId) {
        return $this->notifRepo->delete($id, $userId);
    }

    // Deletes all notification records associated with a user ID
    public function deleteAll($userId) {
        return $this->notifRepo->deleteAll($userId);
    }
}
