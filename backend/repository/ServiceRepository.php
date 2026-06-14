<?php
require_once __DIR__ . '/../config/db.php';

class ServiceRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Inserts a new service record with an enabled status
    public function create($data) {
        $sql = "INSERT INTO services (provider_id, service_type, name_of_institute, photo, contact_no, email, price, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'enabled')";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['provider_id'],
            $data['service_type'],
            $data['name_of_institute'],
            $data['photo'],
            $data['contact_no'],
            $data['email'],
            $data['price'],
            $data['description']
        ]);
    }

    // Updates service details by database ID
    public function update($id, $data) {
        $sql = "UPDATE services SET name_of_institute = ?, photo = ?, contact_no = ?, email = ?, price = ?, description = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name_of_institute'],
            $data['photo'],
            $data['contact_no'],
            $data['email'],
            $data['price'],
            $data['description'],
            $id
        ]);
    }

    // Deletes a service record by ID
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM services WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // Retrieves details for a specific service joined with average rating, review count, and provider's name
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count,
                   u.full_name as provider_name
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            LEFT JOIN users u ON s.provider_id = u.id
            WHERE s.id = ?
            GROUP BY s.id
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Retrieves all services registered by a specific provider
    public function getByProviderId($providerId) {
        $stmt = $this->db->prepare("
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            WHERE s.provider_id = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute([$providerId]);
        return $stmt->fetchAll();
    }

    // Retrieves all enabled services, optionally filtering by service category type
    public function getAllActive($type = null) {
        $sql = "
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            WHERE s.status = 'enabled'
        ";
        $params = [];
        if ($type) {
            $sql .= " AND s.service_type = ?";
            $params[] = $type;
        }
        $sql .= " GROUP BY s.id ORDER BY s.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    // Updates status of a service (e.g., enabled/disabled)
    public function toggleStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE services SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }

    // Checks if a tourist has already submitted a review for a service or the platform
    public function existsReview($touristId, $serviceId) {
        if ($serviceId !== null && $serviceId !== '') {
            $stmt = $this->db->prepare("SELECT id FROM reviews WHERE tourist_id = ? AND service_id = ?");
            $stmt->execute([$touristId, $serviceId]);
            return $stmt->fetch() ? true : false;
        } else {
            $stmt = $this->db->prepare("SELECT id FROM reviews WHERE tourist_id = ? AND service_id IS NULL");
            $stmt->execute([$touristId]);
            return $stmt->fetch() ? true : false;
        }
    }

    // Inserts a review entry for a service or the platform
    public function addReview($touristId, $serviceId, $rating, $comment) {
        $stmt = $this->db->prepare("INSERT INTO reviews (tourist_id, service_id, rating, comment) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$touristId, $serviceId, $rating, $comment]);
    }

    // Retrieves all reviews with tourist profiles for a specific service
    public function getReviews($serviceId) {
        $stmt = $this->db->prepare("
            SELECT r.*, u.full_name, u.profile_photo 
            FROM reviews r
            JOIN users u ON r.tourist_id = u.id
            WHERE r.service_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$serviceId]);
        return $stmt->fetchAll();
    }

    // Retrieves the latest reviews with client profiles across the platform
    public function getAllReviews() {
        $stmt = $this->db->prepare("
            SELECT r.*, u.full_name, u.profile_photo, u.gender, s.name_of_institute, s.service_type
            FROM reviews r
            JOIN users u ON r.tourist_id = u.id
            LEFT JOIN services s ON r.service_id = s.id
            ORDER BY r.created_at DESC
            LIMIT 6
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Gathers count statistics grouped by service type
    public function getStats() {
        $stmt = $this->db->prepare("
            SELECT service_type, COUNT(*) as count 
            FROM services 
            GROUP BY service_type
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
