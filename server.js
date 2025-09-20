
const express = require("express");
const transaksiRouter = require("./router");
const path = require("path");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const routes = require("./router");

const app = express();
const PORT = 3000;
// 🔄 Live reload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public"));
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => liveReloadServer.refresh("/"), 100);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.post("/", (req, res) => {
  const { tanggal, nama, makanan, harga, uang, kembalian, bukti } = req.body;
  console.log(tanggal, nama, makanan, harga, uang, kembalian, bukti);

  res.send("Data diterima tanpa tampil di URL!");
});


// Routes API
// app.use("/api", routes);

app.use("/api", transaksiRouter);

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
