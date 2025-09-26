// mediaHelpers.js
const path = require("path");
const pool = require("../db"); // import central pool

/**
 * Saves uploaded media file to the database
 * @param {object} file - multer file object
 * @param {string|null} eventId - optional, the event ID this media is attached to
 * @returns {string} inserted media ID
 */
async function saveMediaToDB(file, eventId = null) {
  const filePath = file.path.replace(/\\/g, "/"); // normalize path for Docker/Linux
  const mimeType = file.mimetype;

  const query = `
    INSERT INTO media (event_id, filename, mimetype, url)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [eventId, file.filename, mimeType, filePath];

  const result = await pool.query(query, values);
  return result.rows[0].id;
}

/**
 * Deletes a media file from disk and database
 * @param {string} mediaId - UUID of media to delete
 */
async function deleteMediaById(mediaId) {
  // Get media record
  const { rows } = await pool.query("SELECT url FROM media WHERE id = $1", [mediaId]);
  if (rows.length === 0) throw new Error("Media not found");

  const filePath = path.join(process.cwd(), rows[0].url.replace(/\\/g, "/"));

  // Delete from disk
  const fs = require("fs").promises;
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn("Failed to delete file from disk:", err);
  }

  // Delete from database
  await pool.query("DELETE FROM media WHERE id = $1", [mediaId]);
}

module.exports = {
  saveMediaToDB,
  deleteMediaById,
};
