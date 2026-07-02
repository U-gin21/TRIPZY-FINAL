<?php
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class NotificationsController {
    private $notifService;

    public function __construct() {
        $this->notifService = new NotificationService();
    }

    // Endpoint lists all notifications belonging to the logged-in user
    public function list($input, $args) {
        AuthMiddleware::requireLogin();
        $data = $this->notifService->getByUserId($_SESSION['user_id']);
        return ["success" => true, "notifications" => $data];
    }

    // Endpoint marks a specific notification as read
    public function mark_read($input, $args) {
        AuthMiddleware::requireLogin();
        $id = $input['id'] ?? 0;
        if (!is_numeric($id) || intval($id) <= 0) {
            throw new ValidationException("Notification ID must be a positive integer.");
        }
        $this->notifService->markAsRead($id, $_SESSION['user_id']);
        return ["success" => true, "message" => "Notification marked as read."];
    }

    // Endpoint marks all notifications of the current user as read
    public function mark_all_read($input, $args) {
        AuthMiddleware::requireLogin();
        $this->notifService->markAllAsRead($_SESSION['user_id']);
        return ["success" => true, "message" => "All notifications marked as read."];
    }

    // Endpoint deletes a specific notification
    public function delete($input, $args) {
        AuthMiddleware::requireLogin();
        $id = $input['id'] ?? 0;
        if (!is_numeric($id) || intval($id) <= 0) {
            throw new ValidationException("Notification ID must be a positive integer.");
        }
        $this->notifService->delete($id, $_SESSION['user_id']);
        return ["success" => true, "message" => "Notification deleted."];
    }

    // Endpoint deletes all notifications for the current user
    public function clear_all($input, $args) {
        AuthMiddleware::requireLogin();
        $this->notifService->deleteAll($_SESSION['user_id']);
        return ["success" => true, "message" => "All notifications cleared."];
    }
}
