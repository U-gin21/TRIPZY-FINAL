<?php
require_once __DIR__ . '/../validator/DestinationValidator.php';
require_once __DIR__ . '/../repository/DestinationRepository.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';

class DestinationService {
    private $destRepo;

    public function __construct() {
        $this->destRepo = new DestinationRepository();
    }

    // Validates input data, resolves the district ID, and creates a new destination record
    public function create($data) {
        DestinationValidator::validate($data);
        $districtId = $this->destRepo->resolveDistrictId($data['district']);
        return $this->destRepo->create($data, $districtId);
    }

    // Verifies destination existence, validates input data, and updates the record
    public function update($id, $data) {
        $existing = $this->destRepo->getById($id);
        if (!$existing) {
            throw new NotFoundException("Destination not found.");
        }
        DestinationValidator::validate($data);
        $districtId = $this->destRepo->resolveDistrictId($data['district']);
        return $this->destRepo->update($id, $data, $districtId);
    }

    // Deletes a destination record from the database by its ID
    public function delete($id) {
        return $this->destRepo->delete($id);
    }

    // Retrieves a destination by ID and throws a NotFoundException if it doesn't exist
    public function getById($id) {
        $data = $this->destRepo->getById($id);
        if (!$data) {
            throw new NotFoundException("Destination not found.");
        }
        return $data;
    }

    // Searches and filters destinations based on provided criteria
    public function search($filters) {
        return $this->destRepo->search($filters);
    }
}
