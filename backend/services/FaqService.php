<?php
require_once __DIR__ . '/../validator/FaqValidator.php';
require_once __DIR__ . '/../repository/FaqRepository.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';
require_once __DIR__ . '/../helper/Mailer.php';

class FaqService {
    private $faqRepo;

    public function __construct() {
        $this->faqRepo = new FaqRepository();
    }

    // Creates a new FAQ entry with a pre-defined question and answer
    public function create($question, $answer) {
        FaqValidator::validate(['question' => $question, 'answer' => $answer]);
        return $this->faqRepo->create($question, $answer);
    }

    // Submits a user-provided question to the FAQ table for administrator review and answers
    public function askQuestion($question, $userId) {
        if (empty($question)) {
            throw new ValidationException("Question is required.");
        }
        if (strlen($question) > 1000) {
            throw new ValidationException("Question cannot exceed 1000 characters.");
        }
        return $this->faqRepo->askQuestion($question, $userId);
    }

    // Retrieves all active/answered standard FAQ entries for public listing
    public function getActive() {
        return $this->faqRepo->getActive();
    }

    // Retrieves user-submitted questions along with answers that have been published
    public function getUserQAs() {
        return $this->faqRepo->getUserQAs();
    }

    // Retrieves all FAQ records in the system (both standard FAQs and user-submitted questions)
    public function getAll() {
        return $this->faqRepo->getAll();
    }

    // Updates an FAQ entry and sends an email notification to the user if their question was answered
    public function update($id, $question, $answer) {
        FaqValidator::validate(['question' => $question, 'answer' => $answer]);

        $result = $this->faqRepo->update($id, $question, $answer);

        // Send email notification to user if this is a user-submitted question and was answered
        if ($result && !empty($answer)) {
            $userInfo = $this->faqRepo->getFaqUserInfo($id);
            if ($userInfo) {
                $subject = "Your question on Tripzy was answered!";
                $body = "<h2>Hello " . htmlspecialchars($userInfo['full_name']) . ",</h2>";
                $body .= "<p>Your question on Tripzy has been answered by an administrator.</p>";
                $body .= "<p><strong>Your Question:</strong><br>" . htmlspecialchars($userInfo['question']) . "</p>";
                $body .= "<p><strong>Administrator's Answer:</strong><br>" . htmlspecialchars($answer) . "</p>";
                $body .= "<p>Thank you for engaging with us!</p>";
                $body .= "<p>Best Regards,<br>The Tripzy Team</p>";
                
                Mailer::send($userInfo['email'], $subject, $body);
            }
        }

        return $result;
    }

    // Deletes an FAQ entry from the database by its ID
    public function delete($id) {
        return $this->faqRepo->delete($id);
    }
}
