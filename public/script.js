// Kirim form
document.getElementById("formTransaksi").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await fetch("/api/transaksi", { method: "POST", body: formData });
  e.target.reset();
  loadTransaksi();
  loadRekap();
});

// 🔹 Formatter tanggal
function formatTanggal(tgl) {
  const date = new Date(tgl);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Load transaksi
async function loadTransaksi() {
  const res = await fetch("/admin/transaksi");
  const data = await res.json();
  const tbody = document.querySelector("#tabelTransaksi tbody");
  tbody.innerHTML = "";
  data.forEach((t, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${formatTanggal(t.tanggal)}</td>
        <td>${t.nama}</td>
        <td>${t.makanan}</td>
        <td>Rp ${t.harga}</td>
        <td>Rp ${t.uang}</td>
        <td>Rp ${t.kembalian}</td>
        <td style="color:${t.kekurangan > 0 ? "red" : "black"}">Rp ${t.kekurangan}</td>
        <td>${t.bukti ? `<img src="/uploads/${t.bukti}" style="max-width:50px;">` : "-"}</td>
        <td>
          <button class="btn btn-success btn-sm" onclick="hapusTransaksi(${t.id})">Lunas</button>
        </td>
      </tr>
    `;
  });
}

// Hapus transaksi
async function hapusTransaksi(id) {
  if (confirm("Yakin transaksi sudah lunas?")) {
    await fetch(`/admin/transaksi/${id}`, { method: "DELETE" });
    loadTransaksi();
    loadRekap();
  }
}

// Load rekap
async function loadRekap() {
  const res = await fetch("/admin/rekap");
  const r = await res.json();
  document.getElementById("rekap").innerHTML = `
    <p>Total Transaksi: <b>${r.totalTransaksi || 0}</b></p>
    <p>Total Pemasukan: <b>Rp ${r.totalPemasukan || 0}</b></p>
    <p>Total Kekurangan: <b style="color:red">Rp ${r.totalKurang || 0}</b></p>
  `;
}

// Jalankan saat load
loadTransaksi();
loadRekap();
