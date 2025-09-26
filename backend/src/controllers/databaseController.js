const bcrypt = require("bcrypt");
const pool = require("../db");
const { saveMediaToDB, deleteMediaById } = require("../helpers/mediaHelpers");
const fs = require("fs").promises;

async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `;
        const values = [username, email, password_hash];

        const result = await pool.query(query, values);
        res.status(201).json({
            status: "ok",
            message: "User created successfully",
            user: result.rows[0],
        });
    } catch (err) {
        console.error("Create user error:", err);

        if (err.code === "23505") {
            const detail = err.detail.includes("username")
                ? "Username already exists"
                : "Email already exists";
            return res.status(400).json({ status: "error", message: detail });
        }

        res.status(500).json({ status: "error", message: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ status: "error", message: "Missing userId" });
        }

        const mediaQuery = `
            SELECT m.id
            FROM media m
            JOIN events e ON m.event_id = e.id
            WHERE e.creator_id = $1
        `;
        const mediaResult = await pool.query(mediaQuery, [userId]);

        for (const row of mediaResult.rows) {
            await deleteMediaById(row.id);
        }

        await pool.query("DELETE FROM users WHERE id = $1", [userId]);

        res.json({ status: "ok", message: "User and associated data deleted successfully" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}




async function createEvent(req, res) {
    try {
        const { title, description, date, location, creator_id } = req.body;

        console.log(req.body)

        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!date) missingFields.push("date");
        if (!creator_id) missingFields.push("creator_id");

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: "error",
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        const eventResult = await pool.query(
            `INSERT INTO events (title, description, date, location, creator_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
            [title, description || null, date, location || null, creator_id]
        );
        const eventId = eventResult.rows[0].id;

        if (req.files && req.files.length > 0) {
            const mediaIds = await Promise.all(req.files.map(file => saveMediaToDB(file, eventId)));
            res.json({ status: "ok", message: "Event created", eventId, mediaIds });
        } else {
            res.json({ status: "ok", message: "Event created", eventId });
        }

    } catch (err) {
        console.error("Create event error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function deleteEvent(req, res) {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ status: "error", message: "Missing required field: eventId" });
        }

        const mediaResult = await pool.query(
            "SELECT id FROM media WHERE event_id = $1",
            [eventId]
        );
        const mediaIds = mediaResult.rows.map(row => row.id);

        for (const mediaId of mediaIds) {
            await deleteMediaById(mediaId);
        }

        await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

        res.json({ status: "ok", message: "Event and associated media deleted successfully" });
    } catch (err) {
        console.error("Delete event error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}





async function getUser(req, res) {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ status: "error", message: "Missing userId" });
        }

        const query = `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = $1
    `;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.json({ status: "ok", user: result.rows[0] });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function getUsers(req, res) {
    try {
        const query = `
      SELECT id, username, email, created_at
      FROM users
      ORDER BY created_at DESC
    `;
        const result = await pool.query(query);

        res.json({
            status: "ok",
            users: result.rows
        });
    } catch (err) {
        console.error("Get users error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}



async function getEvent(req, res) {
    try {
        const eventId = req.query.eventId;
        if (!eventId) {
            return res.status(400).json({ status: "error", message: "Missing eventId" });
        }

        const query = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.date,
                e.location,
                e.created_at,
                u.username AS creator_username,
                u.email AS creator_email
            FROM events e
            JOIN users u ON e.creator_id = u.id
            WHERE e.id = $1
        `;
        const result = await pool.query(query, [eventId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "error", message: "Event not found" });
        }

        res.json({
            status: "ok",
            event: result.rows[0]
        });
    } catch (err) {
        console.error("Get event error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function getEvents(req, res) {
    try {
        const query = `
            SELECT 
                e.id,
                e.title,
                e.description,
                e.date,
                e.location,
                e.created_at,
                u.username AS creator_username,
                u.email AS creator_email
            FROM events e
            JOIN users u ON e.creator_id = u.id
            ORDER BY e.date ASC
        `;
        const result = await pool.query(query);

        res.json({
            status: "ok",
            events: result.rows
        });
    } catch (err) {
        console.error("Get events error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function getEventsLinkedMedia(req, res) {
    try {

        const eventId = req.query.eventId;

        if (!eventId) {
            return res.status(400).json({
                status: "error",
                message: "Missing required field: eventId"
            });
        }

        const query = `
            SELECT id, filename, mimetype, url, uploaded_at
            FROM media
            WHERE event_id = $1
            ORDER BY uploaded_at ASC
        `;

        const result = await pool.query(query, [eventId]);

        res.json({
            status: "ok",
            eventId,
            media: result.rows
        });
    } catch (err) {
        console.error("Get event media error:", err);
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
}


async function getEventAttendees(req, res) {
    try {
        const eventId = req.query.eventId;
        if (!eventId) {
            return res.status(400).json({ status: "error", message: "Missing eventId" });
        }

        const query = `
            SELECT u.id, u.username, u.email, u.created_at
            FROM users u
            JOIN saved_events se ON u.id = se.user_id
            WHERE se.event_id = $1
            ORDER BY u.username ASC
        `;
        const result = await pool.query(query, [eventId]);

        res.json({
            status: "ok",
            attendees: result.rows
        });
    } catch (err) {
        console.error("Get event attendees error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function saveEventUnderUser(req, res) {
    try {
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
            return res.status(400).json({
                status: "error",
                message: `Missing required fields: ${!userId ? "userId" : ""} ${!eventId ? "eventId" : ""}`.trim()
            });
        }

        const query = `
            INSERT INTO saved_events (user_id, event_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING user_id, event_id, saved_at
        `;
        const values = [userId, eventId];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.json({
                status: "ok",
                message: "Event was already saved by this user"
            });
        }

        res.json({
            status: "ok",
            message: "Event saved for user",
            savedEvent: result.rows[0]
        });

    } catch (err) {
        console.error("Save event error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

async function getUserSavedEvents(req, res) {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ status: "error", message: "Missing userId" });
        }

        const query = `
            SELECT e.id, e.title, e.description, e.date, e.location, e.creator_id, e.created_at
            FROM events e
            JOIN saved_events se ON e.id = se.event_id
            WHERE se.user_id = $1
            ORDER BY e.date ASC
        `;
        const result = await pool.query(query, [userId]);

        res.json({
            status: "ok",
            savedEvents: result.rows
        });
    } catch (err) {
        console.error("Get user saved events error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}







module.exports = {
    createUser,
    deleteUser,
    getUser,
    getUsers,

    createEvent,
    deleteEvent,
    getEvent,
    getEvents,

    getEventsLinkedMedia,

    saveEventUnderUser,

    getEventAttendees,
    getUserSavedEvents,

}