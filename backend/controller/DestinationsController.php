<?php
require_once __DIR__ . '/../services/DestinationService.php';
require_once __DIR__ . '/../helper/UploadHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DestinationsController {
    private $destService;

    public function __construct() {
        $this->destService = new DestinationService();
    }

    // Endpoint retrieves list of all destinations (aliases search)
    public function list($input, $args) {
        return $this->search($input, $args);
    }
    
    // Endpoint filters and searches travel destinations
    public function search($input, $args) {
        $filters = [
            'query' => $args['query'] ?? '',
            'district' => $args['district'] ?? '',
            'interest_category' => $args['interest_category'] ?? '',
            'budget_category' => $args['budget_category'] ?? '',
            'activity' => $args['activity'] ?? ''
        ];
        $data = $this->destService->search($filters);
        return ["success" => true, "destinations" => $data];
    }

    // Endpoint retrieves details of a specific destination
    public function get($input, $args) {
        $id = $args['id'] ?? 0;
        $data = $this->destService->getById($id);
        return ["success" => true, "destination" => $data];
    }

    // Endpoint creates a new destination, handles file upload
    public function create($input, $args) {
        AuthMiddleware::requireAdmin();

        $photo = 'default_destination.jpg';
        if (isset($_FILES['image'])) {
            $uploaded = UploadHelper::uploadImageFile('image', dirname(__DIR__) . '/uploads/destinations/');
            if ($uploaded) {
                $photo = 'destinations/' . $uploaded;
            }
        }
        $input['image'] = $photo;
        $input['admin_id'] = $_SESSION['user_id'];

        $this->destService->create($input);
        return ["success" => true, "message" => "Destination created successfully."];
    }

    // Endpoint updates destination details, handles file upload
    public function update($input, $args) {
        AuthMiddleware::requireAdmin();
        $id = $args['id'] ?? 0;
        $existing = $this->destService->getById($id);

        $photo = $existing['image'];
        if (isset($_FILES['image'])) {
            $uploaded = UploadHelper::uploadImageFile('image', dirname(__DIR__) . '/uploads/destinations/');
            if ($uploaded) {
                $photo = 'destinations/' . $uploaded;
            }
        }
        $input['image'] = $photo;
        $input['admin_id'] = $_SESSION['user_id'];

        $this->destService->update($id, $input);
        return ["success" => true, "message" => "Destination updated successfully."];
    }

    // Endpoint deletes a destination record
    public function delete($input, $args) {
        AuthMiddleware::requireAdmin();
        $id = $args['id'] ?? $input['id'] ?? 0;
        $this->destService->delete($id);
        return ["success" => true, "message" => "Destination deleted successfully."];
    }
}
