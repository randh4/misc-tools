# Network Tools Platform

## Project Summary & MVP Development Guide

**Version:** 1.0 (MVP)

---

# 1. Project Overview

**Network Tools Platform** adalah aplikasi berbasis web yang menyediakan berbagai utilitas untuk membantu pekerjaan Network Engineer, IT Support, System Administrator, maupun praktisi jaringan lainnya.

Platform ini dirancang sebagai kumpulan tools yang dapat digunakan secara bebas tanpa proses login.

Tool pertama yang akan dikembangkan adalah:

> **Bandwidth Allocation Planner**

Ke depannya platform ini akan berkembang menjadi kumpulan berbagai tools jaringan dalam satu aplikasi.

---

# 2. Vision

Menjadi platform utilitas jaringan yang:

* Ringan
* Mudah digunakan
* Responsif
* Vendor Independent
* Berorientasi pada analisis dan perencanaan jaringan
* Dapat diakses siapa saja tanpa login

---

# 3. Goals

Membantu pengguna menentukan **Recommended Bandwidth Allocation** berdasarkan kebutuhan masing-masing target menggunakan berbagai strategi perhitungan.

Aplikasi hanya memberikan rekomendasi, **bukan melakukan konfigurasi router**.

---

# 4. Scope MVP

## Dashboard

Halaman utama platform.

Berisi:

* Profil singkat aplikasi
* Deskripsi platform
* Daftar tools yang tersedia
* Daftar tools yang akan datang
* Informasi versi aplikasi

---

## Bandwidth Allocation Planner

Fitur utama:

* Input Total Bandwidth
* Pilihan Unit (Kbps, Mbps, Gbps)
* Input Target Allocation
* Dynamic Allocation Strategy
* Dynamic Parameter Form
* Recommended Allocation
* Allocation Table
* Pie Chart
* Bar Chart (opsional)

---

# 5. Out of Scope

Belum dikerjakan pada MVP:

* Authentication
* Authorization
* Database
* Export PDF
* History
* Save Scenario
* Router Integration
* MikroTik Script Generator
* Monitoring
* Capacity Planning

---

# 6. Technology Stack

## Backend

* CodeIgniter 4
* PHP 8.1+

## Frontend

* Bootstrap 5
* Sneat Bootstrap Admin Template (Free)
* Vanilla JavaScript
* Fetch API (AJAX)

## Visualization

* Chart.js

## Storage

* Session
* LocalStorage (opsional)

Tanpa menggunakan database.

---

# 7. UI Framework

Menggunakan:

Sneat Bootstrap HTML Admin Template (Free)

Repository:

https://github.com/themeselection/sneat-bootstrap-html-admin-template-free

Template digunakan sebagai fondasi layout, komponen, navigasi, serta responsivitas aplikasi.

---

# 8. Color Palette

| Role       | Color       | Hex     |
| ---------- | ----------- | ------- |
| Primary    | Olive Green | #607456 |
| Background | Soft Beige  | #EEE0CC |
| Accent     | Terracotta  | #BA6A4C |
| Danger     | Dark Maroon | #7B2525 |

---

# 9. Design Principles

Konsep UI:

* Clean
* Minimalist
* Modern
* Professional
* Dashboard-oriented
* Fokus pada keterbacaan data
* Banyak whitespace
* Konsisten pada seluruh tools

---

# 10. User Flow

```text
Dashboard

↓

Pilih Tool

↓

Bandwidth Allocation Planner

↓

Input Total Bandwidth

↓

Tambah Target Allocation

↓

Pilih Allocation Strategy

↓

(Jika diperlukan)

Input Parameter Tambahan

↓

Calculate Recommendation

↓

Recommended Allocation

↓

Table + Chart
```

---

# 11. Allocation Strategy

## Equal Share

Semua target memperoleh bandwidth yang sama.

Parameter tambahan:

Tidak ada.

---

## Weighted Allocation

Bandwidth dibagi berdasarkan bobot.

Parameter:

Weight

---

## Priority Allocation

Bandwidth dibagi berdasarkan prioritas.

Parameter:

* Critical
* High
* Medium
* Low

---

## Minimum Guarantee

Bandwidth minimum diberikan terlebih dahulu.

Parameter:

Minimum Allocation

---

# 12. Dynamic Form

Parameter tambahan hanya muncul sesuai Allocation Strategy yang dipilih.

Contoh:

Equal Share

↓

Tidak ada input tambahan

Weighted Allocation

↓

Weight Field muncul

Priority Allocation

↓

Priority Dropdown muncul

Minimum Guarantee

↓

Minimum Allocation Field muncul

---

# 13. Input Form

## Total Bandwidth

| Field     | Type     |
| --------- | -------- |
| Bandwidth | Number   |
| Unit      | Dropdown |

Unit:

* Kbps
* Mbps
* Gbps

---

## Target Allocation

Setiap target memiliki:

| Field       |
| ----------- |
| Target Name |

Target dapat berupa:

* Area
* VLAN
* Gedung
* Divisi
* User Group
* Access Point

Jumlah target dapat ditambah atau dihapus secara dinamis.

---

# 14. Output

## Summary

Menampilkan:

* Total Bandwidth
* Allocation Strategy
* Jumlah Target

---

## Allocation Table

| Target | Recommended Allocation |

---

## Visualization

Menggunakan Chart.js

Minimal:

* Pie Chart

Opsional:

* Horizontal Bar Chart

---

# 15. User Experience

* Tanpa login
* Tanpa reload halaman
* Dynamic Form
* Validasi real-time
* Hasil diperbarui secara langsung
* Responsif pada Desktop dan Tablet
* Mobile friendly

---

# 16. Arsitektur

```text
Presentation Layer

↓

Controller

↓

Allocation Engine

↓

JSON Result

↓

UI
```

Controller hanya menerima request.

Seluruh logika perhitungan berada di Allocation Engine.

---

# 17. Struktur Project

```text
app/

Controllers/

Dashboard.php

BandwidthPlanner.php

Services/

Allocation/

EqualShare.php

WeightedAllocation.php

PriorityAllocation.php

MinimumGuarantee.php

Views/

dashboard/

planner/

Assets/

css/

js/
```

---

# 18. Allocation Engine

Setiap strategi dibuat sebagai class terpisah.

Contoh:

EqualShare.php

WeightedAllocation.php

PriorityAllocation.php

MinimumGuarantee.php

Semua class memiliki struktur yang sama:

* calculate()
* validate()
* getFields()

Dengan pendekatan ini penambahan strategi baru tidak mengubah struktur aplikasi.

---

# 19. Dashboard

Dashboard berisi:

## Hero Section

* Nama Platform
* Deskripsi singkat

---

## Available Tools

* Bandwidth Allocation Planner

---

## Coming Soon

* Subnet Calculator
* CIDR Calculator
* VLSM Calculator
* QoS Calculator
* Packet Loss Calculator
* Delay Calculator
* MTU Calculator
* Throughput Calculator
* Network Documentation Generator

---

## Footer

* Version
* Copyright
* Project Information

---

# 20. MVP Checklist

## Dashboard

* Landing Page
* Informasi Platform
* Daftar Tools

---

## Bandwidth Planner

* Input Bandwidth
* Unit Selection
* Dynamic Target
* Allocation Strategy
* Dynamic Parameter
* Calculate
* Allocation Table
* Pie Chart

---

## Frontend

* AJAX
* Responsive Layout
* Bootstrap Validation

---

## Backend

* Allocation Engine
* JSON Response
* Session

---

# 21. Roadmap

## Version 1.0

* Dashboard
* Bandwidth Allocation Planner
* Equal Share
* Weighted Allocation
* Priority Allocation
* Minimum Guarantee
* Chart Visualization

---

## Version 1.1

* LocalStorage History
* Template Allocation
* Compare Strategy

---

## Version 2.0

* Database
* Save Scenario
* Capacity Planning
* Router Configuration Generator
* Monitoring Integration

---

# 22. Future Vision

Bandwidth Allocation Planner hanyalah langkah pertama.

Platform ini dirancang agar dapat berkembang menjadi pusat berbagai utilitas jaringan yang memiliki tampilan, pengalaman pengguna, dan arsitektur yang konsisten sehingga memudahkan proses pengembangan maupun penggunaan oleh Network Engineer dan praktisi TI lainnya.
