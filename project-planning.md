# 1. Executive Summary
Penambahan fitur **User-Based Allocation Strategy** dan pembaruan pada **Hybrid Allocation** untuk mengakomodasi alokasi berbasis jumlah pengguna (User Count). Fitur ini bertujuan untuk memberikan opsi pembagian bandwidth yang dinamis dan adil sesuai dengan kepadatan populasi pengguna di setiap area target.

# 2. Current Condition Analysis
- **Kondisi:** Strategi yang ada belum mempertimbangkan jumlah kepala (user aktif/estimasi pengguna) di dalam suatu jaringan.
- **Tantangan:** Alokasi untuk area publik (misal: kantin dengan estimasi 100 user) jika disamakan bobotnya dengan ruang server (2 user) melalui *equal share* atau harus menghitung rasio manual melalui *weighted* menjadi kurang intuitif.
- **Solusi:** 
  1. Membuat strategi spesifik `UserBasedAllocation`.
  2. Menyuntikkan metrik `user_count` ke dalam strategi `HybridAllocation` sebagai faktor penentu bobot kalkulasi.

# 3. Proposed Solution
- **User-Based Allocation:** Memiliki 1 parameter tunggal (`user_count`). Bandwidth dibagi berdasarkan proporsi `(User Count Target / Total Semua User) x Total Bandwidth`.
- **Pembaruan Hybrid Allocation:** Parameter form Hybrid bertambah menjadi 4 (`min_alloc`, `priority`, `weight`, `user_count`). *Combined Score* pada Hybrid akan menjadi perkalian seluruh faktor: `Priority Multiplier x Weight x User Count`.

# 4. Database Impact
- N/A.

# 5. Backend Impact
- **Pembuatan:** File `app/Services/Allocation/UserBasedAllocation.php`.
- **Modifikasi:** File `app/Services/Allocation/HybridAllocation.php` (penyesuaian array `getFields` dan logika rumus `calculate`).
- **Registrasi:** Menambahkan `'user_based' => \App\Services\Allocation\UserBasedAllocation::class` di controller `BandwidthPlanner.php`.

# 6. Frontend Impact
- Penambahan elemen `<option>` untuk User-Based Allocation di HTML form.
- Penyesuaian layout tidak signifikan, namun karena Hybrid kini memiliki 4 field form, tabel target secara vertikal akan memanjang. Karena sistem *input-group* sudah diterapkan pada milestone sebelumnya, perulangan (loop) JS otomatis menangani penampilan 4 elemen input dengan rapi.

# 7. API Impact
- Response endpoint `/api/planner/strategies` akan bertambah 1 objek (`user_based`) dan field milik (`hybrid`) akan disisipkan elemen input form ke-4 yaitu `user_count` dengan tipe number.

# 8. Risk Analysis
- **Risiko Logika:** User bisa menginput nilai `0` untuk User Count, menyebabkan error division by zero jika total user 0.
  - *Mitigasi:* Tambahkan validasi backend `totalUserCount > 0` dan syarat field harus diisi angka minimal 1.
- **Risiko UX (Kepadatan UI):** Menumpuk 4 baris input di dalam sel tabel mungkin membuat baris (row) menjadi sangat tinggi.
  - *Mitigasi:* Jika memungkinkan di masa depan, pisahkan parameter form dari bentuk tabel, namun untuk sekarang, susunan vertikal `flex-column` sudah mencukupi dan bisa di-scroll.

# 9. Task Breakdown
- **Phase 1: Backend User-Based Strategy**
  - [ ] Buat file `UserBasedAllocation.php` yang implement `StrategyInterface`.
  - [ ] Buat fungsi `getFields()` mengembalikan array config untuk 1 field `user_count` (min: 1).
  - [ ] Tulis logika `calculate()` yang membagi total bandwidth secara persentase berdasarkan jumlah user per baris target.
  - [ ] Registrasi class ke dalam array controller `BandwidthPlanner`.
- **Phase 2: Backend Hybrid Update**
  - [ ] Buka `HybridAllocation.php`.
  - [ ] Sisipkan field config `user_count` di `getFields()`.
  - [ ] Ubah blok kode perhitungan *Combined Score* pada `calculate()` agar mencakup perkalian dengan `user_count`.
  - [ ] Update validasi `validate()` pada kedua kelas tersebut.
  - [ ] Update text deskripsi dan instruksi agar mencerminkan fungsionalitas `user_count`.
- **Phase 3: Frontend Update**
  - [ ] Buka `app/Views/planner/index.php`.
  - [ ] Tambahkan tag `<option value="user_based">User-Based Allocation</option>` di dropdown `<select id="strategy">`.

# 10. Testing Checklist
- [ ] Tombol opsi User-Based muncul pada UI.
- [ ] Jika User-Based dipilih, field `User Count` muncul dan kalkulasi berjalan proporsional 100% tepat.
- [ ] Jika Hybrid dipilih, field ke-4 (`User Count`) muncul dan berfungsi memperbesar persentase perolehan (Multiplier) bagi target dengan user terbanyak setelah jaminan Minimum terpenuhi.
- [ ] Validasi error berfungsi jika user menginput nilai User Count `0` atau minus.

# 11. Deployment Checklist
- [ ] Clear browser cache/hard reload memastikan DOM HTML terbaru ditarik.
