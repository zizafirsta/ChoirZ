# ChoirZ - Integrated Choir Operating System

**ChoirZ** adalah sistem informasi operasional yang dirancang khusus untuk mendigitalisasi proses inti dalam kegiatan paduan suara. Berfokus pada efisiensi latihan dan manajemen anggota, platform ini mengintegrasikan distribusi materi vokal secara kontekstual berdasarkan tipe suara (SATB).

**URL Aplikasi:** [https://choir-z.vercel.app/about](https://choir-z.vercel.app/about)

## Fitur Utama

* **Company Profile (Landing Page):** Halaman representatif yang menjelaskan visi, misi, dan statistik pencapaian ChoirZ.
* **Contextual Auth System:** Sistem registrasi dan login yang terintegrasi dengan Supabase Auth dan database PostgreSQL.
* **Role-Based Access Control (RBAC):**
    * **Admin:** Memiliki akses penuh terhadap operasional sistem termasuk kendali dashboard (CRUD).
    * **Member:** Mengakses materi latihan pada modul learning dan dasbor personal.
* **Smart Material Distribution:** Pendistribusian materi vokal otomatis yang difilter berdasarkan kategori suara anggota (Soprano, Alto, Tenor, Bass).

## Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript & JavaScript
* **Styling:** Tailwind CSS
* **Backend & Database:** Supabase (Auth & PostgreSQL)
* **Deployment:** Vercel

## Struktur Proyek

```text
├── app/
│   ├── about/          # Landing Page (Company Profile)
│   ├── admin/          # Dashboard Admin (CRUD Operations)
│   ├── member/         # Dashboard Member & Learning Module
│   ├── login/          # Halaman Autentikasi Login
│   ├── register/       # Halaman Registrasi Anggota Baru
│   ├── globals.css     # Konfigurasi Styling Global
│   └── layout.tsx      # Root Layout Aplikasi
├── lib/
│   └── supabaseClient.js # Konfigurasi Koneksi Supabase
├── public/             # Asset Gambar (Logo, Choir Photos)
├── .env.local          # Environment Variables (Supabase Keys)
```

## Alur Pengguna (User Journey)

### 1. Registrasi & Onboarding
Calon anggota mengakses halaman **About** untuk memahami profil organisasi. Pengguna kemudian melakukan registrasi dengan menginput data: **Nama Lengkap**, **Tipe Suara (SATB)**, **Email**, dan **Password**. Data ini secara otomatis tersimpan ke dalam tabel profil database Supabase.

### 2. Autentikasi Login
Aplikasi membedakan akses secara otomatis berdasarkan kredensial yang dimasukkan:

* **Administrator Access:**
    * **Email:** ziza@choirz.com
    * **Password:** c1h2o3i4r5@
    * **Fungsi:** Mengelola data anggota, mengunggah materi lagu, dan melakukan operasi CRUD pada dashboard admin.

* **Member Access:**
    * **Email:** Menggunakan email personal (contoh: nama@choirz.com).
    * **Fungsi:** Diarahkan ke dashboard member untuk melihat fitur latihan dan mengakses modul learning sesuai tipe suara masing-masing.

## Instalasi Lokal

1. Clone repository:
   git clone [https://github.com/username/choirz.git](https://github.com/username/choirz.git)

2. Install dependencies:
   npm install

3. Konfigurasi Environment Variables di .env.local:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Jalankan aplikasi:
   npm run dev

© 2026 ChoirZ Project — Crafted with Passion by Ziza
