<?php
// Register class autoloader for layered architecture layers
spl_autoload_register(function ($className) {
    $directories = [
        __DIR__ . '/controller/',
        __DIR__ . '/repository/',
        __DIR__ . '/services/',
        __DIR__ . '/helper/',
        __DIR__ . '/exceptions/',
        __DIR__ . '/validator/',
        __DIR__ . '/middleware/'
    ];
    foreach ($directories as $dir) {
        $file = $dir . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Load core configurations
require_once __DIR__ . '/config/db.php';

// Dispatch Middleware Layer
SessionMiddleware::handle();
CORSMiddleware::handle();

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Router dispatcher
try {
    $controller = $_GET['controller'] ?? '';
    $action = $_GET['action'] ?? '';

    // Validate controller and action inputs to avoid unauthorized characters
    if (!preg_match('/^[a-zA-Z0-9_]*$/', $controller) || !preg_match('/^[a-zA-Z0-9_]*$/', $action)) {
        throw new ValidationException("Invalid request: illegal characters in controller or action.");
    }
    
    // Parse input payloads
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true) ?? [];
    // Merge standard $_POST values for form-data requests (e.g. file uploads)
    $input = array_merge($input, $_POST);

    $response = [];

    // Map controller name to Class Name
    $controllerMap = [
        'auth' => 'AuthController',
        'profile' => 'ProfileController',
        'destinations' => 'DestinationsController',
        'services' => 'ServicesController',
        'bookings' => 'BookingsController',
        'companions' => 'CompanionsController',
        'admin' => 'AdminController',
        'faqs' => 'FaqsController',
        'notifications' => 'NotificationsController'
    ];

    if (isset($controllerMap[$controller])) {
        $className = $controllerMap[$controller];
        if (class_exists($className)) {
            $controllerInstance = new $className();
            if (method_exists($controllerInstance, $action)) {
                $response = $controllerInstance->$action($input, $_GET);
            } else {
                throw new NotFoundException("Action '$action' not found in '$className'.");
            }
        } else {
            throw new NotFoundException("Controller class '$className' not found.");
        }
    } else {
        throw new NotFoundException("Controller '$controller' not recognized.");
    }

    echo json_encode($response);

} catch (AppException $e) {
    http_response_code($e->getStatusCode());
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
