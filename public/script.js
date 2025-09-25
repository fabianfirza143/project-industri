// Kirim form
document.getElementById("formTransaksi").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await fetch("/api/transaksi", { method: "POST", body: formData });
  e.target.reset();
  loadTransaksi();
  loadRekap();
});

// Formatter tanggal
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
      <tr data-id="${t.id}" class="align-middle">
        <td class="fw-bold text-secondary">${i + 1}</td>
        <td class="text-primary">${formatTanggal(t.tanggal)}</td>
        <td class="fw-semibold">${t.nama}</td>
        <td>${t.makanan}</td>
        <td class="text-end">Rp ${t.harga.toLocaleString()}</td>
        <td class="text-end">Rp ${t.uang.toLocaleString()}</td>
        <td class="text-end">Rp ${t.kembalian.toLocaleString()}</td>
        <td class="text-end" style="color:${t.kekurangan > 0 ? 'red' : 'green'};font-weight:600;">Rp ${t.kekurangan.toLocaleString()}</td>
        <td>${t.bukti ? `<img src="/uploads/${t.bukti}" class="rounded shadow-sm" style="max-width:50px;max-height:50px;object-fit:cover;">` : "<span class='text-muted'>-</span>"}</td>
        <td>
          ${
            t.status === "Lunas"
              ? '<span class="badge rounded-pill bg-success px-3 py-2 shadow-sm d-inline-flex align-items-center" style="font-size:1rem;font-weight:600;"><span class="me-1">✔️</span> Lunas</span>'
              : `<button class="btn btn-warning btn-sm rounded-pill px-3 py-2 shadow-sm fw-semibold" onclick="updateStatus(${t.id}, 'lunas')"><span class='me-1'>⏳</span> Belum Lunas</button>`
          }
        </td>
      </tr>
    `;
  });
}


// Update status → permanen di database
async function updateStatus(id, status) {
  const url = `/api/transaksi/${id}/${status}`;
  const res = await fetch(url, { method: "PUT" });
  const result = await res.json();
  if(result.success){
    loadTransaksi(); // refresh tabel agar status terbaru tampil
    loadRekap();
  } else {
    alert("Gagal update status!");
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
