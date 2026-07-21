<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS companion_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for rating entry',
        post_id INT NOT NULL COMMENT 'Reference to companion_posts.id',
        rater_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id who rates',
        ratee_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id who is rated',
        rating INT NOT NULL COMMENT 'Rating indicator (1 to 10 range)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of rating entry',
        CONSTRAINT chk_companion_ratings_range CHECK (rating >= 1 AND rating <= 10),
        CONSTRAINT fk_companion_ratings_post FOREIGN KEY (post_id) REFERENCES companion_posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_companion_ratings_rater FOREIGN KEY (rater_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_companion_ratings_ratee FOREIGN KEY (ratee_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE,
        UNIQUE KEY uq_companion_ratings_post_rater_ratee (post_id, rater_id, ratee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Travel companion ratings between participants of confirmed trips';";
    
    $db->exec($sql);
    echo "Table 'companion_ratings' created successfully or already exists.\n";
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
}
