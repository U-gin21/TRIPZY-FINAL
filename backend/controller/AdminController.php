<?php
require_once __DIR__ . '/../services/AdminService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    private $adminService;

    public function __construct() {
        $this->adminService = new AdminService();
    }

    // Endpoint retrieves general system usage statistics for administrator charts
    public function stats($input, $args) {
        AuthMiddleware::requireAdmin();
        $stats = $this->adminService->getStats();
        return array_merge(["success" => true], $stats);
    }

    // Endpoint retrieves admin registrations awaiting verification
    public function pending_admins($input, $args) {
        AuthMiddleware::requireAdmin();
        $data = $this->adminService->getPendingAdmins();
        return ["success" => true, "pending_admins" => $data];
    }

    // Endpoint retrieves provider registrations awaiting verification
    public function pending_providers($input, $args) {
        AuthMiddleware::requireAdmin();
        $data = $this->adminService->getPendingProviders();
        return ["success" => true, "pending_providers" => $data];
    }

    // Endpoint updates (approves, rejects, suspends) a user status by an administrator
    public function approve_user($input, $args) {
        AuthMiddleware::requireAdmin();
        $id = $input['id'] ?? 0;
        $status = $input['status'] ?? 'active';
        $this->adminService->updateStatus($id, $status);
        return ["success" => true, "message" => "User registration status has been updated to: $status."];
    }

    // Endpoint retrieves list of all platform users except super administrator
    public function all_users($input, $args) {
        AuthMiddleware::requireAdmin();
        $data = $this->adminService->getAllUsers();
        return ["success" => true, "users" => $data];
    }
}
