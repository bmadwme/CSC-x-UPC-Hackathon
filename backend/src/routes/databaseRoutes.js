const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
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
} = require('../controllers/databaseController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images/");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/videos/");
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * Create a new user
 * POST /create-user
 * Body (JSON):
 *   {
 *     "username": "adam",
 *     "email": "adam@gmail.com",
 *     "password": "qwerty123"
 *   }
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "message": "User created successfully",
 *     "user": { id, username, email, created_at }
 *   }
 */
router.post('/create-user', createUser);

/**
 * Delete a user and all their associated events/media
 * DELETE /delete-user
 * Body (JSON):
 *   { "userId": "uuid-of-user" }
 * Response (JSON):
 *   { "status": "ok", "message": "User and associated data deleted successfully" }
 */
router.delete('/delete-user', deleteUser);

/**
 * Get a single user's details (excluding password)
 * GET /get-user?userId=<uuid>
 * Response (JSON):
 *   { "status": "ok", "user": { id, username, email, created_at } }
 */
router.get('/get-user', getUser);

/**
 * Get all users
 * GET /get-users
 * Response (JSON):
 *   { "status": "ok", "users": [ { id, username, email, created_at }, ... ] }
 */
router.get('/get-users', getUsers);

/**
 * Create an event with optional media upload
 * POST /create-event
 * Content-Type: multipart/form-data
 * Body (form-data):
 *   title: string
 *   description: string (optional)
 *   date: ISO string
 *   location: string (optional)
 *   creator_id: uuid
 *   media: multiple files (optional)
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "message": "Event created",
 *     "eventId": "uuid-of-event",
 *     "mediaIds": ["uuid1", "uuid2"]  // only if files uploaded
 *   }
 */
router.post('/create-event', upload.array("media"), createEvent);

/**
 * Delete an event and its associated media
 * DELETE /delete-event
 * Body (JSON):
 *   { "eventId": "uuid-of-event" }
 * Response (JSON):
 *   { "status": "ok", "message": "Event and associated media deleted successfully" }
 */
router.delete('/delete-event', deleteEvent);

/**
 * Get details of a single event
 * GET /get-event?eventId=<uuid>
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "event": { id, title, description, date, location, created_at, creator_username, creator_email }
 *   }
 */
router.get('/get-event', getEvent);

/**
 * Get all events
 * GET /get-events
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "events": [ { id, title, description, date, location, created_at, creator_username, creator_email }, ... ]
 *   }
 */
router.get('/get-events', getEvents);

/**
 * Get all media files associated with an event
 * GET /get-event-linked-media?eventId=<uuid>
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "eventId": "uuid-of-event",
 *     "media": [ { id, filename, mimetype, url, uploaded_at }, ... ]
 *   }
 */
router.get('/get-event-linked-media', getEventsLinkedMedia);

/**
 * Save an event for a user (user "attends" or bookmarks the event)
 * POST /save-event-under-user
 * Body (JSON):
 *   { "userId": "uuid-of-user", "eventId": "uuid-of-event" }
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "message": "Event saved for user",
 *     "savedEvent": { user_id, event_id, saved_at }
 *   }
 */
router.post('/save-event-under-user', saveEventUnderUser);

/**
 * Get all attendees (users) for an event
 * GET /get-event-attendees?eventId=<uuid>
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "attendees": [ { id, username, email, created_at }, ... ]
 *   }
 */
router.get('/get-event-attendees', getEventAttendees);

/**
 * Get all events saved by a user
 * GET /get-user-saved-events?userId=<uuid>
 * Response (JSON):
 *   {
 *     "status": "ok",
 *     "savedEvents": [ { id, title, description, date, location, creator_id, created_at }, ... ]
 *   }
 */
router.get('/get-user-saved-events', getUserSavedEvents);

module.exports = router;
