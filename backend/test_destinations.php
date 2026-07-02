<?php
require_once __DIR__ . '/config/db.php';
try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT id, name, image FROM destinations");
    while ($row = $stmt->fetch()) {
        echo "ID: " . $row['id'] . " | Name: " . $row['name'] . " | Image: " . $row['image'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
