<?php
require_once __DIR__ . '/../validator/ServiceValidator.php';
require_once __DIR__ . '/../repository/ServiceRepository.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class ServiceService {
    private $serviceRepo;

    public function __construct() {
        $this->serviceRepo = new ServiceRepository();
    }

    // Creates a new travel/tourism service offering (e.g., guide, hotel, transport) after validating input
    public function create($data) {
        ServiceValidator::validate($data);
        return $this->serviceRepo->create($data);
    }

    // Updates an existing service offering details after validating input
    public function update($id, $data) {
        ServiceValidator::validate($data);
        return $this->serviceRepo->update($id, $data);
    }

    // Deletes a service offering from the database by its ID
    public function delete($id) {
        return $this->serviceRepo->delete($id);
    }

    // Retrieves a specific service offering by its ID and throws an exception if not found
    public function getById($id) {
        $service = $this->serviceRepo->getById($id);
        if (!$service) {
            throw new NotFoundException("Service not found.");
        }
        return $service;
    }

    // Retrieves all service offerings published by a specific provider
    public function getByProviderId($providerId) {
        return $this->serviceRepo->getByProviderId($providerId);
    }

    // Retrieves all active services, optionally filtered by a specific service type
    public function getAllActive($type = null) {
        return $this->serviceRepo->getAllActive($type);
    }

    // Activates or deactivates a service offering availability status
    public function toggleStatus($id, $status) {
        return $this->serviceRepo->toggleStatus($id, $status);
    }

    // Submits a review and rating for a specific service or the entire platform after validation
    public function addReview($touristId, $serviceId, $rating, $comment) {
        ServiceValidator::validateReview(['rating' => $rating, 'comment' => $comment]);

        if ($this->serviceRepo->existsReview($touristId, $serviceId)) {
            if ($serviceId !== null && $serviceId !== '') {
                throw new ValidationException("You have already reviewed this service.");
            } else {
                throw new ValidationException("You have already submitted a platform review.");
            }
        }

        $serviceIdVal = ($serviceId !== null && $serviceId !== '') ? $serviceId : null;
        return $this->serviceRepo->addReview($touristId, $serviceIdVal, $rating, $comment);
    }

    // Retrieves all feedback reviews submitted for a specific service ID
    public function getReviews($serviceId) {
        return $this->serviceRepo->getReviews($serviceId);
    }

    // Retrieves all reviews submitted across the entire platform
    public function getAllReviews() {
        return $this->serviceRepo->getAllReviews();
    }

    // Retrieves statistical analytics related to services, categories, and review ratings
    public function getStats() {
        return $this->serviceRepo->getStats();
    }
}
