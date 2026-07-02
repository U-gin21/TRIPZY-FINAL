<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Starting database migration...\n";

    // 1. Add perfect_time column to destinations table if it doesn't exist
    // Check if column already exists
    $columns = $db->query("SHOW COLUMNS FROM destinations LIKE 'perfect_time'")->fetchAll();
    if (empty($columns)) {
        $db->exec("ALTER TABLE destinations ADD COLUMN perfect_time VARCHAR(255) DEFAULT NULL COMMENT 'Best months/season to visit'");
        echo "Successfully added 'perfect_time' column to 'destinations' table.\n";
    } else {
        echo "Column 'perfect_time' already exists in 'destinations' table.\n";
    }

    // 2. Drop the destination_activities table
    $db->exec("DROP TABLE IF EXISTS destination_activities");
    echo "Successfully dropped 'destination_activities' table.\n";

    // 3. Update existing Sigiriya destination with a default value
    $stmt = $db->prepare("UPDATE destinations SET perfect_time = ? WHERE name = ?");
    $stmt->execute(['December to April', 'Sigiriya']);
    echo "Updated 'Sigiriya' destination with 'December to April' perfect time.\n";

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
