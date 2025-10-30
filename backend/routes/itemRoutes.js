import express from "express";
const router = express.Router();
import pool from "../db.js"; // koneksi database 

// CREATE Lost Item
router.post("/lost", async (req, res) => {
  try {
    const { name, description, location, date_lost, user_email } = req.body;
    const result = await pool.query(
      "INSERT INTO lost_items (name, description, location, date_lost, user_email) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, description, location, date_lost, user_email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ Lost Items
router.get("/lost", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lost_items ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Lost Item
router.put("/lost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, date_lost } = req.body;
    const result = await pool.query(
      "UPDATE lost_items SET name=$1, description=$2, location=$3, date_lost=$4 WHERE id=$5 RETURNING *",
      [name, description, location, date_lost, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Lost Item
router.delete("/lost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM lost_items WHERE id=$1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
