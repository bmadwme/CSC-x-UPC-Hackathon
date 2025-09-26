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



// { JSON
//     "username": "adam",
//     "email": "adam@gmail.com",
//     "password": "qwerty123"
// }
router.post('/create-user',createUser);



// { JSON
//     "userId": e71a9b33-cb65-4573-9260-3dd8ae261656",
// }
router.delete('/delete-user',deleteUser);

// GET /get-user?userId=31d2e893-03c8-4aa4-95d0-6c6bda1c1445
router.get('/get-user',getUser);
router.get('/get-users',getUsers);


/**
 * Example: Create Event with Media Upload
 *
 * Endpoint: POST /api/events
 * Content-Type: multipart/form-data
 *
 * Body (multipart/form-data):
 *   title: "My Awesome Event"
 *   description: "Check out this link: https://example.com"
 *   date: "2025-10-01T18:00:00"
 *   location: "Some Venue"
 *   creator_id: "uuid-of-user-creator"
 *   media: [file1.png, file2.mp4]  // attach multiple files under the same key "media"
 *
 * Response:
 * { JSON
 *   "status": "ok",
 *   "message": "Event created",
 *   "eventId": "123e4567-e89b-12d3-a456-426614174000",
 *   "mediaIds": ["uuid1", "uuid2"]
 * }
 */
router.post('/create-event', upload.array("media"), createEvent);

// { JSON
//     "eventId": "e71a9b33-cb65-4573-9260-3dd8ae261656",
// }
router.delete('/delete-event', deleteEvent);

// GET /get-event?eventId=31d2e893-03c8-4aa4-95d0-6c6bda1c1445
router.get('/get-event', getEvent);
router.get('/get-events', getEvents);


// GET /get-event-linked-media?eventId=31d2e893-03c8-4aa4-95d0-6c6bda1c1445
router.get('/get-event-linked-media',getEventsLinkedMedia);


// { JSON
//     "eventId": "e71a9b33-cb65-4573-9260-3dd8ae261656",
//      "userId": e71a9b33-cb65-4573-9260-3dd8ae261656",
// }
router.post('/save-event-under-user', saveEventUnderUser);

// GET /get-event-linked-media?eventId=31d2e893-03c8-4aa4-95d0-6c6bda1c1445
router.get('/get-event-attendees',getEventAttendees);
// GET /get-event-linked-media?eventId=31d2e893-03c8-4aa4-95d0-6c6bda1c1445
router.get('/get-user-saved-events',getUserSavedEvents);

module.exports = router;