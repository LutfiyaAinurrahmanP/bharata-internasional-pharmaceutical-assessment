# BIP-ERP (Mini-Microservices System)

Sistem mini-microservices sederhana untuk skenario inventory dan order. Dibangun dengan menggunakan arsitektur microservices modern yang terdiri dari Frontend, API Gateway, Product Service, dan Order Service.

## Arsitektur

- **Frontend (Port 3000):** Next.js (React + TypeScript) + Tailwind CSS
- **API Gateway (Port 8000):** Go (Fiber) - Menghandle routing dan meneruskan request ke service terkait
- **Product Service (Port 8001):** Go (Fiber) + MongoDB - Manajemen CRUD produk
- **Order Service (Port 8002):** Go (Fiber) + MongoDB - Manajemen pembuatan pesanan dan pengurangan stok lintas service

## Prasyarat

Pastikan komputer Anda sudah terpasang:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Cara Menjalankan

Proyek ini dirancang agar dapat berjalan lancar secara lintas *platform* (Windows, macOS, dan Linux) menggunakan Docker. Berikut adalah langkah-langkah untuk menjalankan aplikasi dari awal:

**1. Kloning Repositori**
Silakan *clone* repositori ini ke komputer lokal Anda dan masuk ke dalam direktorinya:
```bash
git clone https://github.com/LutfiyaAinurrahmanP/bharata-internasional-pharmaceutical-assessment.git
```

**2. Persiapan Environment Variables**
Buat file `.env` di direktori utama (root) proyek ini. Anda cukup menyalin dari file konfigurasi contoh yang telah disediakan:
```bash
cp .env.example .env
```

**3. Menjalankan Aplikasi dengan Docker Compose**
Jalankan seluruh arsitektur (termasuk database MongoDB, API Gateway, dan semua microservices) dengan satu perintah sederhana:
```bash
docker-compose up --build -d
```
*(Catatan: Pengguna Linux mungkin perlu menambahkan prefix `sudo` di depan perintah docker jika belum melakukan konfigurasi post-install docker).*

Setelah semua container berhasil di-*build* dan berjalan (biasanya memakan waktu beberapa detik hingga beberapa menit tergantung koneksi internet), Anda dapat mengakses aplikasi melalui:
- **Frontend (Web UI):** [http://localhost:3000](http://localhost:3000)
- **API Gateway:** [http://localhost:8000](http://localhost:8000)

Untuk mematikan seluruh aplikasi dan container, jalankan:
```bash
docker-compose down
```

## Daftar Endpoint (API Gateway)

Semua request dari klien (seperti Frontend atau Postman) harus diarahkan ke API Gateway (Port 8000), yang kemudian akan meneruskannya secara transparan ke service terkait.

### Product Service Endpoints
| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/products` | Membuat produk baru |
| `GET` | `/products` | Mengambil daftar semua produk |
| `GET` | `/products/:id` | Mengambil detail sebuah produk berdasarkan ID |
| `PUT` | `/products/:id` | Memperbarui data produk (termasuk stok) |
| `DELETE` | `/products/:id` | Menghapus produk (ini otomatis memicu *cascade delete* pada data order terkait) |

### Order Service Endpoints
| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/orders` | Membuat pesanan baru dan mengurangi stok produk |
| `GET` | `/orders` | Mengambil daftar semua pesanan |

## Contoh Request (cURL)

**1. Membuat Produk Baru**
```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Gaming X", "price": 15000000, "stock": 10}'
```

**2. Mendapatkan Semua Produk**
```bash
curl -X GET http://localhost:8000/products
```

**3. Membuat Pesanan (Mengurangi stok otomatis)**
```bash
# Pastikan productId diganti dengan ID produk yang valid dari hasil GET di atas
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "65b...123", "quantity": 2}'
```

---

## Jawaban Pertanyaan Arsitektur (Take-Home Test)

**1. Kenapa kamu pilih desain collection MongoDB seperti itu? (embed atau reference, alasannya)**
Saya menggunakan pendekatan **Reference** (menyimpan `productId` di dalam collection `orders` di database *Order Service*, tanpa menyalin seluruh struktur objek produk) dibandingkan *Embed*. 
Alasannya: Dalam arsitektur *microservices*, pola *Database-per-Service* mengharuskan setiap layanan memiliki otoritas penuh atas datanya sendiri. *Product Service* adalah pemilik sejati entitas produk. Jika saya meng-*embed* seluruh objek produk ke dalam pesanan, maka akan terjadi duplikasi data. Apabila nama atau harga produk berubah di masa depan, kita akan kesulitan mensinkronisasikan perubahan tersebut di seluruh riwayat pesanan (inkonsistensi data). Dengan pola *reference*, *Frontend* bisa melakukan perakitan (*join*) data secara mandiri saat me-*render* tampilan pesanan.

**2. Apa kelemahan cara order memanggil product service di solusimu? Kalau punya waktu lebih, kamu perbaiki bagaimana?**
Kelemahan utama dari pemanggilan sinkron (Synchronous HTTP Call) antara *Order Service* dan *Product Service* ini adalah risiko kegagalan di tengah jalan (*Partial Failure*). Jika stok produk sukses dikurangi di *Product Service*, namun tiba-tiba *Order Service* *crash* sebelum sempat menyimpan dokumen pesanan ke MongoDB, maka data akan menjadi tidak konsisten (stok berkurang namun tidak ada jejak pesanan).
Jika memiliki waktu lebih, saya akan menerapkan **Saga Pattern** dengan **Message Broker** (seperti RabbitMQ atau Apache Kafka) untuk komunikasi asinkron. Alternatif lain yang cukup umum digunakan adalah menerapkan mekanisme **Compensating Transaction** di mana *Order Service* wajib mengirim HTTP request pembatalan (*rollback*) ke *Product Service* untuk mengembalikan jumlah stok apabila proses penyimpanan ke *database order* mengalami *error*.

**3. Kalau jumlah service ini bertambah banyak ke depan, apa yang akan kamu siapkan di level arsitektur agar tetap rapi dan mudah dikelola?**
Jika jumlah *service* terus bertambah, komunikasi HTTP *Point-to-Point* akan membentuk "jaring laba-laba" (Spaghetti Architecture) yang rapuh. Saya akan menyiapkan:
- **Event-Driven Architecture (Message Broker):** Menggunakan Kafka/RabbitMQ agar layanan bisa berkomunikasi tanpa keterikatan yang kaku (*Loosely Coupled*).
- **Service Mesh & Discovery:** Mengimplementasikan Consul atau Istio agar *service* bisa menemukan letak (IP/Port) layanan lainnya secara dinamis tanpa perlu me-*hardcode* URL antar *service*.
- **Distributed Tracing & Centralized Logging:** Menambahkan Jaeger dan stack ELK/EFK untuk mempermudah pelacakan (*tracing*) jejak *error* dari sebuah *request* yang mengalir melewati belasan microservice.
- **Circuit Breaker:** Menambahkan *library* sirkuit pemutus (seperti Hystrix/Resilience4j) untuk mencegah efek domino (*Cascading Failure*) yang mematikan seluruh sistem apabila hanya ada satu *service* yang sedang tumbang.

---

## Cara Menjalankan Unit Test

Proyek ini menyertakan Unit Test untuk memastikan logika bisnis berjalan dengan benar tanpa harus bergantung pada *database* asli (menggunakan pola *Mocking*). 

Karena tes ini ditulis murni menggunakan ekosistem Go, cara menjalankannya **100% identik di semua sistem operasi (Windows, macOS, maupun Linux)**. Anda cukup membuka Terminal / Command Prompt / PowerShell, lalu mengeksekusi perintah bawaan Go:

**1. Menguji Product Service:**
```bash
cd product-service
go test ./... -v
```

**2. Menguji Order Service:**
```bash
cd order-service
go test ./... -v
```

*(Catatan: Pastikan Anda telah menginstal [Go](https://go.dev/dl/) di komputer lokal Anda. Jika Anda tidak ingin menginstal Go, Anda juga dapat mengujinya melalui Docker dengan perintah: `docker-compose run --rm product-service go test ./... -v`)*
