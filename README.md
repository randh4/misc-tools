# Network Tools Platform - Bandwidth Planner

Aplikasi kalkulator berbasis web untuk melakukan perencanaan alokasi kapasitas bandwidth jaringan menggunakan berbagai macam strategi alokasi secara dinamis. Proyek ini dibangun menggunakan framework **CodeIgniter 4**, **Bootstrap 5 (Sneat Template)**, **Vanilla JS**, dan **Chart.js**.

## Fitur Utama
Aplikasi ini menyediakan 6 strategi pembagian bandwidth:
1. **Equal Share**: Membagi rata total bandwidth kepada seluruh target.
2. **Weighted Allocation**: Membagi bandwidth secara proporsional berdasarkan bobot yang ditentukan.
3. **Priority Allocation**: Membagi bandwidth secara proporsional berdasarkan level prioritas (Critical, High, Medium, Low).
4. **Minimum Guarantee**: Menjamin alokasi minimum untuk masing-masing target, lalu membagi sisa bandwidth secara merata.
5. **User-Based Allocation**: Membagi bandwidth secara proporsional berdasarkan estimasi jumlah pengguna (User Count) di setiap area target.
6. **Hybrid Allocation**: Menggabungkan seluruh variabel (Minimum Guarantee, Prioritas, Bobot, dan Jumlah Pengguna) untuk menghitung distribusi bandwidth secara canggih.

---

## Prasyarat System (Prerequisites)
Pastikan komputer Anda sudah terinstal perangkat lunak berikut:
- **PHP**: Versi 8.1 atau yang lebih baru (pastikan ekstensi `intl`, `mbstring`, dan `curl` aktif).
- **Composer**: Dependency manager untuk PHP.
- **Git** (Opsional, untuk kloning repositori).
- Browser modern (Chrome, Firefox, Safari, Edge).

---

## Panduan Instalasi (Langkah demi Langkah)

### 1. Kloning Repositori
Buka terminal (Command Prompt/Git Bash) lalu jalankan perintah berikut:
```bash
git clone https://github.com/randh4/misc-tools.git
cd misc-tools
```

### 2. Instalasi Dependensi
Jalankan Composer untuk mengunduh framework dan dependensi library yang dibutuhkan:
```bash
composer install
```

### 3. Konfigurasi Environment
Salin file konfigurasi env bawaan menjadi `.env`:
```bash
cp env .env
```
Buka file `.env` menggunakan teks editor (Notepad, VS Code, dll.), cari baris `CI_ENVIRONMENT` dan ubah menjadi `development` agar pesan error terlihat jelas jika ada masalah:
```env
CI_ENVIRONMENT = development
```

### 4. Menjalankan Aplikasi
CodeIgniter 4 menyediakan web server bawaan untuk kemudahan pengembangan. Jalankan perintah ini:
```bash
php spark serve
```
Secara default, server lokal akan berjalan di alamat `http://localhost:8080`.

### 5. Akses Aplikasi
Buka web browser Anda, lalu kunjungi URL berikut:
- Aplikasi Bandwidth Planner: [http://localhost:8080/planner](http://localhost:8080/planner)

---

## Struktur Proyek Utama
- `app/Controllers/BandwidthPlanner.php` - Controller utama yang mengatur request API kalkulasi.
- `app/Services/Allocation/` - Folder yang berisi file class algoritma strategi alokasi bandwidth.
- `app/Views/planner/index.php` - Halaman tampilan utama aplikasi (Frontend).
