<?php
require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helper/Mailer.php';

class AdminService {
    private $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    // Retrieves system statistics including user counts, service categories, and booking earnings
    public function getStats() {
        $db = Database::getInstance()->getConnection();
        
        $users_stmt = $db->query("SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type");
        $user_stats = $users_stmt->fetchAll();
        
        $serv_stmt = $db->query("SELECT service_type, COUNT(*) as count FROM services GROUP BY service_type");
        $service_stats = $serv_stmt->fetchAll();
        
        $book_stmt = $db->query("SELECT status, COUNT(*) as count, SUM(price) as total_earnings FROM bookings GROUP BY status");
        $booking_stats = $book_stmt->fetchAll();
        
        return [
            "users" => $user_stats,
            "services" => $service_stats,
            "bookings" => $booking_stats
        ];
    }

    // Retrieves a list of administrators awaiting registration approval
    public function getPendingAdmins() {
        return $this->userRepo->getPendingAdmins();
    }

    // Retrieves a list of service providers awaiting registration approval
    public function getPendingProviders() {
        return $this->userRepo->getPendingProviders();
    }

    // Updates a user's account status and sends a notification email explaining the decision
    public function updateStatus($id, $status) {
        $user = $this->userRepo->getById($id);
        if ($user && $user['status'] === $status) {
            return true;
        }

        $result = $this->userRepo->updateStatus($id, $status);

        if ($result && ($status === 'active' || $status === 'rejected' || $status === 'suspended')) {
            if ($user) {
                $subject = "Tripzy Account Status Update";
                $body = "<h2>Hello " . htmlspecialchars($user['full_name']) . ",</h2>";
                if ($status === 'active') {
                    $body .= "<p>Your Tripzy user profile status has been updated to: <strong>ACTIVE / ENABLED</strong>.</p>";
                    $body .= "<p>You are now authorized to log in and start using or providing services.</p>";
                } elseif ($status === 'suspended') {
                    $body .= "<p>Your Tripzy user profile has been <strong>SUSPENDED</strong> by an administrator.</p>";
                    $body .= "<p>You will not be allowed to log in or access your account until the suspension is lifted.</p>";
                } else {
                    $body .= "<p>We regret to inform you that your registration request was rejected by our administrator panel.</p>";
                }
                $body .= "<p>Best Regards,<br>The Tripzy Team</p>";
                Mailer::send($user['email'], $subject, $body);
            }
        }
        return $result;
    }

    // Retrieves all registered users excluding super admin users
    public function getAllUsers() {
        return $this->userRepo->getAllUsers();
    }
}
