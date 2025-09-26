const express = require("express");
const multer = require("multer");
const path = require("path");




const { 
  uploadMedia,
  deleteMedia,
} = require("../controllers/mediaController");

const router = express.Router();

// Configure multer storage
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


// --- Route: POST /api/media/upload ---
// Expects:
//   - Form-data request
//   - One file in the field called "media"
//   - Optional: additional fields like event_id (to link file to an event)
// Example request body (form-data):
//   media: <file>
//   event_id: <uuid of the event>
router.post("/upload", upload.single("media"), uploadMedia);


// {
//   "mediaUUID": "uuid-of-the-media-to-delete"
// }
router.delete("/delete", deleteMedia);

module.exports = router;
