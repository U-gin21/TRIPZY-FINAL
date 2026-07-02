<?php
require_once __DIR__ . '/../config/db.php';

class NotificationRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Inserts an unread notification record for a specific user ID
    public function create($userId, $message) {
        $stmt = $this->db->prepare("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, 0)");
        return $stmt->execute([$userId, $message]);
    }

    // Resolves email to user ID and inserts an unread notification record
    public function createByEmail($email, $message) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user) {
            return $this->create($user['id'], $message);
        }
        return false;
    }

    // Retrieves all notifications for a specific user ID ordered by date
    public function getByUserId($userId) {
        $stmt = $this->db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    // Marks a specific notification as read
    public function markAsRead($id, $userId) {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $userId]);
    }
    
    // Marks all notifications as read for a given user
    public function markAllAsRead($userId) {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }

    // Deletes a specific notification record
    public function delete($id, $userId) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $userId]);
    }

    // Deletes all notifications for a user
    public function deleteAll($userId) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }
}
