const pool = require("../db");
const bcrypt = require("bcrypt");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Missing username or password" });
    }

    const query = "SELECT id, username, email, password_hash FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ status: "error", message: "Invalid username or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid username or password" });
    }

    res.json({
      status: "ok",
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = { login };
