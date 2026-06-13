<?php

class UploadHelper {
    // Handles checking, validation, and storage of uploaded image files
    public static function uploadImageFile($field, $dir) {
        if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        $tmpPath = $_FILES[$field]['tmp_name'];
        $name = $_FILES[$field]['name'];
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowed)) {
            throw new Exception("File type '$ext' is not allowed. Choose JPG, PNG, WEBP, or GIF.");
        }
        
        if (!file_exists($dir)) {
            @mkdir($dir, 0777, true);
        }
        
        $newName = uniqid('img_', true) . '.' . $ext;
        if (move_uploaded_file($tmpPath, $dir . $newName)) {
            return $newName;
        }
        throw new Exception("Failed to save uploaded image.");
    }
}
