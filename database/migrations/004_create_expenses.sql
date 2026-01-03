CREATE TABLE trip_expenses (
    expense_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    category ENUM('TRANSPORT', 'STAY', 'FOOD', 'ACTIVITY', 'SHOPPING', 'OTHER'),
    amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    expense_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);
