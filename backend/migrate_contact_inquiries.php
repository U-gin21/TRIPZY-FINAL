<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for inquiry entry',
        name VARCHAR(150) NOT NULL COMMENT 'Name of the sender',
        email VARCHAR(150) NOT NULL COMMENT 'Email address of the sender',
        subject VARCHAR(255) NOT NULL COMMENT 'Subject of the message',
        message TEXT NOT NULL COMMENT 'Full message content',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of inquiry submission'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User contact Us inquiries';";
    
    $db->exec($sql);
    echo "Table 'contact_inquiries' created successfully or already exists.\n";
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
