const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "311204",
  database: "findme_db",
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4)",
      [name, email, phone, password]
    );
    res.json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    res.json({
      message: "Login berhasil",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
