# 1. Executive Summary
Penambahan fitur Pop-up Informasi dan Instruksi Penggunaan untuk masing-masing Strategi Alokasi pada Bandwidth Planner. Fitur ini bertujuan memberikan panduan instan kepada pengguna langsung dari antarmuka kalkulator tanpa harus membuka halaman dokumentasi terpisah.

# 2. Current Condition Analysis
- **Kondisi:** Pengguna memilih strategi dari dropdown tanpa penjelasan mengenai algoritma atau parameter yang dibutuhkan.
- **Tantangan:** Mengintegrasikan bantuan dinamis sesuai strategi terpilih tanpa mengganggu form layout.
- **Rekomendasi:** Menggunakan komponen Bootstrap 5 Modal yang dipicu oleh ikon bantuan di samping label "Allocation Strategy", di mana konten modal dirender secara dinamis via JavaScript dari API backend.

# 3. Proposed Solution
- **UI Element:** Ikon informasi interaktif (`bx-info-circle`) di sebelah dropdown.
- **Komponen Pop-up:** Menggunakan kerangka statis Bootstrap Modal di frontend.
- **Data Source:** Backend API `/api/planner/strategies` akan diperbarui untuk mengembalikan data `description` dan `instruction` setiap strategi, agar pengaturan konten terpusat di backend.
- **Interaksi:** Saat ikon diklik, JS mengambil konten dari state sesuai strategi aktif dan meng-inject-nya ke dalam Modal sebelum menampilkannya.

# 4. Database Impact
- N/A.

# 5. Backend Impact
- Modifikasi interface `app/Services/Allocation/StrategyInterface.php`.
- Penambahan fungsi untuk mendapatkan deskripsi pada setiap class strategi.
- Modifikasi endpoint `GET /api/planner/strategies` di `app/Controllers/BandwidthPlanner.php` untuk merender field tambahan pada JSON.

# 6. Frontend Impact
- Penambahan elemen tombol informasi (Tooltip/Icon) pada view `planner/index.php`.
- Penambahan elemen `<div class="modal">` Bootstrap pada file view yang sama.
- Modifikasi blok JavaScript di `planner/index.php` untuk menangani event klik dan menginjeksi konten ke modal secara dinamis.

# 7. API Impact
- Endpoint: `GET /api/planner/strategies`
- Perubahan Payload Response JSON (Penambahan Data):
  ```json
  {
    "equal": {
      "name": "Equal Share",
      "fields": [...],
      "description": "Membagi bandwidth secara rata...",
      "instruction": "Tidak ada input tambahan. Cukup tambahkan nama target."
    }
  }
  ```

# 8. Risk Analysis
- **Risiko Responsivitas:** Modal terpotong pada device berukuran kecil jika instruksi terlalu panjang.
  - *Mitigasi:* Penggunaan class `.modal-dialog-scrollable` dan pembatasan panjang kalimat instruksi.

# 9. Task Breakdown
- **Phase 1: Modifikasi Backend (Allocation Engine & API)**
  - [ ] Update `StrategyInterface.php`: Tambahkan deklarasi method `getDescription(): string` dan `getInstruction(): array`.
  - [ ] Implementasikan method baru tersebut pada class `EqualShare`, `WeightedAllocation`, `PriorityAllocation`, dan `MinimumGuarantee`.
  - [ ] Update `BandwidthPlanner::strategies()`: Panggil method tersebut dan sisipkan `description` dan `instruction` pada output array JSON.
- **Phase 2: Update UI Form & Modal (Frontend)**
  - [ ] Edit `app/Views/planner/index.php`: Tambahkan elemen `<i id="btn-strategy-info" class="bx bx-info-circle text-primary ms-2 cursor-pointer"></i>` di sebelah label Allocation Strategy.
  - [ ] Tambahkan elemen HTML Bootstrap Modal kosong dengan ID `strategyInfoModal` (terdiri dari HeaderTitle, BodyDescription, BodyInstructionList) di bagian bawah form.
- **Phase 3: JavaScript Integration**
  - [ ] Modifikasi JavaScript: Pastikan `strategiesConfig` yang diambil dari endpoint API menyimpan field instruksi terbaru.
  - [ ] Tambahkan event listener `'click'` pada `btn-strategy-info`.
  - [ ] Di dalam event listener, inject data dari `strategiesConfig[strategySelect.value]` ke dalam innerHTML modal (Title, Deskripsi, dan list Instruksi).
  - [ ] Tampilkan modal menggunakan `new bootstrap.Modal(document.getElementById('strategyInfoModal')).show()`.

# 10. Testing Checklist
- [ ] Ikon info muncul proporsional di sebelah dropdown.
- [ ] Hover ikon memunculkan kursor pointer.
- [ ] Klik ikon sukses memunculkan Modal Bootstrap di tengah layar.
- [ ] Judul dan isi teks dalam Modal berganti sesuai dengan pilihan strategi yang sedang aktif.
- [ ] Daftar instruksi (array ke list HTML) dirender dengan format yang benar.
- [ ] Tombol *Close* pada modal dan klik *backdrop* sukses menutup modal.

# 11. Deployment Checklist
- [ ] Pastikan script JS terbaru dimuat ulang (clear browser cache jika perlu).
- [ ] Verifikasi endpoint API mengembalikan key `description` dan `instruction` di environment production.
