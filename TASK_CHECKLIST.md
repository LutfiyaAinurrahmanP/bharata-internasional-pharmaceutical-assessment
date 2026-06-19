# 📝 Project Implementation Checklist: Mini-Microservices (BIP-ERP)

Dokumen ini berisi daftar tugas (*checklist*) langkah demi langkah untuk menyelesaikan *take-home test* pengembangan sistem *mini-microservices* yang terdiri dari Product Service, Order Service, API Gateway, dan Frontend.

## Phase 1: Inisialisasi Proyek & Infrastruktur Dasar
- [x] Inisialisasi Git Repository (`git init`).
- [x] Membuat struktur folder proyek dasar:
  - `product-service/`
  - `order-service/`
  - `api-gateway/`
  - `frontend/`
- [x] Membuat file `docker-compose.yml` untuk orkestrasi *service* dan MongoDB.
- [x] Menyiapkan struktur file `.env` agar tidak ada *hardcoded credential*.

## Phase 2: Product Service (:8001) - Go + Fiber
- [x] Inisialisasi modul Go (`go mod init product-service`).
- [x] Setup koneksi database ke MongoDB (Database: `product_db`, Collection: `products`).
- [x] Membuat Model/Schema `Product` (fields: `id`, `name`, `price`, `stock`).
- [x] Implementasi **Repository Layer** (Logika operasi CRUD ke MongoDB).
- [x] Implementasi **Service Layer** (Logika bisnis).
- [x] Implementasi **Handler Layer** (Menerima HTTP Request & validasi input).
- [x] Mendaftarkan Routes:
  - [x] `POST /products` (Buat produk)
  - [x] `GET /products` (List produk)
  - [x] `GET /products/:id` (Detail produk)
  - [x] `PUT /products/:id` (Update produk & update stok)
  - [x] `DELETE /products/:id` (Hapus produk)
- [x] Membuat `Dockerfile` untuk Product Service.

## Phase 3: Order Service (:8002) - Go + Fiber
- [x] Inisialisasi modul Go (`go mod init order-service`).
- [x] Setup koneksi database ke MongoDB (Database: `order_db`, Collection: `orders`).
- [x] Membuat Model/Schema `Order` (fields: `id`, `productId`, `quantity`, dll).
- [x] Implementasi komponen HTTP Client untuk menembak API Product Service.
- [x] Implementasi **Repository Layer** (Menyimpan data *order* ke MongoDB).
- [x] Implementasi **Service Layer** (Logika Validasi & Transaksi):
  - [x] Panggil Product Service untuk cek eksistensi produk.
  - [x] Jika produk tidak ada -> *Return error 404*.
  - [x] Panggil Product Service untuk cek stok.
  - [x] Jika stok kurang -> *Return error 400*.
  - [x] Panggil Product Service untuk kurangi stok.
  - [x] Simpan data Order ke database Order Service.
- [x] Implementasi **Handler Layer** (Menerima HTTP Request).
- [x] Mendaftarkan Routes:
  - [x] `POST /orders` (Buat order)
  - [x] `GET /orders` (List order)
- [x] Membuat `Dockerfile` untuk Order Service.

## Phase 4: API Gateway (:8000) - Go + Fiber
- [x] Inisialisasi modul Go (`go mod init api-gateway`).
- [x] Setup aplikasi Fiber.
- [x] Implementasi konfigurasi *Proxy / Forwarding* request (dilengkapi dengan CORS middleware).
- [x] Mendaftarkan Aturan Routing:
  - [x] Semua request `/products/*` diteruskan ke `http://product-service:8001`
  - [x] Semua request `/orders/*` diteruskan ke `http://order-service:8002`
- [x] Membuat `Dockerfile` untuk API Gateway.

## Phase 5: Frontend (:3000) - Next.js
- [ ] Inisialisasi proyek Next.js (`npx create-next-app@latest`).
- [ ] Konfigurasi *Base URL API* untuk selalu menunjuk ke API Gateway (`http://localhost:8000`).
- [ ] Pembuatan Halaman **Daftar Produk**:
  - [ ] Fecth data produk dari `GET /products`.
  - [ ] Tampilkan produk (nama, harga, stok) dengan antarmuka yang rapi.
- [ ] Pembuatan Halaman/Modal **Tambah Produk**:
  - [ ] Form input (nama, harga, stok).
  - [ ] Fungsionalitas *submit* ke `POST /products`.
- [ ] Pembuatan Halaman/Modal **Buat Pesanan (Order)**:
  - [ ] Input pilihan produk (dropdown) dan jumlah barang (*quantity*).
  - [ ] Fungsionalitas *submit* ke `POST /orders`.
  - [ ] *Error Handling UI*: Tampilkan notifikasi jika sukses, atau pesan *error* jika stok kurang/produk tidak ditemukan.
- [ ] Membuat `Dockerfile` untuk Frontend.

## Phase 6: Dokumentasi & Finalisasi (Sangat Penting)
- [ ] Uji coba sistem secara keseluruhan menjalankan `docker-compose up --build`.
- [ ] Uji skenario: Produk tidak ada, stok kurang, dan order sukses.
- [ ] Menulis jawaban untuk **3 Pertanyaan Arsitektur**:
  - [ ] 1. Alasan di balik desain *collection* MongoDB (embed vs reference).
  - [ ] 2. Kelemahan memanggil *product service* langsung dari *order service* dan usulan perbaikannya (misal: kompensasi transaksi, *message broker*).
  - [ ] 3. Persiapan arsitektur ke depan jika jumlah *service* bertambah banyak.
- [ ] Menyusun **README.md** yang komprehensif:
  - [ ] Cara menjalankan aplikasi (instruksi `docker-compose`).
  - [ ] Daftar endpoint lengkap.
  - [ ] Contoh *request* (cURL / Postman).
  - [ ] Jawaban 3 pertanyaan arsitektur.
- [ ] Pembersihan kode akhir (Pastikan tidak ada *password/secret key* yang *hardcoded* di source code).
