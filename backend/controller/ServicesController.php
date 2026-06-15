<?php
require_once __DIR__ . '/../services/ServiceService.php';
require_once __DIR__ . '/../helper/UploadHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../exceptions/ForbiddenException.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class ServicesController {
    private $serviceService;

    public function __construct() {
        $this->serviceService = new ServiceService();
    }

    // Endpoint retrieves all active service offerings, optionally filtered by type
    public function list($input, $args) {
        $type = $args['type'] ?? null;
        $data = $this->serviceService->getAllActive($type);
        return ["success" => true, "services" => $data];
    }

    // Endpoint retrieves all service offerings created by the current provider
    public function provider_list($input, $args) {
        AuthMiddleware::requireProvider();
        $data = $this->serviceService->getByProviderId($_SESSION['user_id']);
        return ["success" => true, "services" => $data];
    }

    // Endpoint retrieves a single service details along with all its user reviews
    public function get($input, $args) {
        $id = $args['id'] ?? 0;
        $service = $this->serviceService->getById($id);
        $reviews = $this->serviceService->getReviews($id);
        return ["success" => true, "service" => $service, "reviews" => $reviews];
    }

    // Endpoint allows providers to create a new service offering and uploads its image
    public function create($input, $args) {
        AuthMiddleware::requireProvider();

        $photo = '';
        if (isset($_FILES['photo'])) {
            $uploaded = UploadHelper::uploadImageFile('photo', dirname(__DIR__) . '/uploads/services/');
            if ($uploaded) {
                $photo = 'services/' . $uploaded;
            }
        } else {
            throw new ValidationException("Service image photo is required.");
        }
        
        $input['provider_id'] = $_SESSION['user_id'];
        $input['photo'] = $photo;
        
        $this->serviceService->create($input);
        return ["success" => true, "message" => "Service post created successfully."];
    }

    // Endpoint allows providers to update service details and uploads a replacement image if provided
    public function update($input, $args) {
        AuthMiddleware::requireProvider();
        $id = $args['id'] ?? 0;
        $existing = $this->serviceService->getById($id);
        
        if ($existing['provider_id'] != $_SESSION['user_id']) {
            throw new ForbiddenException("Unauthorized to edit this service.");
        }

        $photo = $existing['photo'];
        if (isset($_FILES['photo'])) {
            $uploaded = UploadHelper::uploadImageFile('photo', dirname(__DIR__) . '/uploads/services/');
            if ($uploaded) {
                $photo = 'services/' . $uploaded;
            }
        }
        $input['photo'] = $photo;
        
        $this->serviceService->update($id, $input);
        return ["success" => true, "message" => "Service post updated successfully."];
    }

    // Endpoint allows providers to delete their service offering
    public function delete($input, $args) {
        AuthMiddleware::requireProvider();
        $id = $args['id'] ?? $input['id'] ?? 0;
        $existing = $this->serviceService->getById($id);
        if ($existing['provider_id'] != $_SESSION['user_id']) {
            throw new ForbiddenException("Unauthorized to delete this service.");
        }
        $this->serviceService->delete($id);
        return ["success" => true, "message" => "Service post deleted."];
    }

    // Endpoint allows providers to toggle a service between enabled and disabled status
    public function toggle_status($input, $args) {
        AuthMiddleware::requireProvider();
        $id = $input['id'] ?? 0;
        $status = $input['status'] ?? 'enabled';
        $existing = $this->serviceService->getById($id);
        if ($existing['provider_id'] != $_SESSION['user_id']) {
            throw new ForbiddenException("Unauthorized.");
        }
        $this->serviceService->toggleStatus($id, $status);
        return ["success" => true, "message" => "Listing status updated."];
    }

    // Endpoint allows tourists to add a rating review for a service or the platform
    public function add_review($input, $args) {
        AuthMiddleware::requireTourist();
        $this->serviceService->addReview($_SESSION['user_id'], $input['service_id'], $input['rating'], $input['comment']);
        return ["success" => true, "message" => "Review and rating submitted."];
    }

    // Endpoint retrieves a subset of recent feedback reviews for landing page layout
    public function all_reviews($input, $args) {
        $reviews = $this->serviceService->getAllReviews();
        return ["success" => true, "reviews" => $reviews];
    }
}
