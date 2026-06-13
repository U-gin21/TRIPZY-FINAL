CREATE DATABASE IF NOT EXISTS tripzy_db;
USE tripzy_db;

-- Temporarily disable foreign key checks to allow dropping and recreating tables
SET FOREIGN_KEY_CHECKS = 0;

-- Drop views and tables in order of dependencies
DROP VIEW IF EXISTS users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS companion_requests;
DROP TABLE IF EXISTS companion_post_interests;
DROP TABLE IF EXISTS companion_posts;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tourist_profiles;
DROP TABLE IF EXISTS provider_profiles;
DROP TABLE IF EXISTS admin_profiles;
DROP TABLE IF EXISTS users_base;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS faqs;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Base Table (Credentials & Core State)
CREATE TABLE users_base (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each user credentials',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'User login email address',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Secure bcrypt hash of the password',
    user_type ENUM('tourist', 'provider', 'admin') NOT NULL COMMENT 'Role classification of the user',
    status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'active' COMMENT 'Account moderation state',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of account creation'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User credentials and account states';

-- 2. Tourist Profiles Table (CTI)
CREATE TABLE tourist_profiles (
    user_id INT PRIMARY KEY COMMENT 'Reference to users_base.id',
    full_name VARCHAR(150) NOT NULL COMMENT 'Full legal name of the tourist',
    name_with_initial VARCHAR(100) NOT NULL COMMENT 'Common name formatting (e.g. E. De Silva)',
    nic_passport VARCHAR(50) NOT NULL COMMENT 'National Identity Card or Passport identifier',
    contact_no VARCHAR(20) NOT NULL COMMENT 'Telephone contact number',
    gender ENUM('male', 'female') NOT NULL COMMENT 'Gender classification',
    date_of_birth DATE NOT NULL COMMENT 'Date of birth for age validation',
    profile_photo VARCHAR(255) DEFAULT 'default_profile.jpg' COMMENT 'Filename of profile photo stored in uploads',
    CONSTRAINT fk_tourist_profile_user FOREIGN KEY (user_id) REFERENCES users_base(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tourist-specific profile information';

-- 3. Provider Profiles Table (CTI)
CREATE TABLE provider_profiles (
    user_id INT PRIMARY KEY COMMENT 'Reference to users_base.id',
    full_name VARCHAR(150) NOT NULL COMMENT 'Full legal name of the provider',
    name_with_initial VARCHAR(100) NOT NULL COMMENT 'Common name formatting (e.g. E. De Silva)',
    nic_passport VARCHAR(50) NOT NULL COMMENT 'National Identity Card or Passport identifier',
    contact_no VARCHAR(20) NOT NULL COMMENT 'Telephone contact number',
    gender ENUM('male', 'female') NOT NULL COMMENT 'Gender classification',
    date_of_birth DATE NOT NULL COMMENT 'Date of birth for age validation',
    profile_photo VARCHAR(255) DEFAULT 'default_profile.jpg' COMMENT 'Filename of profile photo stored in uploads',
    CONSTRAINT fk_provider_profile_user FOREIGN KEY (user_id) REFERENCES users_base(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Provider-specific profile information';

-- 4. Admin Profiles Table (CTI)
CREATE TABLE admin_profiles (
    user_id INT PRIMARY KEY COMMENT 'Reference to users_base.id',
    full_name VARCHAR(150) NOT NULL COMMENT 'Full legal name of the admin',
    name_with_initial VARCHAR(100) NOT NULL COMMENT 'Common name formatting (e.g. E. De Silva)',
    nic_passport VARCHAR(50) NOT NULL COMMENT 'National Identity Card or Passport identifier',
    contact_no VARCHAR(20) NOT NULL COMMENT 'Telephone contact number',
    gender ENUM('male', 'female') NOT NULL COMMENT 'Gender classification',
    date_of_birth DATE NOT NULL COMMENT 'Date of birth for age validation',
    profile_photo VARCHAR(255) DEFAULT 'default_profile.jpg' COMMENT 'Filename of profile photo stored in uploads',
    CONSTRAINT fk_admin_profile_user FOREIGN KEY (user_id) REFERENCES users_base(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin-specific profile information';

-- 5. Unified Users View (Recreates original users schema interface for SELECT queries)
CREATE VIEW users AS
SELECT 
    u.id, u.email, u.password_hash, u.user_type, u.status, u.created_at,
    COALESCE(t.full_name, p.full_name, a.full_name) as full_name,
    COALESCE(t.name_with_initial, p.name_with_initial, a.name_with_initial) as name_with_initial,
    COALESCE(t.nic_passport, p.nic_passport, a.nic_passport) as nic_passport,
    COALESCE(t.contact_no, p.contact_no, a.contact_no) as contact_no,
    COALESCE(t.gender, p.gender, a.gender) as gender,
    COALESCE(t.date_of_birth, p.date_of_birth, a.date_of_birth) as date_of_birth,
    COALESCE(t.profile_photo, p.profile_photo, a.profile_photo) as profile_photo
FROM users_base u
LEFT JOIN tourist_profiles t ON u.id = t.user_id
LEFT JOIN provider_profiles p ON u.id = p.user_id
LEFT JOIN admin_profiles a ON u.id = a.user_id;

-- 6. Services Table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each service',
    provider_id INT NOT NULL COMMENT 'Reference to provider_profiles.user_id who is the service provider',
    service_type ENUM('hotel', 'vehicle', 'guide', 'camping_tool') NOT NULL COMMENT 'Category of service offered',
    name_of_institute VARCHAR(150) NOT NULL COMMENT 'Business name (e.g., hotel name or guide service name)',
    photo VARCHAR(255) NOT NULL COMMENT 'Cover image path for service list',
    contact_no VARCHAR(20) NOT NULL COMMENT 'Direct phone number for service inquires',
    email VARCHAR(150) NOT NULL COMMENT 'Direct email address for service inquires',
    price DECIMAL(10,2) NOT NULL COMMENT 'Base rental/booking rate',
    description TEXT NOT NULL COMMENT 'Detailed description of services offered',
    status ENUM('enabled', 'disabled') DEFAULT 'enabled' COMMENT 'Service visibility state',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of service registry',
    CONSTRAINT fk_services_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Offers and listings created by service providers';

-- Add index on services foreign key
CREATE INDEX idx_services_provider ON services(provider_id);

-- 7. Bookings Table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each booking transaction',
    tourist_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id who is booking the service',
    service_id INT NOT NULL COMMENT 'Reference to services.id being booked',
    ref_no VARCHAR(50) NOT NULL UNIQUE COMMENT 'Random unique transaction code (e.g. TPZ1042)',
    start_date DATE NOT NULL COMMENT 'Start date of stay/guide/hire duration',
    end_date DATE NOT NULL COMMENT 'End date of stay/guide/hire duration',
    price DECIMAL(10,2) NOT NULL COMMENT 'Agreed payment amount at time of booking',
    status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending' COMMENT 'Booking transaction lifecycle state',
    booking_details TEXT DEFAULT NULL COMMENT 'Additional requests or specifications',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of transaction creation',
    CONSTRAINT fk_bookings_tourist FOREIGN KEY (tourist_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Offline transaction receipts linking tourists and services';

-- Add indexes on bookings foreign keys
CREATE INDEX idx_bookings_tourist ON bookings(tourist_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);

-- 8. Companion Posts
CREATE TABLE companion_posts (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each companion search plan',
    owner_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id who posted the plan',
    destination_place VARCHAR(150) NOT NULL COMMENT 'Target destination matching explore database names',
    start_date DATE NOT NULL COMMENT 'Proposed departure date',
    end_date DATE NOT NULL COMMENT 'Proposed return date',
    budget_range VARCHAR(100) NOT NULL COMMENT 'Estimated total expenses range in LKR',
    companions_needed INT NOT NULL COMMENT 'Count of travelers needed',
    gender_preference VARCHAR(20) DEFAULT 'Any' COMMENT 'Target companion gender requirement',
    description TEXT NOT NULL COMMENT 'Description of trip details and itinerary',
    status ENUM('open', 'closed') DEFAULT 'open' COMMENT 'Availability state for join requests',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of search post creation',
    CONSTRAINT fk_companion_posts_owner FOREIGN KEY (owner_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Travel groups and companion search profiles';

-- Add index on companion_posts foreign key
CREATE INDEX idx_companion_posts_owner ON companion_posts(owner_id);

-- 9. Companion Post Interests Relational Table (1NF)
CREATE TABLE companion_post_interests (
    post_id INT NOT NULL COMMENT 'Reference to companion_posts.id',
    interest VARCHAR(100) NOT NULL COMMENT 'Travel interest name',
    PRIMARY KEY (post_id, interest),
    CONSTRAINT fk_post_interests FOREIGN KEY (post_id) REFERENCES companion_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relational table linking companion posts to travel interests (1NF)';

-- 10. Companion Requests
CREATE TABLE companion_requests (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for join request',
    post_id INT NOT NULL COMMENT 'Reference to companion_posts.id being requested',
    requester_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id requesting to join',
    message TEXT COMMENT 'Introduction statement or pitch to join',
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' COMMENT 'Request response status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of request submission',
    CONSTRAINT fk_companion_requests_post FOREIGN KEY (post_id) REFERENCES companion_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_companion_requests_requester FOREIGN KEY (requester_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Requests from other tourists to join active companion posts';

-- Add indexes on companion_requests foreign keys
CREATE INDEX idx_companion_requests_post ON companion_requests(post_id);
CREATE INDEX idx_companion_requests_requester ON companion_requests(requester_id);

-- 11. Districts Table (3NF Lookup)
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each district',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique district name'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Geographic districts lookup';

-- 12. Destinations Table
CREATE TABLE destinations (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for destination profile',
    name VARCHAR(150) NOT NULL COMMENT 'Location name (e.g. Mirissa Beach)',
    district_id INT NOT NULL COMMENT 'Reference to districts.id (3NF)',
    admin_id INT NOT NULL COMMENT 'Reference to admin_profiles.user_id who registered this destination',
    description TEXT NOT NULL COMMENT 'In-depth description of sights and weather behavior',
    image VARCHAR(255) NOT NULL COMMENT 'File name of destination image stored in assets',
    budget_category ENUM('budget', 'mid-range', 'luxury') NOT NULL COMMENT 'Expense classification',
    interest_category ENUM('Beaches', 'Mountains', 'Camping', 'Wildlife', 'Historical places', 'Adventure', 'Nature', 'Cultural destinations') NOT NULL COMMENT 'Primary interest category matching',
    latitude DECIMAL(10,8) NOT NULL COMMENT 'Decimal coordinates for weather mapping',
    longitude DECIMAL(11,8) NOT NULL COMMENT 'Decimal coordinates for weather mapping',
    perfect_time VARCHAR(255) DEFAULT NULL COMMENT 'Best months/season to visit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of profile registry',
    CONSTRAINT fk_destinations_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_destinations_admin FOREIGN KEY (admin_id) REFERENCES admin_profiles(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Static database profiles for weather mapping and search filters';

-- Add index on destinations district and admin
CREATE INDEX idx_destinations_district ON destinations(district_id);
CREATE INDEX idx_destinations_admin ON destinations(admin_id);

-- 14. Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for review entry',
    tourist_id INT NOT NULL COMMENT 'Reference to tourist_profiles.user_id writing review',
    service_id INT DEFAULT NULL COMMENT 'Reference to services.id being reviewed (NULL for global feedback)',
    rating INT NOT NULL COMMENT 'Star rating indicator (1-5 range)',
    comment TEXT COMMENT 'Details review thoughts',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of review submission',
    CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT fk_reviews_tourist FOREIGN KEY (tourist_id) REFERENCES tourist_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer feedback entries for listings and system audit logs';

-- Add indexes on reviews foreign keys
CREATE INDEX idx_reviews_tourist ON reviews(tourist_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);

-- 15. FAQs Table
CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for FAQ entry',
    user_id INT DEFAULT NULL COMMENT 'Reference to users_base.id who asked (NULL if admin posted)',
    question TEXT NOT NULL COMMENT 'FAQ query text',
    answer TEXT NOT NULL COMMENT 'Official admin reply text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of question entry',
    CONSTRAINT fk_faqs_user FOREIGN KEY (user_id) REFERENCES users_base(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Official FAQ bank and system community Q&A feed';

-- Add index on faqs foreign key
CREATE INDEX idx_faqs_user ON faqs(user_id);

-- 16. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for notification entry',
    user_id INT NOT NULL COMMENT 'Reference to users_base.id recipient',
    message TEXT NOT NULL COMMENT 'Visual display alert message',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Boolean flag matching read state',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of entry creation',
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users_base(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System logs pushing messages to users dashboards';

-- Add index on notifications foreign key
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Geographic Districts lookup values
INSERT INTO districts (name) VALUES 
('Colombo'), ('Gampaha'), ('Kalutara'), ('Kandy'), ('Matale'), ('Nuwara Eliya'), 
('Galle'), ('Matara'), ('Hambantota'), ('Jaffna'), ('Kilinochchi'), ('Mannar'), 
('Vavuniya'), ('Mullaitivu'), ('Batticaloa'), ('Ampara'), ('Trincomalee'), 
('Kurunegala'), ('Puttalam'), ('Anuradhapura'), ('Polonnaruwa'), ('Badulla'), 
('Moneragala'), ('Ratnapura'), ('Kegalle');

-- Primary Admin Account (Password: ABcd1234)
INSERT INTO users_base (id, email, password_hash, user_type, status)
VALUES (1, 'dteugee2003@gmail.com', '$2y$10$djocG7BNp8X9zo2iEOqPs.Zr.1VenvrAFM.L..3K/Kc4Cr3hUcWRy', 'admin', 'active');

INSERT INTO admin_profiles (user_id, full_name, name_with_initial, nic_passport, contact_no, gender, date_of_birth, profile_photo)
VALUES (1, 'Eugene De Silva', 'E. De Silva', '200305012345', '0771234567', 'male', '2003-05-01', 'default_profile.jpg');

-- Initial Destinations
INSERT INTO destinations (id, name, district_id, admin_id, description, image, budget_category, interest_category, latitude, longitude, perfect_time) VALUES
(1, 'Mirissa Beach', 8, 1, 'A beautiful, golden sandy beach ideal for whale watching, surfing, and relaxing under coconut trees.', 'mirissa.jpg', 'budget', 'Beaches', 5.9482, 80.4574, 'November to April'),
(2, 'Ella Rock & Nine Arch Bridge', 22, 1, 'A scenic mountain town famous for hiking trails, lush green tea plantations, and the architectural masterpiece of the Nine Arch Bridge.', 'ella.jpg', 'mid-range', 'Mountains', 6.8724, 81.0456, 'January to April'),
(3, 'Yala National Park', 9, 1, 'One of Sri Lanka\'s premier wildlife sanctuaries, housing the highest density of leopards in the world.', 'yala.jpg', 'luxury', 'Wildlife', 6.3688, 81.5273, 'February to June'),
(4, 'Sigiriya Rock Fortress', 5, 1, 'An ancient palace complex built on top of a 200m high rock plateau, featuring historic frescoes and mirror walls.', 'sigiriya.jpg', 'luxury', 'Historical places', 7.9570, 80.7603, 'December to April'),
(5, 'Knuckles Mountain Range', 4, 1, 'A rugged, mist-shrouded wilderness perfect for wilderness camping and trekking adventures.', 'knuckles.jpg', 'budget', 'Camping', 7.4475, 80.7914, 'January to March'),
(6, 'Kitulgala River Rafting', 25, 1, 'The adventure capital of Sri Lanka, popular for white water rafting, canyoning, and jungle camping.', 'kitulgala.jpg', 'mid-range', 'Adventure', 6.9934, 80.4182, 'June to September'),
(7, 'Galle Dutch Fort', 7, 1, 'A UNESCO World Heritage site, displaying an archaeological marvel of Portuguese, Dutch, and British colonial styles.', 'galle.jpg', 'mid-range', 'Cultural destinations', 6.0329, 80.2170, 'December to April'),
(8, 'Hortons Plains & World\'s End', 6, 1, 'A protected national park in the central highlands featuring montane grasslands and cloud forests.', 'horton.jpg', 'mid-range', 'Nature', 6.8028, 80.8028, 'January to March');

-- Initial FAQs
INSERT INTO faqs (question, answer) VALUES
('What is Tripzy?', 'Tripzy is a smart tourism management and booking platform for Sri Lanka that lets tourists search destinations, book hotels/vehicles/guides/camping gear, and find travel companions.'),
('How do I pay for bookings?', 'Tripzy uses an offline payment model. You can complete your bookings online for free and pay the service provider directly in cash or card upon arrival.'),
('Can I register as a service provider?', 'Yes! You can register as a service provider (Hotel, Vehicle, Guide, or Camping gear provider) from the registration page. The admin team will verify and approve your account shortly.'),
('What is the Travel Companion Finder?', 'It is a feature that allows travelers to post their trip plans and find other users to join them, making travel more social and budget-friendly.');
