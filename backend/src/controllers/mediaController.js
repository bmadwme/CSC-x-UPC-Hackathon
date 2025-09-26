const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Controller function
async function uploadMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const filePath = req.file.path.replace(/\\/g, "/"); // replace backslashes

    console.log(filePath);

    const mimeType = req.file.mimetype;

    const query = `
      INSERT INTO media (filename, mimetype, url)
      VALUES ($1, $2, $3) RETURNING id
    `;
    const values = [req.file.filename, mimeType, filePath];
    const result = await pool.query(query, values);

    res.json({
      status: "ok",
      mediaId: result.rows[0].id,
      filePath: filePath,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

async function deleteMedia(req, res) {
  try {
    const { mediaUUID } = req.body;

    if (!mediaUUID) {
      return res.status(400).json({ status: "error", message: "mediaUUID is required" });
    }

    // Fetch the media row from the DB
    const selectQuery = `SELECT * FROM media WHERE id = $1`;
    const selectResult = await pool.query(selectQuery, [mediaUUID]);

    if (selectResult.rowCount === 0) {
      return res.status(404).json({ status: "error", message: "Media not found" });
    }

    const media = selectResult.rows[0];

    // Delete file from disk
    const filePath = path.join(process.cwd(), media.url); // resolves to /app/uploads/images/...
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Failed to delete file from disk:", err);
    })

    // Delete row from database
    const deleteQuery = `DELETE FROM media WHERE id = $1`;
    await pool.query(deleteQuery, [mediaUUID]);

    res.json({ status: "ok", message: "Media deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}


module.exports = {
  uploadMedia,
  deleteMedia,
};
