-- =====================================================
-- GlobeTrotter Application Database Schema
-- =====================================================

-- =========================
-- USERS & AUTHENTICATION
-- =========================
CREATE TABLE users (
    user_id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    phone_number       VARCHAR(20),
    city               VARCHAR(100),
    country            VARCHAR(100),
    profile_image_url  TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TRIPS
-- =========================
CREATE TABLE trips (
    trip_id        BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    trip_name      VARCHAR(150) NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    location       VARCHAR(150),
    description    TEXT,
    status         ENUM('PLANNED', 'ONGOING', 'COMPLETED') DEFAULT 'PLANNED',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================
-- TRIP MEDIA
-- =========================
CREATE TABLE trip_media (
    media_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id       BIGINT NOT NULL,
    media_url     TEXT NOT NULL,
    media_type    ENUM('IMAGE', 'VIDEO'),
    uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- =========================
-- ITINERARY DAYS
-- =========================
CREATE TABLE itinerary_days (
    day_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id      BIGINT NOT NULL,
    day_number   INT NOT NULL,
    date         DATE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- =========================
-- ITINERARY ACTIVITIES
-- =========================
CREATE TABLE itinerary_activities (
    activity_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    day_id            BIGINT NOT NULL,
    activity_name     VARCHAR(200) NOT NULL,
    description       TEXT,
    start_time        TIME,
    end_time          TIME,
    location          VARCHAR(200),
    estimated_cost    DECIMAL(10,2),
    FOREIGN KEY (day_id) REFERENCES itinerary_days(day_id) ON DELETE CASCADE
);

-- =========================
-- BUDGET TRACKING
-- =========================
CREATE TABLE trip_expenses (
    expense_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id        BIGINT NOT NULL,
    category       ENUM('TRANSPORT', 'STAY', 'FOOD', 'ACTIVITY', 'SHOPPING', 'OTHER'),
    amount         DECIMAL(10,2) NOT NULL,
    notes          TEXT,
    expense_date   DATE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- =========================
-- COMMUNITY POSTS
-- =========================
CREATE TABLE community_posts (
    post_id        BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    content        TEXT NOT NULL,
    media_url      TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================
-- POST COMMENTS
-- =========================
CREATE TABLE post_comments (
    comment_id     BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id        BIGINT NOT NULL,
    user_id        BIGINT NOT NULL,
    comment_text   TEXT NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================
-- ACTIVITY SEARCH LOG
-- =========================
CREATE TABLE search_history (
    search_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    search_query   VARCHAR(255),
    search_type    ENUM('CITY', 'ACTIVITY'),
    searched_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =========================
-- CALENDAR EVENTS
-- =========================
CREATE TABLE calendar_events (
    event_id       BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id        BIGINT NOT NULL,
    trip_id        BIGINT,
    title          VARCHAR(200),
    event_date     DATE,
    start_time     TIME,
    end_time       TIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- =========================
-- ANALYTICS SNAPSHOT
-- =========================
CREATE TABLE analytics_summary (
    analytics_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id           BIGINT NOT NULL,
    total_trips       INT DEFAULT 0,
    total_spent       DECIMAL(12,2) DEFAULT 0,
    most_visited_city VARCHAR(150),
    last_updated      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
