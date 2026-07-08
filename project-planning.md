# 1. Executive Summary
Penambahan fitur **Hybrid Allocation Strategy** pada Bandwidth Planner. Strategi ini dirancang untuk menyelesaikan skenario dunia nyata yang kompleks dengan menggabungkan variabel Minimum Guarantee, Priority, dan Weight. Secara teknis, pengembangan fitur ini **sangat memungkinkan** dan akan diakomodasi melalui penambahan satu class strategi baru yang menggunakan struktur modular yang sudah ada.

# 2. Current Condition Analysis
- **Kondisi:** Pengguna hanya dapat menggunakan satu metrik (rata, bobot, prioritas, atau jaminan minimum) pada satu waktu.
- **Tantangan:** Jika pengguna ingin memberikan minimum bandwidth *dan* membagi sisa bandwidth berdasarkan prioritas divisi, hal tersebut tidak terfasilitasi.
- **Solusi:** Membuat strategi hibrida yang merender tiga variabel sekaligus pada form target (Min. Alloc, Priority, dan Weight).

# 3. Proposed Solution
- **Mekanisme Kalkulasi Hybrid:**
  1. **Fase Jaminan:** Seluruh nilai Minimum Allocation diberikan kepada masing-masing target.
  2. **Kalkulasi Sisa:** Kapasitas sisa = (Total Bandwidth - Total Jaminan).
  3. **Combined Score:** Setiap target memiliki *Combined Score* hasil dari `Bobot (Weight) x Pengali Prioritas (Critical=4, dst)`.
  4. **Fase Sisa (Proportional):** Kapasitas sisa dibagikan ke masing-masing target berdasarkan *Combined Score* dibandingkan dengan Total Skor.
- **Kesimpulan:** Ya, ini memungkinkan karena arsitektur *Service/Strategy Pattern* sudah dipersiapkan untuk dinamisnya array `getFields()` dan algoritma terisolasi pada method `calculate()`.

# 4. Database Impact
- N/A.

# 5. Backend Impact
- **Pembuatan File:** `app/Services/Allocation/HybridAllocation.php` (Implementasi `StrategyInterface`).
- **Registrasi Strategi:** Menambahkan elemen `hybrid` pada array `$strategies` di controller `BandwidthPlanner.php`.
- **Validasi:** Menggunakan ulang logika pemeriksaan kapasitas limit (sama seperti *Minimum Guarantee*).

# 6. Frontend Impact
- **HTML:** Menambah `<option value="hybrid">Hybrid Allocation</option>` di dropdown form.
- **JavaScript UI:** Saat ini JS di `planner.js` menangkap array `fields` yang isinya hanya 1 index (index [0]). Fungsi `updateDynamicFields()` dan pembacaan target payload harus sedikit dimodifikasi melalui perulangan (looping) agar jika ada lebih dari 1 field (seperti Hybrid yang memiliki 3 field), semuanya dirender secara bersusun (stacked) dengan rapi di dalam satu kolom tabel `param-cell`, serta di-parsing secara utuh saat *submit*.

# 7. API Impact
- Response `GET /api/planner/strategies` akan mengembalikan satu objek strategi tambahan (`hybrid`) dengan key `fields` berisi array dari tiga objek parameter input (Number, Select, Number).

# 8. Risk Analysis
- **Risiko (UI/UX):** Karena kolom parameter akan diisi oleh 3 input field, tabel target bisa menjadi sangat padat di layar kecil.
  - *Mitigasi:* Susun elemen input secara vertikal (class `d-flex flex-column gap-2`) di sel tabel tersebut.
- **Risiko Matematis:** Pembagian nilai dengan pembulatan berpotensi menyisakan (hilang) fraksi 0.01 bandwidth.
  - *Mitigasi:* Terapkan metode pembulatan standar (`round(..., 2)`) dan tidak menuntut presisi mutlak hingga 10 desimal (sudah mencukupi untuk MVP).

# 9. Task Breakdown
- **Phase 1: Backend Implementation**
  - [ ] Buat class `HybridAllocation.php` dan implementasikan 4 method wajib interface.
  - [ ] Di dalam `getFields()`, kembalikan array konfigurasi untuk `min_alloc`, `priority`, dan `weight`.
  - [ ] Di dalam `validate()`, cek limit minimum allocation dan validitas semua data (sama seperti validasi pada ketiga kelas gabungannya).
  - [ ] Di dalam `calculate()`, lakukan Fase Jaminan kemudian hitung sisa menggunakan *Combined Score* (Weight x PriorityMultiplier).
  - [ ] Daftarkan class `HybridAllocation` di array `BandwidthPlanner.php`.
- **Phase 2: Frontend Layout Update**
  - [ ] Tambahkan opsi `Hybrid Allocation` ke elemen `<select id="strategy">`.
  - [ ] Modifikasi loop di JS bagian `updateDynamicFields()` agar dapat merender seluruh isi array `config.fields` (tidak hanya index `[0]`) ke dalam div container ber-class `d-flex flex-column gap-2`.
  - [ ] Pastikan payload `targetObj` menyimpan semua `data-name` dari field yang dirender saat submit.

# 10. Testing Checklist
- [ ] Opsi Hybrid muncul pada form frontend.
- [ ] Memilih Hybrid akan menampilkan 3 kolom input secara vertikal di kolom Parameter target.
- [ ] Hasil kalkulasi memberikan Minimum Allocation ke setiap target, lalu membagi sisanya sesuai proporsi skor.
- [ ] Menginput total Minimum Allocation yang melebihi Total Bandwidth menolak kalkulasi dan menampilkan alert error.
- [ ] Pop-up modal info menampilkan deskripsi/instruksi khusus Hybrid.

# 11. Deployment Checklist
- [ ] Cek ulang konsistensi UI di mode mobile saat mode Hybrid dipilih (scroll tabel horizontal dapat digunakan).
