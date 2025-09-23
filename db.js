const mysql = require("mysql2");

// Buat koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // ganti kalau pakai password MySQL
  database: "kantin",
});

// Cek koneksi
db.connect((err) => {
  if (err) {
    console.error("❌ Gagal konek ke database:", err.message);
    throw err;
  }
  console.log("✅ Terhubung ke database MySQL (kantin)");
});

// Wrapper query biar lebih rapi pakai async/await
db.queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = db;
