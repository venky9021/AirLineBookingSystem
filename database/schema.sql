-- Create Database
CREATE DATABASE IF NOT EXISTS aeroflow_db;
USE aeroflow_db;

-- Drop Tables if exist to start clean
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS airlines;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Airlines Table
CREATE TABLE airlines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    logo_url VARCHAR(255)
);

-- 3. Flights Table
CREATE TABLE flights (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL UNIQUE,
    airline_id BIGINT NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE
);

-- 4. Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) NOT NULL UNIQUE,
    user_id BIGINT,
    flight_id BIGINT NOT NULL,
    travel_class VARCHAR(20) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- 5. Passengers Table
CREATE TABLE passengers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50),
    dob DATE,
    nationality VARCHAR(100),
    seat_number VARCHAR(10) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 6. Payments Table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    gateway_txn_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 7. Seats Table
CREATE TABLE seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    class VARCHAR(20) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    booked_by_booking_id BIGINT DEFAULT NULL,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    UNIQUE KEY unique_flight_seat (flight_id, seat_number)
);

-- Seed Airlines
INSERT INTO airlines (name, code, logo_url) VALUES 
('IndiGo', '6E', 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=100&auto=format&fit=crop&q=60'),
('Air India', 'AI', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop&q=60'),
('Akasa Air', 'QP', 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=100&auto=format&fit=crop&q=60'),
('AIX Connect', 'I5', 'https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=100&auto=format&fit=crop&q=60'),
('SpiceJet', 'SG', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&auto=format&fit=crop&q=60');

-- Seed Users (Passwords are BCrypt hashed for 'password123')
INSERT INTO users (name, email, password_hash, phone, role) VALUES
('Jane Doe', 'jane@example.com', '$2a$10$wM03kZlydJm902SgJj5r5OFmQ1z/fC0.O25Q5dSpT49v.Hux18vUa', '+918888888888', 'USER');

-- Seed Domestic Indian Flights (with future dates)
-- 5 Airlines on 4 routes (Total 20 flights) to ensure any search shows all 5 airlines!
INSERT INTO flights (flight_number, airline_id, origin, destination, departure_time, arrival_time, total_seats, available_seats, base_price, status) VALUES
-- Route 1: Delhi (DEL) -> Mumbai (BOM) on 2026-06-01
('6E-101', 1, 'Delhi (DEL)', 'Mumbai (BOM)', '2026-06-01 07:00:00', '2026-06-01 09:15:00', 60, 60, 5200.00, 'ACTIVE'),
('AI-102', 2, 'Delhi (DEL)', 'Mumbai (BOM)', '2026-06-01 08:30:00', '2026-06-01 10:45:00', 60, 60, 5500.00, 'ACTIVE'),
('QP-103', 3, 'Delhi (DEL)', 'Mumbai (BOM)', '2026-06-01 10:00:00', '2026-06-01 12:15:00', 60, 60, 4900.00, 'ACTIVE'),
('I5-104', 4, 'Delhi (DEL)', 'Mumbai (BOM)', '2026-06-01 13:30:00', '2026-06-01 15:45:00', 60, 60, 4600.00, 'ACTIVE'),
('SG-105', 5, 'Delhi (DEL)', 'Mumbai (BOM)', '2026-06-01 16:00:00', '2026-06-01 18:15:00', 60, 60, 4800.00, 'ACTIVE'),

-- Route 2: Mumbai (BOM) -> Goa (GOI) on 2026-06-02
('6E-201', 1, 'Mumbai (BOM)', 'Goa (GOI)', '2026-06-02 08:00:00', '2026-06-02 09:15:00', 60, 60, 3800.00, 'ACTIVE'),
('AI-202', 2, 'Mumbai (BOM)', 'Goa (GOI)', '2026-06-02 09:30:00', '2026-06-02 10:45:00', 60, 60, 4200.00, 'ACTIVE'),
('QP-203', 3, 'Mumbai (BOM)', 'Goa (GOI)', '2026-06-02 11:30:00', '2026-06-02 12:45:00', 60, 60, 3700.00, 'ACTIVE'),
('I5-204', 4, 'Mumbai (BOM)', 'Goa (GOI)', '2026-06-02 14:00:00', '2026-06-02 15:15:00', 60, 60, 3500.00, 'ACTIVE'),
('SG-205', 5, 'Mumbai (BOM)', 'Goa (GOI)', '2026-06-02 16:30:00', '2026-06-02 17:45:00', 60, 60, 3900.00, 'ACTIVE'),

-- Route 3: Bengaluru (BLR) -> Kochi (COK) on 2026-06-03
('6E-301', 1, 'Bengaluru (BLR)', 'Kochi (COK)', '2026-06-03 07:30:00', '2026-06-03 08:45:00', 60, 60, 3400.00, 'ACTIVE'),
('AI-302', 2, 'Bengaluru (BLR)', 'Kochi (COK)', '2026-06-03 10:00:00', '2026-06-03 11:15:00', 60, 60, 3950.00, 'ACTIVE'),
('QP-303', 3, 'Bengaluru (BLR)', 'Kochi (COK)', '2026-06-03 12:30:00', '2026-06-03 13:45:00', 60, 60, 3300.00, 'ACTIVE'),
('I5-304', 4, 'Bengaluru (BLR)', 'Kochi (COK)', '2026-06-03 15:00:00', '2026-06-03 16:15:00', 60, 60, 3200.00, 'ACTIVE'),
('SG-305', 5, 'Bengaluru (BLR)', 'Kochi (COK)', '2026-06-03 18:00:00', '2026-06-03 19:15:00', 60, 60, 3500.00, 'ACTIVE'),

-- Route 4: Delhi (DEL) -> Jaipur (JAI) on 2026-06-05
('6E-401', 1, 'Delhi (DEL)', 'Jaipur (JAI)', '2026-06-05 08:00:00', '2026-06-05 08:55:00', 60, 60, 2600.00, 'ACTIVE'),
('AI-402', 2, 'Delhi (DEL)', 'Jaipur (JAI)', '2026-06-05 10:30:00', '2026-06-05 11:25:00', 60, 60, 2900.00, 'ACTIVE'),
('QP-403', 3, 'Delhi (DEL)', 'Jaipur (JAI)', '2026-06-05 13:00:00', '2026-06-05 13:55:00', 60, 60, 2500.00, 'ACTIVE'),
('I5-404', 4, 'Delhi (DEL)', 'Jaipur (JAI)', '2026-06-05 15:30:00', '2026-06-05 16:25:00', 60, 60, 2400.00, 'ACTIVE'),
('SG-405', 5, 'Delhi (DEL)', 'Jaipur (JAI)', '2026-06-05 18:30:00', '2026-06-05 19:25:00', 60, 60, 2700.00, 'ACTIVE');
