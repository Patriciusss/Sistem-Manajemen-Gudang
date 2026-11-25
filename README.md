# Warehouse

Sistem manajemen gudang berbasis web. Satu tempat untuk melihat isi rak, mengatur barang masuk dan keluar, memesan ulang ke pemasok, dan memastikan tidak ada stok yang diam diam habis.

Dibuat untuk Tugas Final Praktikum Pemrograman Web 2026, Individual Project 6: Manajemen Gudang.

## Daftar Isi

1. Tentang Project
2. Fitur Utama
3. Teknologi
4. Struktur Folder
5. Persyaratan Sistem
6. Instalasi
7. Environment Variables
8. Database
9. Data Awal dan Akun Uji
10. Panduan Penggunaan
11. Alur Sistem
12. Keamanan
13. Troubleshooting
14. Pembuat

## Tentang Project

Gudang yang rapi butuh jawaban cepat atas tiga pertanyaan: berapa stok sekarang, siapa yang menyetujui perubahannya, dan kapan barang pesanan tiba. Warehouse menjawab ketiganya dalam satu aplikasi dengan empat peran: Admin, Warehouse Manager, Staff Gudang, dan Supplier.

Aturan stok dijaga langsung oleh aplikasi dan database, bukan oleh ingatan manusia. Stok hanya bertambah ketika barang masuk disetujui Manager, dan hanya berkurang ketika barang keluar ditandai Shipped.

## Fitur Utama

### Semua pengguna

Masuk dengan email dan kata sandi, lalu langsung diarahkan ke dashboard sesuai peran. Tampilan kaca bertema terang, responsif dari layar HP sampai desktop.

### Admin

Menyetujui atau menolak pendaftaran Supplier baru. Mengelola produk dan kategori, mengelola daftar pengguna, serta memantau total produk, jumlah transaksi bulan ini, nilai inventori, dan daftar produk berstatus Severe atau Out of Stock.

### Warehouse Manager

Mengelola produk dan kategori. Menyetujui atau menolak transaksi barang masuk dan keluar, dengan alasan wajib saat menolak. Membuat Restock Order ke Supplier, mengikuti perjalanannya, lalu memvalidasi hasil pemeriksaan fisik barang.

### Staff Gudang

Mencatat transaksi barang masuk dan keluar lewat formulir cepat, melihat transaksi hari ini, memeriksa fisik barang kiriman Supplier, dan menandai barang keluar sebagai Shipped.

### Supplier

Mendaftar sendiri lewat web, lalu menunggu persetujuan Admin. Setelah disetujui, Supplier mengonfirmasi atau menolak pesanan (penolakan wajib beralasan), mengubah status menjadi In Transit saat barang berangkat, dan melihat riwayat pengiriman ke gudang.

### Modul

| Modul | Isi |
| --- | --- |
| Produk | Daftar dengan pencarian nama atau SKU, filter kategori dan status stok, pengurutan, halaman bernomor, halaman detail dengan riwayat transaksi, tambah, ubah, hapus, dan unggah gambar |
| Kategori | Tambah, ubah, hapus. Nama unik, dan kategori yang masih berisi produk tidak bisa dihapus |
| Transaksi | Tab barang masuk dan barang keluar, filter, lencana status, halaman detail, ubah dan hapus selama Pending |
| Restock | Daftar PO dengan garis waktu progres, formulir PO baru, tombol konfirmasi Supplier |
| Supplier | Peninjauan pendaftar berstatus Pending |
| Pengguna | Daftar akun yang dapat dilihat Admin |

### Lencana status stok

Status dihitung otomatis dari jumlah stok dan batas yang diatur pada tiap produk.

| Warna | Status | Kondisi |
| --- | --- | --- |
| Abu abu | Out of Stock | Stok sama dengan 0 |
| Merah | Severe | Stok kurang dari atau sama dengan stok minimum |
| Kuning | Low | Stok kurang dari atau sama dengan batas Low |
| Hijau | Normal | Stok di atas batas Low |

### Aturan emas stok

Stok bertambah hanya saat Incoming Transaction disetujui Manager. Stok berkurang hanya saat Outgoing Transaction ditandai Shipped oleh Staff. Perubahan stok dan perubahan status terjadi dalam satu proses transaksional.

## Teknologi

| Teknologi | Penggunaan |
| --- | --- |
| Next.js (App Router) | Framework web, Server Components, Server Actions, dan Route Handlers |
| React | Antarmuka interaktif |
| Tailwind CSS | Styling responsif dengan gaya glassmorphism |
| PostgreSQL | Penyimpanan seluruh data |
| pg | Koneksi ke PostgreSQL dengan Raw SQL, tanpa ORM |
| bcryptjs | Hash dan pemeriksaan kata sandi |

Semua ikon digambar sebagai SVG di dalam project, tanpa library ikon atau animasi tambahan. Bahasa pemrograman adalah JavaScript (JSX), bukan TypeScript.

## Struktur Folder

```text
src/
├── app/
│   ├── page.jsx                    landing page
│   ├── layout.js                   layout utama dan font
│   ├── globals.css                 token warna dan utilitas kaca
│   ├── (auth)/                     login dan register
│   ├── (dashboard)/[role]/         dashboard, produk, kategori,
│   │                               transaksi, restock, supplier, users
│   └── api/                        Route Handlers
├── actions/                        Server Actions
├── components/
│   ├── auth/                       kartu dan pesan untuk login dan register
│   ├── dashboard/                  empat dashboard per peran
│   ├── layout/                     navigasi dashboard
│   ├── products/ transactions/
│   │   restock/ categories/        formulir dan tombol aksi per modul
│   └── ui/                         komponen dasar (Icon, Modal, Timeline, dan lain lain)
├── database/
│   └── database.sql                skema dan data awal
├── lib/                            koneksi pg, sesi, query, validasi
└── middleware.js                   penjaga rute awal
```

### Route API

| Path | Fungsi |
| --- | --- |
| /api/login | Memeriksa kredensial dan membuat sesi |
| /api/register | Mendaftarkan Supplier baru berstatus Pending |
| /api/logout | Menghapus sesi |
| /api/products | Data produk |
| /api/categories | Data kategori |
| /api/transactions | Data transaksi |
| /api/restock-orders | Data Restock Order |
| /api/suppliers | Peninjauan Supplier |
| /api/upload | Unggah gambar produk atau kategori (Admin dan Manager, JPEG, PNG, atau WebP, maksimal 2 MB) |

## Persyaratan Sistem

Node.js versi terbaru yang didukung Next.js, npm, PostgreSQL, pgAdmin atau psql untuk menjalankan file SQL, dan browser modern.

## Instalasi

1. Pasang dependensi.

   ```bash
   npm install
   ```

2. Buat database kosong di PostgreSQL, misalnya bernama `warehouse`, lalu jalankan seluruh isi `src/database/database.sql` lewat Query Tool di pgAdmin.

3. Salin `.env.example` menjadi `.env.local`, lalu isi koneksi database.

   ```dotenv
   DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/warehouse
   ```

   Jika kata sandi memuat karakter khusus seperti @, ubah dengan URL encoding (@ menjadi %40).

4. Jalankan aplikasi.

   ```bash
   npm run dev
   ```

   Buka http://localhost:3000.

Setiap kali `.env.local` diubah, hentikan server dan jalankan ulang.

## Environment Variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| DATABASE_URL | Ya | URL koneksi PostgreSQL |

Simpan nilai lokal di `.env.local`. File ini tidak boleh ikut di commit.

## Database

Skema ada di `src/database/database.sql`. Ringkasan tabel:

| Tabel | Fungsi |
| --- | --- |
| users | Akun semua peran, dengan role dan status (Pending, Approved, Rejected) |
| sessions | Hash token sesi dan waktu kedaluwarsa |
| categories | Kategori produk dengan nama unik |
| products | SKU unik, harga, stok, batas minimum dan Low, satuan, lokasi rak, gambar |
| restock_orders | PO dengan nomor otomatis format PO dan empat digit, status, dan catatan status |
| restock_order_items | Produk dan jumlah pada tiap PO |
| transactions | Transaksi masuk (IN) dan keluar (OUT) dengan nomor otomatis format TRX dan empat digit |
| transaction_items | Produk dan jumlah pada tiap transaksi |

Beberapa aturan dijaga langsung oleh database lewat constraint:

1. Stok tidak boleh negatif, dan batas Low harus lebih besar dari stok minimum.
2. Kategori yang masih punya produk tidak bisa dihapus.
3. Penolakan (Rejected atau Returned) wajib memuat alasan.
4. Status Shipped hanya berlaku untuk transaksi keluar.
5. Satu PO hanya bisa dipakai satu Incoming Transaction yang belum ditolak.

## Data Awal dan Akun Uji

Menjalankan `database.sql` sekaligus mengisi akun, kategori, dan produk contoh. Semua akun memakai kata sandi `password123` (disimpan sebagai hash bcrypt).

| Email | Peran | Status |
| --- | --- | --- |
| admin@warehouse.com | Admin | Approved |
| manager@warehouse.com | Warehouse Manager | Approved |
| staff@warehouse.com | Staff Gudang | Approved |
| supplier@warehouse.com | Supplier | Approved |
| pending@warehouse.com | Supplier | Pending |

Akun ini hanya untuk pengembangan dan pengujian. Akun Admin, Manager, dan Staff dibuat lewat data awal SQL, tidak ada fitur tambah akun untuk ketiganya. Ingin mencoba jalur pemasok baru? Daftar lewat halaman Register, lalu masuk sebagai Admin dan setujui akunnya.

## Panduan Penggunaan

### Supplier baru

1. Buka halaman Register dan isi nama, email, serta kata sandi minimal 6 karakter.
2. Tunggu Admin menyetujui akun. Selama Pending atau Rejected, login menampilkan pesan yang menjelaskan alasannya.
3. Setelah Approved, masuk dan buka menu Restock untuk melihat pesanan.

### Admin

1. Buka menu Suppliers, lalu setujui atau tolak pendaftar.
2. Kelola produk dan kategori lewat menu masing masing. SKU tidak bisa diubah setelah dibuat.
3. Pantau ringkasan dan peringatan stok di dashboard.

### Manager

1. Buka Transactions untuk meninjau transaksi Pending, lalu setujui atau tolak (alasan wajib saat menolak).
2. Buka Restock lalu buat PO baru untuk Supplier dari produk yang stoknya menipis.
3. Setelah barang diperiksa, setujui Incoming Transaction agar stok bertambah dan PO menjadi Received.

### Staff

1. Buat Outgoing atau Incoming Transaction dari menu Transactions. Jumlah barang keluar tidak boleh melebihi stok.
2. Untuk barang dari PO, pilih nomor PO sehingga produk dan jumlah terisi otomatis.
3. Setelah barang keluar disetujui dan dipacking, tandai Shipped.

## Alur Sistem

### Barang masuk (Restock Order)

```text
Pending → Confirmed → In Transit → Inspecting → Received
   ↓
Rejected                           Inspecting → Returned
```

1. Manager membuat PO, status Pending.
2. Supplier mengonfirmasi atau menolak (alasan wajib).
3. Supplier mengubah status menjadi In Transit saat barang berangkat.
4. Barang tiba dan diperiksa Staff, status Inspecting.
5. Barang sesuai: Staff membuat Incoming Transaction, Manager menyetujui, PO menjadi Received, stok bertambah.
6. Barang rusak atau tidak sesuai: Manager menolak dengan alasan, PO menjadi Returned, stok tidak berubah.

### Barang keluar

```text
Pending → Approved → Shipped
   ↓
Rejected
```

Staff mengajukan, Manager menyetujui atau menolak, lalu Staff menandai Shipped. Stok berkurang saat Shipped.

## Keamanan

1. Kata sandi di hash dengan bcrypt, tidak disimpan sebagai teks biasa.
2. Sesi memakai token acak di cookie httpOnly. Database hanya menyimpan hash token, bukan token aslinya.
3. Setiap halaman dan endpoint API memeriksa peran. Alamat milik peran lain akan dialihkan ke dashboard sendiri.
4. Semua query memakai parameter, sehingga terlindung dari SQL Injection.
5. Middleware hanya memeriksa keberadaan cookie, tanpa memanggil database.
6. Unggahan gambar dibatasi jenis dan ukurannya, dan hanya boleh dilakukan Admin atau Manager.

Untuk penggunaan produksi, gunakan HTTPS, rahasiakan kredensial database, dan siapkan backup.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Tidak bisa terhubung ke database | Pastikan PostgreSQL berjalan, database sudah dibuat, dan DATABASE_URL benar. Restart server setelah mengubah .env.local |
| Tabel tidak ditemukan | Jalankan database.sql pada database yang sama dengan yang tertulis di DATABASE_URL |
| Tidak bisa masuk | Gunakan akun uji dengan kata sandi password123. Akun Pending atau Rejected memang ditolak sampai Admin menyetujuinya |
| Gambar gagal diunggah | Pakai JPEG, PNG, atau WebP dengan ukuran maksimal 2 MB |
| Port 3000 sudah dipakai | Jalankan `npm run dev -- -p 3001` |

## Pembuat

Dikerjakan secara individu sebagai Tugas Final Praktikum Pemrograman Web 2026.