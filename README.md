# 🎌 Otakudesu Unofficial API

API sederhana yang dibangun menggunakan **Node.js**, **Express**, dan **Cheerio** untuk melakukan *scraping* data dari situs streaming anime **Otakudesu**. API ini menyediakan informasi anime ongoing, anime tamat, jadwal rilis, detail anime, serta link streaming dan download.

> **Disclaimer:** Proyek ini hanya untuk tujuan edukasi. Harap gunakan dengan bijak dan jangan membebani server situs sumber secara berlebihan. Segala konten adalah hak cipta dari pemilik aslinya.

## 🛠️ Teknologi yang Digunakan

-   **Node.js** - Runtime environment.
-   **Express** - Framework web server.
-   **Axios** - HTTP Client untuk request HTML.
-   **Cheerio** - Parsing HTML (mirip jQuery).
-   **Fake-UserAgent** - Rotasi User-Agent agar tidak terdeteksi bot.
-   **CORS** - Mengizinkan akses dari domain lain.

## 🚀 Cara Install dan Menjalankan

1.  **Clone atau Download** repository ini.
2.  Buka terminal di folder project.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Jalankan server:
    ```bash
    node index.js
    ```
5.  Server akan berjalan di `http://localhost:3000`.

## 📚 Dokumentasi Endpoint

### 1. 🔥 Anime On-Going
Mendapatkan daftar anime yang sedang tayang (terbaru).

-   **URL:** `/api/ongoing` atau `/api/ongoing/:page`
-   **Method:** `GET`
-   **Contoh:**
    -   `http://localhost:3000/api/ongoing` (Halaman 1)
    -   `http://localhost:3000/api/ongoing/2` (Halaman 2)

### 2. ✅ Anime Tamat (Complete)
Mendapatkan daftar anime yang sudah selesai tayang.

-   **URL:** `/api/complete` atau `/api/complete/:page`
-   **Method:** `GET`
-   **Contoh:**
    -   `http://localhost:3000/api/complete`

### 3. 📅 Jadwal Rilis
Mendapatkan jadwal tayang anime per hari (Senin - Minggu).

-   **URL:** `/api/schedule`
-   **Method:** `GET`

### 4. 📖 Detail Anime
Mendapatkan informasi lengkap tentang anime (Sinopsis, Genre, Skor, List Episode).

-   **URL:** `/api/anime/:slug`
-   **Method:** `GET`
-   **Contoh:**
    -   `http://localhost:3000/api/anime/arne-jikenbo-sub-indo`
    -   *(Slug diambil dari properti `endpoint` pada response Ongoing/Complete/Schedule)*

### 5. 📺 Detail Episode (Stream & Download)
Mendapatkan link streaming (iframe) dan link download (MP4/MKV).

-   **URL:** `/api/episode/:slug`
-   **Method:** `GET`
-   **Contoh:**
    -   `http://localhost:3000/api/episode/arnj-episode-1-sub-indo`
    -   *(Slug diambil dari properti `episode_list` pada response Detail Anime)*

---

## 📝 Catatan Pengembangan

Jika situs target (Otakudesu) mengubah struktur HTML-nya, API ini mungkin perlu disesuaikan kembali selector `cheerio`-nya pada file `index.js`.