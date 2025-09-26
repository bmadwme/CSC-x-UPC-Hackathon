-- Users table
-- Stores registered users of the app.
-- Primary key: id
-- Each user can create many events and save many events.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
-- Stores events created by users.
-- Primary key: id
-- Foreign key: creator_id references users(id)
-- Relationship: 1 user (creator) -> many events
-- If a user is deleted, their events are also deleted (ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Media table
-- Stores uploaded images or videos.
-- Each media item belongs to a single event.
-- Relationship: 1 event -> many media files
-- Foreign key: event_id references events(id)
-- If an event is deleted, its media are also deleted (ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- link to event
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    url TEXT NOT NULL, -- local path or later cloud URL
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Saved Events table
-- Implements many-to-many relationship between users and events they save.
-- Primary key is composite: (user_id, event_id)
-- Foreign keys:
--   user_id references users(id)
--   event_id references events(id)
-- Relationships:
--   1 user can save many events
--   1 event can be saved by many users
-- ON DELETE CASCADE ensures that if a user or event is deleted, related saved_events rows are automatically removed
CREATE TABLE IF NOT EXISTS saved_events (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);
