<?php
require_once __DIR__ . '/../validator/CompanionValidator.php';
require_once __DIR__ . '/../repository/CompanionRepository.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';
require_once __DIR__ . '/../exceptions/ForbiddenException.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';
require_once __DIR__ . '/../helper/Mailer.php';

class CompanionService {
    private $compRepo;

    public function __construct() {
        $this->compRepo = new CompanionRepository();
    }

    // Creates a new travel companion search post and links travel interest tags within a transaction
    public function createPost($data) {
        CompanionValidator::validatePost($data);

        $this->compRepo->beginTransaction();
        try {
            $postId = $this->compRepo->createPost($data);
            if ($postId) {
                if (!empty($data['travel_interests'])) {
                    $interests = array_map('trim', explode(',', $data['travel_interests']));
                    foreach ($interests as $interest) {
                        if ($interest !== '') {
                            $this->compRepo->createPostInterest($postId, $interest);
                        }
                    }
                }
                $this->compRepo->commit();
                return true;
            }
            throw new Exception("Failed to insert companion post.");
        } catch (Exception $e) {
            $this->compRepo->rollBack();
            throw $e;
        }
    }

    // Retrieves all companion matching posts based on search filter criteria
    public function getPosts($filters = []) {
        return $this->compRepo->getPosts($filters);
    }

    // Retrieves a specific travel companion post by its database ID and throws an exception if not found
    public function getPostById($id) {
        $post = $this->compRepo->getPostById($id);
        if (!$post) {
            throw new NotFoundException("Post not found.");
        }
        return $post;
    }

    // Retrieves all companion finder posts authored by the specified user
    public function getMyPosts($userId) {
        return $this->compRepo->getMyPosts($userId);
    }

    // Submits a request to join a specific trip post after verifying the post is open, belongs to someone else, and hasn't been requested already
    public function sendRequest($data) {
        CompanionValidator::validateRequest($data);

        $post = $this->compRepo->getPostById($data['post_id']);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }
        if ($post['status'] !== 'open') {
            throw new ValidationException("This travel companion finder post is closed.");
        }
        if (strtotime($post['end_date']) < strtotime(date('Y-m-d'))) {
            throw new ValidationException("This travel companion finder post has expired because the trip end date has passed.");
        }
        if ($post['owner_id'] == $data['requester_id']) {
            throw new ValidationException("You cannot send a join request to your own trip post.");
        }

        // Validate gender preference matches requester's gender
        if ($post['gender_preference'] !== 'Any') {
            $requesterGender = $this->compRepo->getUserGender($data['requester_id']);
            if ($requesterGender && strcasecmp($post['gender_preference'], $requesterGender) !== 0) {
                throw new ValidationException("This trip is open to " . htmlspecialchars($post['gender_preference']) . " companions only. You cannot join.");
            }
        }

        if ($this->compRepo->existsRequest($data['post_id'], $data['requester_id'])) {
            throw new ValidationException("You have already sent a request to join this trip.");
        }

        return $this->compRepo->sendRequest($data);
    }

    // Retrieves all join requests submitted for a post after verifying the caller is the post owner
    public function getRequestsForPost($postId, $userId) {
        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }
        if ($post['owner_id'] != $userId) {
            throw new ForbiddenException("Access denied.");
        }
        return $this->compRepo->getRequestsForPost($postId);
    }

    // Retrieves join requests sent by a specific tourist
    public function getRequestsSentByTourist($touristId) {
        return $this->compRepo->getRequestsSentByTourist($touristId);
    }

    // Updates status of a join request and emails mutual contact information to both parties if accepted
    public function updateRequestStatus($requestId, $userId, $status) {
        $request = $this->compRepo->getRequestDetails($requestId);
        if (!$request) {
            throw new NotFoundException("Request not found.");
        }
        if ($request['owner_id'] != $userId) {
            throw new ForbiddenException("Access denied. You do not own the post associated with this request.");
        }

        if ($request['status'] === $status) {
            return true;
        }

        $result = $this->compRepo->updateRequestStatus($requestId, $status);

        if ($result && $status === 'accepted') {
            // Close post if companions_needed has been reached
            $post = $this->compRepo->getPostById($request['post_id']);
            if ($post) {
                $acceptedCount = $this->compRepo->getAcceptedCountForPost($request['post_id']);
                if ($acceptedCount >= intval($post['companions_needed'])) {
                    $this->compRepo->closePost($request['post_id']);
                }
            }

            // Share details with requester via email
            $subject = "Tripzy Companion Request Accepted!";
            $body = "<h2>Great News, " . htmlspecialchars($request['requester_name']) . "!</h2>";
            $body .= "<p>Your request to join the travel plan to <strong>" . htmlspecialchars($request['destination_place']) . "</strong> has been <strong>ACCEPTED</strong> by " . htmlspecialchars($request['owner_name']) . ".</p>";
            $body .= "<h3>Contact Details Shared:</h3>";
            $body .= "<ul>";
            $body .= "<li><strong>Travel Companion Name:</strong> " . htmlspecialchars($request['owner_name']) . "</li>";
            $body .= "<li><strong>Email Address:</strong> " . htmlspecialchars($request['owner_email']) . "</li>";
            $body .= "<li><strong>Contact Phone:</strong> " . htmlspecialchars($request['owner_contact']) . "</li>";
            $body .= "</ul>";
            $body .= "<p>You are now matched as travel companions. Get in touch and enjoy your trip together!</p>";
            $body .= "<p>Warm Regards,<br>Tripzy Sri Lanka Team</p>";
            Mailer::send($request['requester_email'], $subject, $body);

            // Also email the owner with requester details for completeness
            $owner_subject = "Companion Request Approved: Details Shared";
            $owner_body = "<h2>Hello " . htmlspecialchars($request['owner_name']) . ",</h2>";
            $owner_body .= "<p>You accepted " . htmlspecialchars($request['requester_name']) . "'s request to join your trip to <strong>" . htmlspecialchars($request['destination_place']) . "</strong>.</p>";
            $owner_body .= "<h3>Requester's Contact Details:</h3>";
            $owner_body .= "<ul>";
            $owner_body .= "<li><strong>Name:</strong> " . htmlspecialchars($request['requester_name']) . "</li>";
            $owner_body .= "<li><strong>Email:</strong> " . htmlspecialchars($request['requester_email']) . "</li>";
            $owner_body .= "<li><strong>Contact Phone:</strong> " . htmlspecialchars($request['requester_contact']) . "</li>";
            $owner_body .= "</ul>";
            $owner_body .= "<p>Happy Traveling!</p>";
            Mailer::send($request['owner_email'], $owner_subject, $owner_body);
        }

        return $result;
    }

    // Updates travel post information and adjusts associated interest tags inside a transaction
    public function editPost($postId, $userId, $data) {
        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }
        if ($post['owner_id'] != $userId) {
            throw new ForbiddenException("Access denied. You can only edit your own posts.");
        }

        CompanionValidator::validatePost($data);

        $this->compRepo->beginTransaction();
        try {
            $result = $this->compRepo->updatePost($postId, $data);

            if (isset($data['travel_interests'])) {
                $this->compRepo->deletePostInterests($postId);
                $interests = array_map('trim', explode(',', $data['travel_interests']));
                foreach ($interests as $interest) {
                    if ($interest !== '') {
                        $this->compRepo->createPostInterest($postId, $interest);
                    }
                }
            }
            $this->compRepo->commit();
            return $result;
        } catch (Exception $e) {
            $this->compRepo->rollBack();
            throw $e;
        }
    }

    // Deletes a travel post along with all related requests and interest tags within a transaction
    public function deletePost($postId, $userId) {
        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }
        if ($post['owner_id'] != $userId) {
            throw new ForbiddenException("Access denied. You can only delete your own posts.");
        }

        $this->compRepo->beginTransaction();
        try {
            $this->compRepo->deletePostRequests($postId);
            $this->compRepo->deletePostInterests($postId);
            $result = $this->compRepo->deletePost($postId);
            $this->compRepo->commit();
            return $result;
        } catch (Exception $e) {
            $this->compRepo->rollBack();
            throw $e;
        }
    }

    // Marks a travel companion post as closed to prevent further join requests
    public function closePost($postId, $userId) {
        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }
        if ($post['owner_id'] != $userId) {
            throw new ForbiddenException("Access denied. You can only close your own posts.");
        }
        return $this->compRepo->closePost($postId);
    }

    // Retrieves all incoming join requests received for any travel posts owned by the specified user
    public function getIncomingRequests($userId) {
        return $this->compRepo->getIncomingRequests($userId);
    }

    // Cancels and deletes a join request submitted by the current user
    public function cancelRequest($requestId, $userId) {
        $requesterId = $this->compRepo->getRequestRequesterId($requestId);
        if ($requesterId === null) {
            throw new NotFoundException("Companion request not found.");
        }
        if ($requesterId != $userId) {
            throw new ForbiddenException("Access denied. You can only cancel your own requests.");
        }
        return $this->compRepo->deleteRequest($requestId);
    }

    // Retrieves other participants for a trip and indicates if the user has already rated them
    public function getRateableParticipants($postId, $userId) {
        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }

        // Verify trip is ended
        if (strtotime($post['end_date']) >= strtotime(date('Y-m-d'))) {
            throw new ValidationException("You can only rate companions after the trip end date.");
        }

        $participants = $this->compRepo->getParticipants($postId);
        
        // Trip is confirmed if there is at least one accepted participant (meaning total participants > 1, since post owner is always there)
        if (count($participants) <= 1) {
            throw new ValidationException("This trip was not confirmed (no accepted travel companions).");
        }

        // Check if the current user is a participant of this trip
        $isUserParticipant = false;
        foreach ($participants as $p) {
            if ($p['user_id'] == $userId) {
                $isUserParticipant = true;
                break;
            }
        }

        if (!$isUserParticipant) {
            throw new ForbiddenException("Access denied. You were not a participant of this trip.");
        }

        // Filter out the current user and check rating status for others
        $rateable = [];
        foreach ($participants as $p) {
            if ($p['user_id'] != $userId) {
                $p['has_rated'] = $this->compRepo->hasRated($postId, $userId, $p['user_id']);
                $rateable[] = $p;
            }
        }

        return $rateable;
    }

    // Submits a rating for another participant of the trip
    public function submitRating($postId, $raterId, $rateeId, $rating) {
        if ($raterId == $rateeId) {
            throw new ValidationException("You cannot rate yourself.");
        }

        if (!is_numeric($rating) || intval($rating) < 1 || intval($rating) > 10) {
            throw new ValidationException("Rating must be an integer between 1 and 10.");
        }

        $post = $this->compRepo->getPostById($postId);
        if (!$post) {
            throw new NotFoundException("Companion post not found.");
        }

        // Verify trip is ended
        if (strtotime($post['end_date']) >= strtotime(date('Y-m-d'))) {
            throw new ValidationException("You can only rate companions after the trip end date.");
        }

        $participants = $this->compRepo->getParticipants($postId);
        
        // Trip is confirmed if there is at least one accepted participant
        if (count($participants) <= 1) {
            throw new ValidationException("This trip was not confirmed (no accepted travel companions).");
        }

        // Check if both rater and ratee are participants
        $isRaterParticipant = false;
        $isRateeParticipant = false;
        foreach ($participants as $p) {
            if ($p['user_id'] == $raterId) $isRaterParticipant = true;
            if ($p['user_id'] == $rateeId) $isRateeParticipant = true;
        }

        if (!$isRaterParticipant) {
            throw new ForbiddenException("Access denied. You were not a participant of this trip.");
        }
        if (!$isRateeParticipant) {
            throw new ValidationException("The user you are trying to rate was not a participant of this trip.");
        }

        // Check if already rated
        if ($this->compRepo->hasRated($postId, $raterId, $rateeId)) {
            throw new ValidationException("You have already rated this companion for this trip.");
        }

        return $this->compRepo->submitRating($postId, $raterId, $rateeId, intval($rating));
    }
}
