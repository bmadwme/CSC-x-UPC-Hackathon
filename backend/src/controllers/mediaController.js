const path = require("path");
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

    const filePath = req.file.path; // where multer saved it
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

module.exports = {
  uploadMedia,
};
