const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// koneksi ke PostgreSQL
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "311204", // ganti kalau password kamu beda
  database: "findme_db",
});

// test koneksi
pool.connect()
  .then(() => console.log("✅ Koneksi ke PostgreSQL berhasil"))
  .catch(err => console.error("❌ Gagal konek ke PostgreSQL:", err));

// test endpoint
app.get("/", (req, res) => {
  res.send("Server backend jalan nih 🚀");
});

const authRoutes = require("./authRoutes");
app.use("/api", authRoutes);


app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

import itemsRoutes from "./routes/itemsRoutes.js";

app.use("/api/items", itemsRoutes);
