<?php
require_once __DIR__ . '/config/mail.php';
require_once __DIR__ . '/vendor/phpmailer/Exception.php';
require_once __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Content-Type: text/plain");

echo "Tripzy Mailer Testing Tool\n";
echo "==========================\n";
echo "Host: " . SMTP_HOST . "\n";
echo "Port: " . SMTP_PORT . "\n";
echo "User: " . SMTP_USER . "\n";
echo "Pass: " . (SMTP_PASS === '' ? '[EMPTY (Fallback mode active - writing to logs/mail.log)]' : '********') . "\n\n";

if (SMTP_PASS === '') {
    echo "STATUS: SMTP password is empty. PHPMailer will write local logs in fallback mode.\n";
    echo "Check file: " . MAIL_LOG_FILE . "\n";
    exit;
}

try {
    $mail = new PHPMailer(true);
    
    // Enable verbose debug output
    $mail->SMTPDebug = 2; // Output messages via echo
    
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;

    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress(SMTP_USER, "Test Recipient"); // Send to yourself for testing

    $mail->isHTML(true);
    $mail->Subject = 'Tripzy SMTP Connection Test';
    $mail->Body    = '<b>Congratulations!</b> If you are reading this email, your PHPMailer configuration is 100% correct.';

    echo "Attempting to connect and send test email...\n\n";
    $mail->send();
    echo "\nSUCCESS: Email sent successfully!\n";
} catch (Exception $e) {
    echo "\nFAILURE: Email could not be sent. Mailer Error: {$mail->ErrorInfo}\n";
}
