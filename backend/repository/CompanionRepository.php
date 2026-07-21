<?php
require_once __DIR__ . '/../config/db.php';

class CompanionRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Begins a database transaction
    public function beginTransaction() {
        return $this->db->beginTransaction();
    }

    // Commits a database transaction
    public function commit() {
        return $this->db->commit();
    }

    // Rolls back a database transaction
    public function rollBack() {
        return $this->db->rollBack();
    }

    // Inserts a new companion post record
    public function createPost($data) {
        $sql = "INSERT INTO companion_posts (owner_id, destination_place, start_date, end_date, budget_range, companions_needed, gender_preference, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['owner_id'],
            $data['destination_place'],
            $data['start_date'],
            $data['end_date'],
            $data['budget_range'],
            $data['companions_needed'],
            $data['gender_preference'] ?? 'Any',
            $data['description']
        ]);
        return $this->db->lastInsertId();
    }

    // Associates a travel interest tag with a companion post
    public function createPostInterest($postId, $interest) {
        $intSql = "INSERT INTO companion_post_interests (post_id, interest) VALUES (?, ?)";
        $intStmt = $this->db->prepare($intSql);
        return $intStmt->execute([$postId, $interest]);
    }

    // Retrieves all open companion posts with filter options
    public function getPosts($filters = []) {
        $sql = "
            SELECT cp.*, u.full_name, u.gender as owner_gender, u.profile_photo as owner_photo, u.date_of_birth,
                   (SELECT GROUP_CONCAT(interest SEPARATOR ', ') FROM companion_post_interests WHERE post_id = cp.id) as travel_interests,
                   ROUND(IFNULL((SELECT AVG(rating) FROM companion_ratings WHERE post_id = cp.id), 0), 1) as trip_rating,
                   IFNULL((SELECT COUNT(*) FROM companion_ratings WHERE post_id = cp.id), 0) as trip_rating_count,
                   IFNULL((SELECT COUNT(*) FROM companion_requests WHERE post_id = cp.id AND status = 'accepted'), 0) as accepted_count
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            WHERE cp.status = 'open'
              AND cp.end_date >= CURDATE()
        ";
        $params = [];

        if (!empty($filters['destination'])) {
            $sql .= " AND cp.destination_place LIKE ?";
            $params[] = "%" . $filters['destination'] . "%";
        }
        if (!empty($filters['gender_preference']) && $filters['gender_preference'] !== 'Any') {
            $sql .= " AND (cp.gender_preference = ? OR cp.gender_preference = 'Any')";
            $params[] = $filters['gender_preference'];
        }

        $sql .= " ORDER BY cp.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Retrieves details of a specific companion post and its creator
    public function getPostById($id) {
        $stmt = $this->db->prepare("
            SELECT cp.*, u.full_name, u.email as owner_email, u.contact_no as owner_contact, u.gender as owner_gender, u.profile_photo as owner_photo,
                   (SELECT GROUP_CONCAT(interest SEPARATOR ', ') FROM companion_post_interests WHERE post_id = cp.id) as travel_interests,
                   ROUND(IFNULL((SELECT AVG(rating) FROM companion_ratings WHERE post_id = cp.id), 0), 1) as trip_rating,
                   IFNULL((SELECT COUNT(*) FROM companion_ratings WHERE post_id = cp.id), 0) as trip_rating_count,
                   IFNULL((SELECT COUNT(*) FROM companion_requests WHERE post_id = cp.id AND status = 'accepted'), 0) as accepted_count
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            WHERE cp.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Retrieves all posts created by a specific user
    public function getMyPosts($userId) {
        $stmt = $this->db->prepare("
            SELECT cp.*,
                   (SELECT GROUP_CONCAT(interest SEPARATOR ', ') FROM companion_post_interests WHERE post_id = cp.id) as travel_interests,
                   ROUND(IFNULL((SELECT AVG(rating) FROM companion_ratings WHERE post_id = cp.id), 0), 1) as trip_rating,
                   IFNULL((SELECT COUNT(*) FROM companion_ratings WHERE post_id = cp.id), 0) as trip_rating_count,
                   IFNULL((SELECT COUNT(*) FROM companion_requests WHERE post_id = cp.id AND status = 'accepted'), 0) as accepted_count
            FROM companion_posts cp
            WHERE cp.owner_id = ?
            ORDER BY cp.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    // Checks if a user has already sent a request to join a trip post
    public function existsRequest($postId, $requesterId) {
        $stmt = $this->db->prepare("SELECT id FROM companion_requests WHERE post_id = ? AND requester_id = ?");
        $stmt->execute([$postId, $requesterId]);
        return $stmt->fetch() ? true : false;
    }

    // Inserts a join request record for a companion post
    public function sendRequest($data) {
        $stmt = $this->db->prepare("INSERT INTO companion_requests (post_id, requester_id, message, status) VALUES (?, ?, ?, 'pending')");
        return $stmt->execute([
            $data['post_id'],
            $data['requester_id'],
            $data['message'] ?? ''
        ]);
    }

    // Retrieves all join requests submitted for a specific companion post
    public function getRequestsForPost($postId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, u.full_name, u.email as requester_email, u.contact_no as requester_contact, u.gender as requester_gender, u.profile_photo as requester_photo, u.date_of_birth
            FROM companion_requests cr
            JOIN users u ON cr.requester_id = u.id
            WHERE cr.post_id = ?
            ORDER BY cr.created_at DESC
        ");
        $stmt->execute([$postId]);
        return $stmt->fetchAll();
    }

    // Retrieves join requests sent by a tourist
    public function getRequestsSentByTourist($touristId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, cp.destination_place, cp.start_date, cp.end_date, u.full_name as owner_name, u.email as owner_email, u.contact_no as owner_contact,
                   ROUND(IFNULL((SELECT AVG(rating) FROM companion_ratings WHERE post_id = cp.id), 0), 1) as trip_rating,
                   IFNULL((SELECT COUNT(*) FROM companion_ratings WHERE post_id = cp.id), 0) as trip_rating_count
            FROM companion_requests cr
            JOIN companion_posts cp ON cr.post_id = cp.id
            JOIN users u ON cp.owner_id = u.id
            WHERE cr.requester_id = ?
            ORDER BY cr.created_at DESC
        ");
        $stmt->execute([$touristId]);
        return $stmt->fetchAll();
    }

    // Retrieves join request details including requester and post owner contact info
    public function getRequestDetails($requestId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, cp.destination_place, cp.owner_id, 
                   req.full_name as requester_name, req.email as requester_email, req.contact_no as requester_contact,
                   own.full_name as owner_name, own.email as owner_email, own.contact_no as owner_contact
            FROM companion_requests cr
            JOIN companion_posts cp ON cr.post_id = cp.id
            JOIN users req ON cr.requester_id = req.id
            JOIN users own ON cp.owner_id = own.id
            WHERE cr.id = ?
        ");
        $stmt->execute([$requestId]);
        return $stmt->fetch();
    }

    // Updates the status of a specific companion request
    public function updateRequestStatus($requestId, $status) {
        $stmt = $this->db->prepare("UPDATE companion_requests SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $requestId]);
    }

    // Performs dynamic updates on a companion post's details
    public function updatePost($postId, $data) {
        $sql = "UPDATE companion_posts SET ";
        $updates = [];
        $params = [];

        if (isset($data['destination_place'])) {
            $updates[] = "destination_place = ?";
            $params[] = $data['destination_place'];
        }
        if (isset($data['budget_range'])) {
            $updates[] = "budget_range = ?";
            $params[] = $data['budget_range'];
        }
        if (isset($data['companions_needed'])) {
            $updates[] = "companions_needed = ?";
            $params[] = $data['companions_needed'];
        }
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
        }

        if (empty($updates)) {
            return true;
        }

        $sql .= implode(", ", $updates) . " WHERE id = ?";
        $params[] = $postId;
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // Deletes all interest tags associated with a companion post
    public function deletePostInterests($postId) {
        $stmt = $this->db->prepare("DELETE FROM companion_post_interests WHERE post_id = ?");
        return $stmt->execute([$postId]);
    }

    // Deletes all join requests associated with a companion post
    public function deletePostRequests($postId) {
        $stmt = $this->db->prepare("DELETE FROM companion_requests WHERE post_id = ?");
        return $stmt->execute([$postId]);
    }

    // Deletes a companion post by its database ID
    public function deletePost($postId) {
        $stmt = $this->db->prepare("DELETE FROM companion_posts WHERE id = ?");
        return $stmt->execute([$postId]);
    }

    // Marks a companion post status as closed
    public function closePost($postId) {
        $stmt = $this->db->prepare("UPDATE companion_posts SET status = 'closed' WHERE id = ?");
        return $stmt->execute([$postId]);
    }

    // Retrieves all join requests submitted to a user's companion posts
    public function getIncomingRequests($userId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, cp.destination_place, cp.start_date, cp.end_date,
                   req.full_name as requester_name, req.email as requester_email, req.contact_no as requester_contact, 
                   req.gender as requester_gender, req.profile_photo as requester_photo, req.date_of_birth
            FROM companion_requests cr
            JOIN companion_posts cp ON cr.post_id = cp.id
            JOIN users req ON cr.requester_id = req.id
            WHERE cp.owner_id = ?
            ORDER BY cr.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    // Retrieves the requester ID associated with a companion request
    public function getRequestRequesterId($requestId) {
        $stmt = $this->db->prepare("SELECT requester_id FROM companion_requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $row = $stmt->fetch();
        return $row ? $row['requester_id'] : null;
    }

    // Deletes a specific companion request by its database ID
    public function deleteRequest($requestId) {
        $stmt = $this->db->prepare("DELETE FROM companion_requests WHERE id = ?");
        return $stmt->execute([$requestId]);
    }

    // Submits a rating from a participant to another participant for a specific trip
    public function submitRating($postId, $raterId, $rateeId, $rating) {
        $stmt = $this->db->prepare("
            INSERT INTO companion_ratings (post_id, rater_id, ratee_id, rating)
            VALUES (?, ?, ?, ?)
        ");
        return $stmt->execute([$postId, $raterId, $rateeId, $rating]);
    }

    // Checks if a rating already exists for this trip, rater, and ratee
    public function hasRated($postId, $raterId, $rateeId) {
        $stmt = $this->db->prepare("
            SELECT id FROM companion_ratings
            WHERE post_id = ? AND rater_id = ? AND ratee_id = ?
        ");
        $stmt->execute([$postId, $raterId, $rateeId]);
        return $stmt->fetch() ? true : false;
    }

    // Retrieves all participants for a specific companion post (owner + accepted requesters)
    public function getParticipants($postId) {
        // First get the owner
        $stmt = $this->db->prepare("
            SELECT cp.owner_id as user_id, u.full_name, u.email, u.contact_no, u.gender, u.profile_photo, 'host' as role
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            WHERE cp.id = ?
        ");
        $stmt->execute([$postId]);
        $owner = $stmt->fetch();
        
        // Then get accepted requesters
        $stmt2 = $this->db->prepare("
            SELECT cr.requester_id as user_id, u.full_name, u.email, u.contact_no, u.gender, u.profile_photo, 'participant' as role
            FROM companion_requests cr
            JOIN users u ON cr.requester_id = u.id
            WHERE cr.post_id = ? AND cr.status = 'accepted'
        ");
        $stmt2->execute([$postId]);
        $requesters = $stmt2->fetchAll();

        $participants = [];
        if ($owner) {
            $participants[] = $owner;
        }
        foreach ($requesters as $req) {
            $participants[] = $req;
        }
        return $participants;
    }

    // Retrieves a user's gender
    public function getUserGender($userId) {
        $stmt = $this->db->prepare("SELECT gender FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ? $row['gender'] : null;
    }

    // Gets count of accepted join requests for a post
    public function getAcceptedCountForPost($postId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM companion_requests WHERE post_id = ? AND status = 'accepted'");
        $stmt->execute([$postId]);
        $row = $stmt->fetch();
        return $row ? intval($row['count']) : 0;
    }
}
