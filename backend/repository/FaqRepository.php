<?php
require_once __DIR__ . '/../config/db.php';

class FaqRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Inserts a standard, admin-defined FAQ entry
    public function create($question, $answer) {
        $stmt = $this->db->prepare("INSERT INTO faqs (user_id, question, answer) VALUES (NULL, ?, ?)");
        return $stmt->execute([$question, $answer]);
    }

    // Inserts an unanswered, user-submitted question
    public function askQuestion($question, $userId) {
        $stmt = $this->db->prepare("INSERT INTO faqs (user_id, question, answer) VALUES (?, ?, '')");
        return $stmt->execute([$userId, $question]);
    }

    // Retrieves all answered, admin-created public FAQ entries
    public function getActive() {
        $stmt = $this->db->prepare("SELECT * FROM faqs WHERE user_id IS NULL AND answer != '' AND answer IS NOT NULL ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Retrieves all answered, user-submitted Q&A entries with user profiles
    public function getUserQAs() {
        $stmt = $this->db->prepare("
            SELECT f.*, u.full_name, u.profile_photo, u.gender 
            FROM faqs f
            JOIN users u ON f.user_id = u.id
            WHERE f.answer != '' AND f.answer IS NOT NULL
            ORDER BY f.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Retrieves all FAQ records in the system
    public function getAll() {
        $stmt = $this->db->prepare("
            SELECT f.*, u.full_name as user_name, u.email as user_email
            FROM faqs f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Updates the question and answer texts for a specific FAQ record
    public function update($id, $question, $answer) {
        $stmt = $this->db->prepare("UPDATE faqs SET question = ?, answer = ? WHERE id = ?");
        return $stmt->execute([$question, $answer, $id]);
    }

    // Retrieves the contact info of the user who submitted a specific FAQ question
    public function getFaqUserInfo($id) {
        $stmtUser = $this->db->prepare("
            SELECT f.question, u.email, u.full_name 
            FROM faqs f
            JOIN users u ON f.user_id = u.id
            WHERE f.id = ? AND f.user_id IS NOT NULL
        ");
        $stmtUser->execute([$id]);
        return $stmtUser->fetch();
    }

    // Deletes an FAQ record by ID
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM faqs WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
