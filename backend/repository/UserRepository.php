<?php
require_once __DIR__ . '/../config/db.php';

class UserRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Checks if a record already exists with the given email address
    public function existsEmail($email) {
        $stmt = $this->db->prepare("SELECT id FROM users_base WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() ? true : false;
    }

    // Inserts credentials into base user account table
    public function createBaseUser($email, $password_hash, $userType, $status) {
        $sql = "INSERT INTO users_base (email, password_hash, user_type, status) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email, $password_hash, $userType, $status]);
        return $this->db->lastInsertId();
    }

    // Inserts a profile record for a user in the role-specific profile table
    public function createProfile($userId, $profileTable, $data) {
        $profileSql = "INSERT INTO $profileTable (user_id, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $profileStmt = $this->db->prepare($profileSql);
        return $profileStmt->execute([
            $userId,
            $data['full_name'],
            $data['name_with_initial'],
            $data['nic_passport'],
            $data['contact_no'],
            $data['gender'],
            $data['date_of_birth'],
            $data['profile_photo'] ?? 'default_profile.jpg'
        ]);
    }

    // Updates password hash for the specified email address
    public function resetPassword($email, $password_hash) {
        $stmt = $this->db->prepare("UPDATE users_base SET password_hash = ? WHERE email = ?");
        return $stmt->execute([$password_hash, $email]);
    }

    // Retrieves full user and profile information matching an email address
    public function getByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    // Retrieves full user details matching a user ID
    public function getById($id) {
        $stmt = $this->db->prepare("SELECT id, email, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Retrieves only credentials status and type for a user ID
    public function getBaseUserById($id) {
        $stmt = $this->db->prepare("SELECT user_type FROM users_base WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Updates standard fields inside a user's role profile table
    public function updateProfile($id, $profileTable, $data) {
        $sql = "UPDATE $profileTable SET full_name = ?, name_with_initial = ?, contact_no = ?, profile_photo = ? WHERE user_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['full_name'],
            $data['name_with_initial'],
            $data['contact_no'],
            $data['profile_photo'],
            $id
        ]);
    }

    // Retrieves all admin profiles awaiting activation
    public function getPendingAdmins() {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE user_type = 'admin' AND status = 'pending'");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Retrieves all service provider profiles awaiting activation
    public function getPendingProviders() {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE user_type = 'provider' AND status = 'pending'");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Updates status of a base user account
    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE users_base SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }

    // Retrieves all active users excluding special system admins
    public function getAllUsers() {
        $stmt = $this->db->prepare("SELECT id, email, user_type, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo, status FROM users WHERE user_type != 'admin' OR email != 'dteugee2003@gmail.com'");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Begins a transaction
    public function beginTransaction() {
        return $this->db->beginTransaction();
    }

    // Commits a transaction
    public function commit() {
        return $this->db->commit();
    }

    // Rolls back a transaction
    public function rollBack() {
        return $this->db->rollBack();
    }
}
