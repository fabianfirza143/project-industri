const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("./db");

const router = express.Router();

// ---------------------
// Konfigurasi upload
// ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------------
// POST transaksi
// ---------------------
// POST transaksi
router.post("/transaksi", upload.single("bukti"), (req, res) => {
  const { tanggal, nama, makanan, harga, uang } = req.body;

  const hargaNum = parseFloat(harga) || 0;
  const uangNum = parseFloat(uang) || 0;

  // ✅ perhitungan di server
  const kembalian = uangNum > hargaNum ? uangNum - hargaNum : 0;
  const kekurangan = uangNum < hargaNum ? hargaNum - uangNum : 0;

  const bukti = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO transaksi 
      (tanggal, nama, makanan, harga, uang, kembalian, kekurangan, bukti)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    tanggal,
    nama,
    makanan,
    parseFloat(hargaNum.toFixed(2)),
    parseFloat(uangNum.toFixed(2)),
    parseFloat(kembalian.toFixed(2)),
    parseFloat(kekurangan.toFixed(2)),
    bukti
  ], (err) => {
    if (err) throw err;
    res.json({ success: true, message: "Transaksi berhasil disimpan!" });
  });
});

// ---------------------
// GET semua transaksi
// ---------------------
router.get("/transaksi", (req, res) => {
  const sql = `
    SELECT 
      id, nama, makanan, harga, uang, kembalian, kekurangan, bukti,
      DATE_FORMAT(tanggal, '%d-%m-%Y') AS tanggal
    FROM transaksi
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// ---------------------
// GET rekap
// ---------------------
router.get("/rekap", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS totalTransaksi,
      SUM(harga) AS totalPemasukan,
      SUM(kekurangan) AS totalKurang
    FROM transaksi
  `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// ---------------------
// DELETE transaksi
// ---------------------
router.delete("/transaksi/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM transaksi WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.json({ success: true, message: "Transaksi berhasil dihapus!" });
  });
});

module.exports = router;
