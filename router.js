// ---------------------
// GET riwayat transaksi untuk siswa (seluruh data)
// ---------------------
router.get("/riwayat", (req, res) => {
  const sql = `
    SELECT id, nama, makanan, harga, uang, kembalian, kekurangan, bukti, status,
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
// CREATE transaksi
// ---------------------
router.post("/transaksi", upload.single("bukti"), (req, res) => {
  const { tanggal, nama, makanan, harga, uang, kembalian, kekurangan } = req.body;

  const bukti = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO transaksi 
      (tanggal, nama, makanan, harga, uang, kembalian, kekurangan, bukti, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    tanggal,
    nama,
    makanan,
    parseFloat(harga) || 0,
    parseFloat(uang) || 0,
    parseFloat(kembalian) || 0,
    parseFloat(kekurangan) || 0,
    bukti,
    "Belum Lunas"
  ], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Transaksi berhasil disimpan!" });
  });
});

// ---------------------
// GET semua transaksi
// ---------------------
router.get("/transaksi", (req, res) => {
  const sql = `
    SELECT id, nama, makanan, harga, uang, kembalian, kekurangan, bukti, status,
           DATE_FORMAT(tanggal, '%d-%m-%Y') AS tanggal
    FROM transaksi
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Update status jadi Lunas + reset kekurangan
router.put("/transaksi/:id/lunas", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE transaksi SET status='Lunas', kekurangan=0 WHERE id=?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success:false, message:err.message });
    res.json({ success:true, message:"Status diubah menjadi Lunas!" });
  });
});

// Update status jadi Belum Lunas
router.put("/transaksi/:id/belum-lunas", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE transaksi SET status='Belum Lunas' WHERE id=?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success:false, message:err.message });
    res.json({ success:true, message:"Status diubah menjadi Belum Lunas!" });
  });
});

// Endpoint: GET /siswa/rekap
app.get("/siswa/rekap", cekLogin, (req, res) => {
  if (req.session.user.role !== "siswa") return aksesDitolak(res);
  db.query(
    "SELECT COUNT(*) AS totalTransaksi, SUM(harga) AS totalPemasukan, SUM(kekurangan) AS totalKurang FROM transaksi WHERE nama=?",
    [req.session.user.username],
    (err, result) => {
      if (err) throw err;
      res.json(result[0]);
    }
  );
});

module.exports = router;
