<?php
require_once __DIR__ . '/../validator/BookingValidator.php';
require_once __DIR__ . '/../repository/BookingRepository.php';
require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../exceptions/NotFoundException.php';
require_once __DIR__ . '/../exceptions/ValidationException.php';
require_once __DIR__ . '/../helper/Mailer.php';

class BookingService {
    private $bookingRepo;
    private $userRepo;

    public function __construct() {
        $this->bookingRepo = new BookingRepository();
        $this->userRepo = new UserRepository();
    }

    // Creates a new booking request, generates a reference number, verifies dates/availability, calculates pricing, and sends confirmation emails to the tourist and provider
    public function create($data) {
        BookingValidator::validate($data);

        // Generate a unique reference number
        $ref_no = 'TZ-' . strtoupper(substr($data['service_type'], 0, 1)) . '-' . date('Ymd') . '-' . rand(1000, 9999);

        // Fetch service price and provider details
        $service = $this->bookingRepo->getServicePriceAndProvider($data['service_id']);
        if (!$service) {
            throw new NotFoundException("Service not found.");
        }

        // Validate date ranges
        $start = new DateTime($data['start_date']);
        $end = new DateTime($data['end_date']);
        if ($start > $end) {
            throw new ValidationException("Start date cannot be after end date.");
        }

        // Check for date overlap for the same service (pending or completed bookings)
        if ($this->bookingRepo->checkDateOverlap($data['service_id'], $data['start_date'], $data['end_date'])) {
            throw new ValidationException("This service is already booked for the selected dates. Please choose a different date range.");
        }

        // Calculate price based on duration (inclusive of both start and end date)
        $days = $start->diff($end)->days + 1;
        $total_price = $service['price'] * $days;

        $bookingId = $this->bookingRepo->create($data, $ref_no, $total_price);

        if ($bookingId) {
            // Fetch tourist details
            $tourist = $this->userRepo->getById($data['tourist_id']);

            if ($tourist) {
                // Send email notification to Tourist with Ref No
                $subject = "Tripzy Booking Confirmation Request - Ref: $ref_no";
                $body = "<h2>Dear " . htmlspecialchars($tourist['full_name']) . ",</h2>";
                $body .= "<p>Your booking request for <strong>" . htmlspecialchars($service['name_of_institute']) . "</strong> has been submitted successfully!</p>";
                $body .= "<h3>Booking Reference Details:</h3>";
                $body .= "<ul>";
                $body .= "<li><strong>Booking Ref No:</strong> " . $ref_no . "</li>";
                $body .= "<li><strong>Service:</strong> " . ucfirst($data['service_type']) . " (" . htmlspecialchars($service['name_of_institute']) . ")</li>";
                $body .= "<li><strong>Duration:</strong> " . $data['start_date'] . " to " . $data['end_date'] . " ($days day/s)</li>";
                $body .= "<li><strong>Rate per Day:</strong> LKR " . number_format($service['price'], 2) . "</li>";
                $body .= "<li><strong>Total Cost:</strong> LKR " . number_format($service['price'], 2) . " x " . $days . " day/s = LKR " . number_format($total_price, 2) . "</li>";
                $body .= "<li><strong>Payment Mode:</strong> Offline (Pay on Arrival / Physical Payment to Provider)</li>";
                $body .= "<li><strong>Status:</strong> PENDING CONFIRMATION</li>";
                $body .= "</ul>";
                $body .= "<p>Please pay the provider physically upon arrival to complete your booking. The service provider will verify your reference number and mark the booking as completed.</p>";
                $body .= "<p>Best Regards,<br>Tripzy Sri Lanka Team</p>";

                Mailer::send($tourist['email'], $subject, $body);

                // Notify service provider
                $provider_subject = "New Booking Received - Ref: $ref_no";
                $provider_body = "<h2>Hello Provider,</h2>";
                $provider_body .= "<p>You have received a new booking request for your service: <strong>" . htmlspecialchars($service['name_of_institute']) . "</strong>.</p>";
                $provider_body .= "<p><strong>Client:</strong> " . htmlspecialchars($tourist['full_name']) . " (" . htmlspecialchars($tourist['email']) . ")</p>";
                $provider_body .= "<p><strong>Dates:</strong> " . $data['start_date'] . " to " . $data['end_date'] . " ($days day/s)</p>";
                $provider_body .= "<p><strong>Rate per Day:</strong> LKR " . number_format($service['price'], 2) . "</p>";
                $provider_body .= "<p><strong>Price:</strong> LKR " . number_format($service['price'], 2) . " x " . $days . " day/s = LKR " . number_format($total_price, 2) . "</p>";
                $provider_body .= "<p>Please review and update the status in your Provider Dashboard.</p>";
                
                Mailer::send($service['email'], $provider_subject, $provider_body);
            }

            return [
                "booking_id" => $bookingId,
                "ref_no" => $ref_no,
                "total_price" => $total_price
            ];
        }
        throw new Exception("Failed to submit booking request.");
    }

    // Retrieves booking history records associated with a specific service ID
    public function getByServiceId($serviceId) {
        return $this->bookingRepo->getByServiceId($serviceId);
    }

    // Retrieves a specific booking record by its database ID and throws an exception if not found
    public function getById($id) {
        $booking = $this->bookingRepo->getById($id);
        if (!$booking) {
            throw new NotFoundException("Booking not found.");
        }
        return $booking;
    }

    // Retrieves all booking records reserved by a specific tourist
    public function getByTouristId($touristId) {
        return $this->bookingRepo->getByTouristId($touristId);
    }

    // Retrieves all booking records associated with services owned by a specific provider
    public function getByProviderId($providerId) {
        return $this->bookingRepo->getByProviderId($providerId);
    }

    // Updates a booking's reservation status and sends an updated invoice or rejection notification to the tourist
    public function updateStatus($id, $status) {
        $booking = $this->getById($id);
        if ($booking && $booking['status'] === $status) {
            return true;
        }

        $result = $this->bookingRepo->updateStatus($id, $status);

        if ($result && $booking) {
            // Fetch service details for rate
            $service = $this->bookingRepo->getServicePriceAndProvider($booking['service_id']);
            
            // Calculate days (inclusive of both start and end date)
            $start = new DateTime($booking['start_date']);
            $end = new DateTime($booking['end_date']);
            $days = $start->diff($end)->days + 1;
            
            $rate = $service ? $service['price'] : ($booking['price'] / $days);

            // Email status update to Tourist
            $subject = "Tripzy Booking Status Updated - Ref: " . $booking['ref_no'];
            $body = "<h2>Dear " . htmlspecialchars($booking['tourist_name']) . ",</h2>";
            $body .= "<p>Your booking for <strong>" . htmlspecialchars($booking['name_of_institute']) . "</strong> (Ref: " . $booking['ref_no'] . ") has been marked as: <strong>" . strtoupper($status) . "</strong>.</p>";
            
            $body .= "<h3>Booking Details:</h3>";
            $body .= "<ul>";
            $body .= "<li><strong>Booking Ref No:</strong> " . $booking['ref_no'] . "</li>";
            $body .= "<li><strong>Service:</strong> " . ucfirst($booking['service_type']) . " (" . htmlspecialchars($booking['name_of_institute']) . ")</li>";
            $body .= "<li><strong>Duration:</strong> " . $booking['start_date'] . " to " . $booking['end_date'] . " ($days day/s)</li>";
            $body .= "<li><strong>Rate per Day:</strong> LKR " . number_format($rate, 2) . "</li>";
            $body .= "<li><strong>Total Cost:</strong> LKR " . number_format($rate, 2) . " x " . $days . " day/s = LKR " . number_format($booking['price'], 2) . "</li>";
            $body .= "</ul>";

            if ($status === 'completed') {
                $body .= "<p>Thank you for completing your payment. Your booking is officially verified.</p>";
            } else if ($status === 'rejected') {
                $body .= "<p>We are sorry, but your booking request was declined. Please contact the provider at " . htmlspecialchars($booking['service_contact']) . " for details.</p>";
            }
            $body .= "<p>Warm Regards,<br>Tripzy Sri Lanka Team</p>";
            Mailer::send($booking['tourist_email'], $subject, $body);
        }
        return $result;
    }

    // Retrieves all booking records registered across the system
    public function getAllBookings() {
        return $this->bookingRepo->getAllBookings();
    }
}
