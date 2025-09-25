const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./db");
const path = require("path");
const multer = require("multer");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

app.use(
  session({
    secret: "kantinSMK",
    resave: false,
    saveUninitialized: true,
  })
);

// Upload bukti
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware cek login
function cekLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Fungsi akses ditolak
function aksesDitolak(res) {
  res.sendFile(path.join(__dirname, "public/akses-ditolak.html"));
}

// ---------------- AUTH -----------------
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

// Register siswa otomatis role = 'siswa'
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashPass = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashPass, "siswa"],
    (err) => {
      if (err) return res.send("Error: " + err.message);
      res.redirect("/login");
    }
  );
});

// Login: otomatis deteksi admin atau siswa
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
    if (err) throw err;

    if (result.length === 0) return aksesDitolak(res);

    const user = result[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return aksesDitolak(res);

    req.session.user = { id: user.id, username: user.username, role: user.role };

    if (user.role === "admin") res.redirect("/admin");
    else res.redirect("/siswa");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// ---------------- SISWA ----------------
app.get("/siswa", cekLogin, (req, res) => {
  if (req.session.user.role !== "siswa") return aksesDitolak(res);
  res.sendFile(path.join(__dirname, "public/siswa.html"));
});

app.post("/siswa/transaksi", cekLogin, upload.single("bukti"), (req, res) => {
  const { tanggal, makanan, harga, uang, kembalian_diterima } = req.body;
  const nama = req.session.user.username;

  const hargaNum = parseFloat(harga) || 0;
  const uangNum = parseFloat(uang) || 0;
  const kembalianDiterimaNum = parseFloat(kembalian_diterima) || 0;

  const kembalian = uangNum - hargaNum > 0 ? uangNum - hargaNum : 0;
  const kekurangan = kembalian - kembalianDiterimaNum > 0 ? kembalian - kembalianDiterimaNum : 0;
  const bukti = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO transaksi (tanggal, nama, makanan, harga, uang, kembalian, kekurangan, bukti) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [tanggal, nama, makanan, hargaNum, uangNum, kembalian, kekurangan, bukti],
    (err) => {
      if (err) throw err;
      res.redirect("/siswa");
    }
  );
});

app.get("/siswa/transaksi", cekLogin, (req, res) => {
  if (req.session.user.role !== "siswa") return aksesDitolak(res);
  db.query(
    "SELECT * FROM transaksi WHERE nama=?",
    [req.session.user.username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.get("/siswa/riwayat", cekLogin, (req, res) => {
  if (req.session.user.role !== "siswa") return aksesDitolak(res);
  db.query(
    "SELECT * FROM transaksi WHERE nama=?",
    [req.session.user.username],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

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

// ---------------- ADMIN ----------------
app.get("/admin", cekLogin, (req, res) => {
  if (req.session.user.role !== "admin") return aksesDitolak(res);
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/admin/transaksi", cekLogin, (req, res) => {
  if (req.session.user.role !== "admin") return aksesDitolak(res);
  db.query("SELECT * FROM transaksi", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.delete("/admin/transaksi/:id", cekLogin, (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM transaksi WHERE id=?", [id], (err) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

app.get("/admin/rekap", cekLogin, (req, res) => {
  if (req.session.user.role !== "admin") return aksesDitolak(res);
  db.query(
    "SELECT COUNT(*) AS totalTransaksi, SUM(harga) AS totalPemasukan, SUM(kekurangan) AS totalKurang FROM transaksi",
    (err, result) => {
      if (err) throw err;
      res.json(result[0]);
    }
  );
});

async function loadRekapSiswa() {
  const { username } = req.session.user;
  db.query(
    "SELECT COUNT(*) AS totalTransaksi, SUM(harga) AS totalPemasukan, SUM(kekurangan) AS totalKurang FROM transaksi WHERE nama=?",
    [username],
    (err, result) => {
      if (err) throw err;
      console.log("Rekap siswa:", result[0]);
    }
  );
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
