<?php
require_once __DIR__ . '/../config/db.php';

class BookingRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    // Fetches the daily rate, institution name, email, and contact info for a service
    public function getServicePriceAndProvider($serviceId) {
        $stmt = $this->db->prepare("SELECT price, name_of_institute, email, contact_no FROM services WHERE id = ?");
        $stmt->execute([$serviceId]);
        return $stmt->fetch();
    }

    // Verifies if there are active bookings overlapping with the desired date range
    public function checkDateOverlap($serviceId, $startDate, $endDate) {
        $checkOverlap = $this->db->prepare("
            SELECT COUNT(*) FROM bookings 
            WHERE service_id = ? 
            AND status IN ('pending', 'completed')
            AND start_date <= ? 
            AND end_date >= ?
        ");
        $checkOverlap->execute([
            $serviceId,
            $endDate,
            $startDate
        ]);
        return $checkOverlap->fetchColumn() > 0;
    }

    // Inserts a new booking record with a pending status
    public function create($data, $ref_no, $total_price) {
        $sql = "INSERT INTO bookings (tourist_id, service_id, ref_no, start_date, end_date, price, status, booking_details)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['tourist_id'],
            $data['service_id'],
            $ref_no,
            $data['start_date'],
            $data['end_date'],
            $total_price,
            $data['booking_details'] ?? ''
        ]);
        if ($result) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    // Retrieves details for a specific booking joined with service and tourist profiles
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type, s.contact_no as service_contact, s.email as service_email,
                   t.full_name as tourist_name, t.contact_no as tourist_contact, t.email as tourist_email
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            WHERE b.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Retrieves all pending/completed booking dates for a service
    public function getByServiceId($serviceId) {
        $stmt = $this->db->prepare("
            SELECT start_date, end_date 
            FROM bookings 
            WHERE service_id = ? 
            AND status IN ('pending', 'completed')
            ORDER BY start_date ASC
        ");
        $stmt->execute([$serviceId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Retrieves all booking reservations made by a specific tourist
    public function getByTouristId($touristId) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type, s.photo as service_photo
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE b.tourist_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$touristId]);
        return $stmt->fetchAll();
    }

    // Retrieves all bookings received by a provider
    public function getByProviderId($providerId) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type,
                   t.full_name as tourist_name, t.contact_no as tourist_contact, t.email as tourist_email, t.profile_photo as tourist_profile_photo
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            WHERE s.provider_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$providerId]);
        return $stmt->fetchAll();
    }

    // Updates the status of a specific booking
    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }

    // Retrieves all system booking records joined with tourist and provider names
    public function getAllBookings() {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type, s.provider_id,
                   t.full_name as tourist_name, p.full_name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            JOIN users p ON s.provider_id = p.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
