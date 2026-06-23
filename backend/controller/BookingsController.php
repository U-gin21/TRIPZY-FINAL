<?php
require_once __DIR__ . '/../services/BookingService.php';
require_once __DIR__ . '/../services/ServiceService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../exceptions/ForbiddenException.php';

class BookingsController {
    private $bookingService;
    private $serviceService;

    public function __construct() {
        $this->bookingService = new BookingService();
        $this->serviceService = new ServiceService();
    }

    // Endpoint registers a new tourist booking request for a service
    public function create($input, $args) {
        AuthMiddleware::requireTourist();

        $input['tourist_id'] = $_SESSION['user_id'];
        $res = $this->bookingService->create($input);
        
        return [
            "success" => true,
            "message" => "Booking request submitted successfully! Ref: " . $res['ref_no'],
            "ref_no" => $res['ref_no'],
            "price" => $res['total_price']
        ];
    }

    // Endpoint retrieves all booking reservations made by the logged-in tourist
    public function tourist_list($input, $args) {
        AuthMiddleware::requireLogin();
        $data = $this->bookingService->getByTouristId($_SESSION['user_id']);
        return ["success" => true, "bookings" => $data];
    }

    // Endpoint retrieves booking history and dates for a specific service
    public function service_bookings($input, $args) {
        AuthMiddleware::requireLogin();
        $serviceId = $args['service_id'] ?? 0;
        $data = $this->bookingService->getByServiceId($serviceId);
        return ["success" => true, "bookings" => $data];
    }

    // Endpoint retrieves all bookings received for any services owned by the provider
    public function provider_list($input, $args) {
        AuthMiddleware::requireProvider();
        $data = $this->bookingService->getByProviderId($_SESSION['user_id']);
        return ["success" => true, "bookings" => $data];
    }

    // Endpoint retrieves all platform bookings for the administrator dashboard
    public function all($input, $args) {
        AuthMiddleware::requireAdmin();
        $data = $this->bookingService->getAllBookings();
        return ["success" => true, "bookings" => $data];
    }

    // Endpoint allows service providers or admins to verify, complete, or reject a booking status
    public function update_status($input, $args) {
        AuthMiddleware::requireLogin();
        $id = $input['id'] ?? 0;
        $status = $input['status'] ?? 'pending';
        
        $booking = $this->bookingService->getById($id);
        $service = $this->serviceService->getById($booking['service_id']);
        
        if ($_SESSION['user_type'] !== 'admin' && $service['provider_id'] != $_SESSION['user_id']) {
            throw new ForbiddenException("Unauthorized to change this booking status.");
        }
        
        $this->bookingService->updateStatus($id, $status);
        return ["success" => true, "message" => "Booking status updated and customer notified."];
    }
}
