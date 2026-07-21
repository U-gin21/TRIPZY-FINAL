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

        // Monthly Sales (last 6 months)
        $sales_stmt = $db->query("
            SELECT DATE_FORMAT(created_at, '%b %Y') as month, 
                   SUM(price) as sales 
            FROM bookings 
            WHERE status = 'completed'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
            LIMIT 6
        ");
        $monthly_sales = $sales_stmt ? $sales_stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        // Monthly Users (last 6 months)
        $users_month_stmt = $db->query("
            SELECT DATE_FORMAT(created_at, '%b %Y') as month, 
                   COUNT(*) as count 
            FROM users 
            WHERE user_type != 'admin'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
            LIMIT 6
        ");
        $monthly_users = $users_month_stmt ? $users_month_stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        
        return [
            "users" => $user_stats,
            "services" => $service_stats,
            "bookings" => $booking_stats,
            "monthly_sales" => $monthly_sales,
            "monthly_users" => $monthly_users
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

    // Retrieves all contact inquiries sorted by date descending
    public function getAllInquiries() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM contact_inquiries ORDER BY created_at DESC");
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    }

    // Retrieves all companion finder posts for administrative overview
    public function getAllCompanionPosts() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT cp.*, u.full_name as owner_name, u.email as owner_email,
                   ROUND(IFNULL((SELECT AVG(rating) FROM companion_ratings WHERE post_id = cp.id), 0), 1) as trip_rating,
                   IFNULL((SELECT COUNT(*) FROM companion_ratings WHERE post_id = cp.id), 0) as trip_rating_count,
                   IFNULL((SELECT COUNT(*) FROM companion_requests WHERE post_id = cp.id AND status = 'accepted'), 0) as accepted_count
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            ORDER BY cp.created_at DESC
        ");
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    }

    // Deletes a companion post by administrator intervention
    public function deleteCompanionPost($postId) {
        $db = Database::getInstance()->getConnection();
        $db->beginTransaction();
        try {
            // Delete ratings, requests, interests, and post
            $stmt = $db->prepare("DELETE FROM companion_ratings WHERE post_id = ?");
            $stmt->execute([$postId]);
            
            $stmt = $db->prepare("DELETE FROM companion_requests WHERE post_id = ?");
            $stmt->execute([$postId]);

            $stmt = $db->prepare("DELETE FROM companion_post_interests WHERE post_id = ?");
            $stmt->execute([$postId]);

            $stmt = $db->prepare("DELETE FROM companion_posts WHERE id = ?");
            $stmt->execute([$postId]);

            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
