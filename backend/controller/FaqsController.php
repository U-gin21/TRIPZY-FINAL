<?php
require_once __DIR__ . '/../services/FaqService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class FaqsController {
    private $faqService;

    public function __construct() {
        $this->faqService = new FaqService();
    }

    // Endpoint lists all FAQ records in the system
    public function list($input, $args) {
        $faqs = $this->faqService->getAll();
        return ["success" => true, "faqs" => $faqs];
    }

    // Endpoint creates a new standard FAQ question and answer
    public function create($input, $args) {
        AuthMiddleware::requireAdmin();
        $this->faqService->create($input['question'], $input['answer']);
        return ["success" => true, "message" => "FAQ added successfully."];
    }

    // Endpoint updates question/answer values or provides replies for user queries
    public function update($input, $args) {
        AuthMiddleware::requireAdmin();
        if (empty($input['id'])) {
            throw new ValidationException("ID is required.");
        }
        if (!is_numeric($input['id']) || intval($input['id']) <= 0) {
            throw new ValidationException("ID must be a positive integer.");
        }
        
        $this->faqService->update($input['id'], $input['question'], $input['answer']);
        return ["success" => true, "message" => "FAQ updated successfully."];
    }

    // Endpoint deletes an FAQ entry
    public function delete($input, $args) {
        AuthMiddleware::requireAdmin();
        $id = $args['id'] ?? $input['id'] ?? 0;
        if (!is_numeric($id) || intval($id) <= 0) {
            throw new ValidationException("ID must be a positive integer.");
        }
        $this->faqService->delete($id);
        return ["success" => true, "message" => "FAQ deleted successfully."];
    }
}
