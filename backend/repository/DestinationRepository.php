<?php
require_once __DIR__ . '/../config/db.php';

class DestinationRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Resolves a district name to its database ID, creating it if it does not exist
    public function resolveDistrictId($districtName) {
        $stmt = $this->db->prepare("SELECT id FROM districts WHERE name = ?");
        $stmt->execute([$districtName]);
        $row = $stmt->fetch();
        if ($row) {
            return $row['id'];
        } else {
            $stmt = $this->db->prepare("INSERT INTO districts (name) VALUES (?)");
            $stmt->execute([$districtName]);
            return $this->db->lastInsertId();
        }
    }

    // Inserts a new travel destination record
    public function create($data, $districtId) {
        $sql = "INSERT INTO destinations (name, district_id, admin_id, description, image, budget_category, interest_category, latitude, longitude, perfect_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $districtId,
            $data['admin_id'],
            $data['description'],
            $data['image'],
            $data['budget_category'],
            $data['interest_category'],
            $data['latitude'],
            $data['longitude'],
            $data['perfect_time'] ?? null
        ]);
    }

    // Updates an existing travel destination record by ID
    public function update($id, $data, $districtId) {
        $sql = "UPDATE destinations SET name = ?, district_id = ?, description = ?, image = ?, budget_category = ?, interest_category = ?, latitude = ?, longitude = ?, perfect_time = ?
                WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $districtId,
            $data['description'],
            $data['image'],
            $data['budget_category'],
            $data['interest_category'],
            $data['latitude'],
            $data['longitude'],
            $data['perfect_time'] ?? null,
            $id
        ]);
    }

    // Deletes a travel destination record by ID
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM destinations WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // Retrieves details for a specific destination joined with district name and admin name
    public function getById($id) {
        $sql = "SELECT d.id, d.name, dist.name as district, d.description, d.image, d.budget_category, d.interest_category, d.latitude, d.longitude, d.perfect_time, d.created_at, d.admin_id,
                       adm.full_name as admin_name
                FROM destinations d
                JOIN districts dist ON d.district_id = dist.id
                LEFT JOIN users adm ON d.admin_id = adm.id
                WHERE d.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Retrieves all destination records joined with districts and administrators
    public function getAll() {
        $sql = "SELECT d.id, d.name, dist.name as district, d.description, d.image, d.budget_category, d.interest_category, d.latitude, d.longitude, d.perfect_time, d.created_at, d.admin_id,
                       adm.full_name as admin_name
                FROM destinations d
                JOIN districts dist ON d.district_id = dist.id
                LEFT JOIN users adm ON d.admin_id = adm.id
                ORDER BY d.name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Filters and searches destination records based on keywords, district, budget, and interest categories
    public function search($filters = []) {
        $sql = "SELECT d.id, d.name, dist.name as district, d.description, d.image, d.budget_category, d.interest_category, d.latitude, d.longitude, d.perfect_time, d.created_at, d.admin_id,
                       adm.full_name as admin_name
                FROM destinations d
                JOIN districts dist ON d.district_id = dist.id
                LEFT JOIN users adm ON d.admin_id = adm.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['query'])) {
            $sql .= " AND (d.name LIKE ? OR dist.name LIKE ? OR d.description LIKE ?)";
            $searchVal = "%" . $filters['query'] . "%";
            $params[] = $searchVal;
            $params[] = $searchVal;
            $params[] = $searchVal;
        }

        if (!empty($filters['district'])) {
            $sql .= " AND dist.name = ?";
            $params[] = $filters['district'];
        }

        if (!empty($filters['interest_category'])) {
            $sql .= " AND d.interest_category = ?";
            $params[] = $filters['interest_category'];
        }

        if (!empty($filters['budget_category'])) {
            $sql .= " AND d.budget_category = ?";
            $params[] = $filters['budget_category'];
        }

        $sql .= " ORDER BY d.name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
