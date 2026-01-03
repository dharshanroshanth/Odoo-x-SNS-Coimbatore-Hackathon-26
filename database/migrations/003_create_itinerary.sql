CREATE TABLE itinerary_days (
    day_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    date DATE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

CREATE TABLE itinerary_activities (
    activity_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    day_id BIGINT NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    estimated_cost DECIMAL(10,2),
    FOREIGN KEY (day_id) REFERENCES itinerary_days(day_id) ON DELETE CASCADE
);
