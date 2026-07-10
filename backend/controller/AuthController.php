<?php
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../helper/UploadHelper.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    // Endpoint handles profile photo upload and tourist/provider registration
    public function register($input, $args) {
        // Handle Profile Photo Upload if present
        $photo = 'default_profile.jpg';
        if (isset($_FILES['profile_photo'])) {
            $targetDir = dirname(__DIR__) . '/uploads/profiles/';
            $uploaded = UploadHelper::uploadImageFile('profile_photo', $targetDir);
            if ($uploaded) {
                $photo = 'profiles/' . $uploaded;
            }
        }
        $input['profile_photo'] = $photo;
        
        $userId = $this->authService->register($input);
        return ["success" => true, "message" => "Registration successful!", "user_id" => $userId];
    }

    // Endpoint handles user authentication credentials and establishes session data
    public function login($input, $args) {
        if (empty($input['email']) || empty($input['password'])) {
            throw new ValidationException("Email and Password are required.");
        }
        
        $user = $this->authService->login($input['email'], $input['password']);
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['last_activity'] = time();
        
        return [
            "success" => true,
            "message" => "Login successful!",
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "user_type" => $user['user_type'],
                "full_name" => $user['full_name'],
                "profile_photo" => $user['profile_photo']
            ]
        ];
    }

    // Endpoint destroys the user session and logs the client out
    public function logout($input, $args) {
        $_SESSION = array();
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        
        session_start();
        session_regenerate_id(true);
        
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        
        $isHTTPS = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        $isLocalhost = isset($_SERVER['HTTP_HOST']) && (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false);
        $cookieSameSite = ($isHTTPS || $isLocalhost) ? 'None' : 'Lax';
        $cookieSecure = $isHTTPS || $isLocalhost;
        
        setcookie('XSRF-TOKEN', $_SESSION['csrf_token'], [
            'expires' => 0,
            'path' => '/',
            'secure' => $cookieSecure,
            'httponly' => false,
            'samesite' => $cookieSameSite
        ]);

        return ["success" => true, "message" => "Logged out successfully."];
    }

    // Endpoint retrieves profile information of the currently logged-in user
    public function me($input, $args) {
        if (isset($_SESSION['user_id'])) {
            $user = $this->authService->getById($_SESSION['user_id']);
            if ($user) {
                return ["success" => true, "user" => $user];
            } else {
                session_destroy();
                throw new ValidationException("Session user not found.");
            }
        } else {
            return ["success" => false, "message" => "Not authenticated."];
        }
    }

    // Endpoint generates a password reset token and emails it to the user
    public function forgot_password($input, $args) {
        if (empty($input['email'])) {
            throw new ValidationException("Email is required.");
        }
        if (!$this->authService->existsEmail($input['email'])) {
            throw new ValidationException("Email address is not registered.");
        }
        $token = rand(100000, 999999);
        $_SESSION['reset_email'] = $input['email'];
        $_SESSION['reset_token'] = $token;
        $_SESSION['reset_expires'] = time() + 900; // 15 minutes validity
        $_SESSION['reset_verified'] = false;
        
        $subject = "Tripzy Password Reset Request";
        $body = "<h2>Tripzy Password Reset</h2>";
        $body .= "<p>Hello,</p>";
        $body .= "<p>We received a request to reset the password for the Tripzy account associated with this email address.</p>";
        $body .= "<p><strong>Verification Token:</strong></p>";
        $body .= "<h3 style='letter-spacing: 0.15em;'>$token</h3>";
        $body .= "<p>Enter this code in the verification form to confirm your identity.</p>";
        $body .= "<p>If you did not request this change, please ignore this email.</p>";
        $body .= "<p>Warm regards,<br>Tripzy Sri Lanka Team</p>";
        
        if (!Mailer::send($input['email'], $subject, $body)) {
            throw new Exception("Failed to send password reset email. Please try again later.");
        }
        return ["success" => true, "message" => "Reset code sent to your email."];
    }

    // Endpoint validates the email reset verification OTP
    public function verify_reset_token($input, $args) {
        if (empty($input['token'])) {
            throw new ValidationException("Verification token is required.");
        }
        if (!isset($_SESSION['reset_token']) || !isset($_SESSION['reset_email']) || !isset($_SESSION['reset_expires'])) {
            throw new ValidationException("No active password reset request found.");
        }
        if (time() > $_SESSION['reset_expires']) {
            unset($_SESSION['reset_token'], $_SESSION['reset_email'], $_SESSION['reset_expires'], $_SESSION['reset_verified']);
            throw new ValidationException("The verification token has expired. Please restart the password reset process.");
        }
        if ($_SESSION['reset_token'] != $input['token']) {
            throw new ValidationException("Invalid verification token.");
        }
        $_SESSION['reset_verified'] = true;
        return ["success" => true, "message" => "OTP verified. Please choose a new password."];
    }

    // Endpoint updates the password after OTP verification is successful
    public function reset_password($input, $args) {
        if (empty($input['password'])) {
            throw new ValidationException("New password is required.");
        }
        if (strlen($input['password']) < 8) {
            throw new ValidationException("Password must be at least 8 characters long.");
        }
        if (!isset($_SESSION['reset_verified']) || $_SESSION['reset_verified'] !== true || !isset($_SESSION['reset_email'])) {
            throw new ValidationException("OTP verification is required before resetting the password.");
        }
        if (!isset($_SESSION['reset_expires']) || time() > $_SESSION['reset_expires']) {
            unset($_SESSION['reset_token'], $_SESSION['reset_email'], $_SESSION['reset_expires'], $_SESSION['reset_verified']);
            throw new ValidationException("The password reset session has expired. Please restart the process.");
        }
        $email = $_SESSION['reset_email'];
        
        $this->authService->resetPassword($email, $input['password']);
        
        unset($_SESSION['reset_token'], $_SESSION['reset_email'], $_SESSION['reset_expires'], $_SESSION['reset_verified']);
        
        return ["success" => true, "message" => "Password reset successfully. You can now log in."];
    }

    // Endpoint handles contact inquiry submissions and sends notification emails to support
    public function contact($input, $args) {
        if (empty($input['name']) || empty($input['email']) || empty($input['subject']) || empty($input['message'])) {
            throw new ValidationException("All fields (name, email, subject, message) are required.");
        }

        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException("Invalid email address format.");
        }

        $admin_email = 'dteugene2003@gmail.com';
        $subject = "Tripzy Contact Inquiry: " . $input['subject'];
        $body = "<h2>New Contact Inquiry</h2>";
        $body .= "<p><strong>Name:</strong> " . htmlspecialchars($input['name']) . "</p>";
        $body .= "<p><strong>Email:</strong> " . htmlspecialchars($input['email']) . "</p>";
        $body .= "<p><strong>Subject:</strong> " . htmlspecialchars($input['subject']) . "</p>";
        $body .= "<p><strong>Message:</strong><br>" . nl2br(htmlspecialchars($input['message'])) . "</p>";

        require_once __DIR__ . '/../helper/Mailer.php';
        Mailer::send($admin_email, $subject, $body);

        return ["success" => true, "message" => "Thank you! Your message was submitted successfully."];
    }
}
