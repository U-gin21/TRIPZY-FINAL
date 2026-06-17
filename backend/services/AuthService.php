<?php
require_once __DIR__ . '/../validator/UserValidator.php';
require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';
require_once __DIR__ . '/../exceptions/AuthException.php';
require_once __DIR__ . '/../helper/Mailer.php';

class AuthService {
    private $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    // Registers a new user, checks eligibility rules, sets initial status, creates profile records within a transaction, and triggers a welcome email
    public function register($data) {
        UserValidator::validateRegister($data);

        // Calculate age and restrict under 18
        $dob = new DateTime($data['date_of_birth']);
        $today = new DateTime();
        $age = $today->diff($dob)->y;
        if ($age < 18) {
            throw new ValidationException("You must be 18 years or older to register.");
        }

        // Email address check
        if ($this->userRepo->existsEmail($data['email'])) {
            throw new ValidationException("The email address is already registered.");
        }

        // Determine registration status
        $status = 'active'; // Tourists are active by default
        if ($data['user_type'] === 'provider' || $data['user_type'] === 'admin') {
            $status = 'pending';
        }

        // Special Admin Account
        if ($data['email'] === 'dteugee2003@gmail.com') {
            $status = 'active';
        }

        $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);
        
        $this->userRepo->beginTransaction();
        try {
            $userId = $this->userRepo->createBaseUser($data['email'], $password_hash, $data['user_type'], $status);

            if ($userId) {
                // Insert into the role-specific profile table
                $profileTable = '';
                if ($data['user_type'] === 'tourist') {
                    $profileTable = 'tourist_profiles';
                } elseif ($data['user_type'] === 'provider') {
                    $profileTable = 'provider_profiles';
                } elseif ($data['user_type'] === 'admin') {
                    $profileTable = 'admin_profiles';
                } else {
                    throw new ValidationException("Invalid user type.");
                }

                $this->userRepo->createProfile($userId, $profileTable, $data);
                
                $this->userRepo->commit();
                
                // Send registration notification via PHPMailer (after transaction commit)
                $subject = "Welcome to Tripzy Sri Lanka!";
                $body = "<h2>Hello " . htmlspecialchars($data['full_name']) . ",</h2>";
                $body .= "<p>Thank you for registering on Tripzy - Smart Tourism Management and Booking System for Sri Lanka.</p>";
                if ($status === 'pending') {
                    $body .= "<p>Your account is currently <strong>pending verification/approval</strong>. We will notify you via email as soon as an administrator approves your account.</p>";
                } else {
                    $body .= "<p>Your account is now active! You can log in and start using our platform.</p>";
                }
                $body .= "<p>Warm Regards,<br>The Tripzy Team</p>";
                
                Mailer::send($data['email'], $subject, $body);

                return $userId;
            } else {
                throw new Exception("Failed to insert user credentials.");
            }
        } catch (Exception $e) {
            $this->userRepo->rollBack();
            throw $e;
        }
    }

    // Authenticates a user by email and password, verifying that their account is active before returning user details
    public function login($email, $password) {
        $user = $this->userRepo->getByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['status'] === 'pending') {
                throw new AuthException("Your account is pending admin approval.");
            }
            if ($user['status'] === 'rejected') {
                throw new AuthException("Your account approval has been rejected.");
            }
            if ($user['status'] === 'suspended') {
                throw new AuthException("Your account has been suspended by an administrator.");
            }
            return $user;
        }
        throw new AuthException("Invalid email or password.");
    }

    // Retrieves user details by database ID
    public function getById($id) {
        return $this->userRepo->getById($id);
    }

    // Checks if an email address is already registered
    public function existsEmail($email) {
        return $this->userRepo->existsEmail($email);
    }

    // Hashes the new password and updates it for the associated email address
    public function resetPassword($email, $password) {
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        return $this->userRepo->resetPassword($email, $password_hash);
    }
}
