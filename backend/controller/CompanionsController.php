<?php
require_once __DIR__ . '/../services/CompanionService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class CompanionsController {
    private $compService;

    public function __construct() {
        $this->compService = new CompanionService();
    }

    // Endpoint creates a new trip companion search post
    public function create_post($input, $args) {
        AuthMiddleware::requireTourist();

        $input['owner_id'] = $_SESSION['user_id'];
        $this->compService->createPost($input);
        return ["success" => true, "message" => "Travel companion finder post created successfully."];
    }

    // Endpoint lists all active companion finder posts, filtered by destination and gender preference
    public function list_posts($input, $args) {
        $filters = [
            'destination' => $args['destination'] ?? '',
            'gender_preference' => $args['gender_preference'] ?? ''
        ];
        $posts = $this->compService->getPosts($filters);
        return ["success" => true, "posts" => $posts];
    }

    // Endpoint lists all companion posts created by the current tourist
    public function my_posts($input, $args) {
        AuthMiddleware::requireTourist();
        $posts = $this->compService->getMyPosts($_SESSION['user_id']);
        return ["success" => true, "posts" => $posts];
    }

    // Endpoint retrieves details of a specific companion finder post
    public function get_post($input, $args) {
        $id = $args['id'] ?? 0;
        $post = $this->compService->getPostById($id);
        return ["success" => true, "post" => $post];
    }

    // Endpoint submits a request to join another tourist's travel plan
    public function send_request($input, $args) {
        AuthMiddleware::requireTourist();

        $input['requester_id'] = $_SESSION['user_id'];
        $this->compService->sendRequest($input);
        return ["success" => true, "message" => "Request to join travel companion sent successfully."];
    }

    // Endpoint lists all join requests received for a specific post
    public function list_requests($input, $args) {
        AuthMiddleware::requireTourist();
        $postId = $args['post_id'] ?? 0;
        if (!is_numeric($postId) || intval($postId) <= 0) {
            throw new ValidationException("Invalid post ID.");
        }
        $requests = $this->compService->getRequestsForPost($postId, $_SESSION['user_id']);
        return ["success" => true, "requests" => $requests];
    }

    // Endpoint retrieves all join requests sent by the current tourist
    public function my_requests($input, $args) {
        AuthMiddleware::requireTourist();
        $requests = $this->compService->getRequestsSentByTourist($_SESSION['user_id']);
        return ["success" => true, "requests" => $requests];
    }

    // Endpoint updates (accepts or rejects) a companion request
    public function update_request($input, $args) {
        AuthMiddleware::requireTourist();
        $requestId = $input['request_id'] ?? 0;
        $status = $input['status'] ?? 'pending';
        
        if (!is_numeric($requestId) || intval($requestId) <= 0) {
            throw new ValidationException("Invalid request ID.");
        }
        if (!in_array($status, ['accepted', 'rejected', 'pending'])) {
            throw new ValidationException("Invalid status state.");
        }
        
        $this->compService->updateRequestStatus($requestId, $_SESSION['user_id'], $status);
        return ["success" => true, "message" => "Companion request updated."];
    }

    // Endpoint lists all incoming companion requests received for all posts owned by the user
    public function incoming_requests($input, $args) {
        AuthMiddleware::requireTourist();
        $requests = $this->compService->getIncomingRequests($_SESSION['user_id']);
        return ["success" => true, "requests" => $requests];
    }

    // Endpoint edits details of an existing companion finder post
    public function edit_post($input, $args) {
        AuthMiddleware::requireTourist();
        $postId = $input['post_id'] ?? 0;
        $this->compService->editPost($postId, $_SESSION['user_id'], $input);
        return ["success" => true, "message" => "Companion post updated successfully."];
    }

    // Endpoint deletes a companion finder post along with its interests and requests
    public function delete_post($input, $args) {
        AuthMiddleware::requireTourist();
        $postId = $input['post_id'] ?? $args['post_id'] ?? 0;
        if (!is_numeric($postId) || intval($postId) <= 0) {
            throw new ValidationException("Invalid post ID.");
        }
        $this->compService->deletePost($postId, $_SESSION['user_id']);
        return ["success" => true, "message" => "Companion post deleted."];
    }

    // Endpoint marks a companion post as closed to new requests
    public function close_post($input, $args) {
        AuthMiddleware::requireTourist();
        $postId = $input['post_id'] ?? $args['post_id'] ?? 0;
        if (!is_numeric($postId) || intval($postId) <= 0) {
            throw new ValidationException("Invalid post ID.");
        }
        $this->compService->closePost($postId, $_SESSION['user_id']);
        return ["success" => true, "message" => "Companion post closed. No more join requests accepted."];
    }

    // Endpoint cancels and removes a join request sent by the current user
    public function cancel_request($input, $args) {
        AuthMiddleware::requireTourist();
        $requestId = $input['request_id'] ?? $args['request_id'] ?? 0;
        if (!is_numeric($requestId) || intval($requestId) <= 0) {
            throw new ValidationException("Invalid request ID.");
        }
        $this->compService->cancelRequest($requestId, $_SESSION['user_id']);
        return ["success" => true, "message" => "Join request cancelled."];
    }
}
