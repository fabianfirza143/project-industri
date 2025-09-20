    // Kirim form
    document.getElementById("formTransaksi").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      await fetch("/api/transaksi", { method: "POST", body: formData });
      e.target.reset();
      loadTransaksi();
      loadRekap();
    });

    // Load transaksi
    async function loadTransaksi() {
      const res = await fetch("/api/transaksi");
      const data = await res.json();
      const tbody = document.querySelector("#tabelTransaksi tbody");
      tbody.innerHTML = "";
      data.forEach((t, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${t.tanggal}</td>
            <td>${t.nama}</td>
            <td>${t.makanan}</td>
            <td>Rp ${t.harga}</td>
            <td>Rp ${t.uang}</td>
            <td>Rp ${t.kembalian}</td>
            <td style="color:${t.kekurangan > 0 ? "red" : "black"}">Rp ${t.kekurangan}</td>
           <td>${t.bukti ? `<img src="/uploads/${t.bukti}" style="max-width:50px; border-radius:5px;">` : "-"}</td>

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
        await fetch(`/api/transaksi/${id}`, { method: "DELETE" });
        loadTransaksi();
        loadRekap();
      }
    }

    // Load rekap
    async function loadRekap() {
      const res = await fetch("/api/rekap");
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
