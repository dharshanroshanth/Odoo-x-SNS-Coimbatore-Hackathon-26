-- ===============================
-- Initial Seed Data for GlobeTrotter
-- ===============================

INSERT INTO users (first_name, last_name, email, password_hash, city, country)
VALUES
('Aarav', 'Sharma', 'aarav.sharma@example.com', '$2b$10$hashedpassword1', 'Delhi', 'India'),
('Meera', 'Iyer', 'meera.iyer@example.com', '$2b$10$hashedpassword2', 'Chennai', 'India');

INSERT INTO trips (user_id, trip_name, start_date, end_date, location, description, status)
VALUES
(1, 'Himalayan Adventure', '2025-02-10', '2025-02-20', 'Manali', 'Mountain trekking and sightseeing', 'PLANNED'),
(2, 'Kerala Backwaters', '2025-03-05', '2025-03-10', 'Alleppey', 'Relaxing houseboat experience', 'PLANNED');

INSERT INTO itinerary_days (trip_id, day_number, date)
VALUES
(1, 1, '2025-02-10'),
(1, 2, '2025-02-11'),
(2, 1, '2025-03-05');

INSERT INTO itinerary_activities (day_id, activity_name, start_time, end_time, location, estimated_cost)
VALUES
(1, 'Arrival & Local Exploration', '09:00', '13:00', 'Manali Town', 1500.00),
(1, 'Hadimba Temple Visit', '15:00', '17:00', 'Hadimba Temple', 300.00),
(3, 'Houseboat Check-in', '12:00', '14:00', 'Alleppey', 5000.00);

INSERT INTO trip_expenses (trip_id, category, amount, expense_date, notes)
VALUES
(1, 'TRANSPORT', 2500.00, '2025-02-10', 'Bus from Delhi'),
(1, 'FOOD', 1200.00, '2025-02-11', 'Local restaurant'),
(2, 'STAY', 8000.00, '2025-03-05', 'Houseboat stay');
