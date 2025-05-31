# Dicoding Story App

Aplikasi web untuk berbagi cerita dengan fitur lokasi dan foto.

## Fitur

- Menampilkan daftar cerita dari API
- Menambahkan cerita baru dengan foto dan lokasi
- Integrasi dengan peta untuk menampilkan lokasi cerita
- Desain responsif untuk perangkat mobile dan tablet
- Fitur aksesibilitas untuk pengguna dengan kebutuhan khusus
- Transisi halaman yang halus menggunakan View Transitions API

## Teknologi yang Digunakan

- HTML5, CSS3, JavaScript (ES6+)
- Vite sebagai build tool
- Leaflet.js untuk integrasi peta
- View Transitions API untuk transisi halaman
- Dicoding Story API sebagai sumber data

## Cara Menjalankan Aplikasi

1. Install dependensi dengan menjalankan:
   ```
   npm install
   ```
2. Jalankan aplikasi dalam mode development:
   ```
   npm run dev
   ```
3. Buka browser dan akses `http://localhost:5173`

## Struktur Proyek

```
dicoding-story-app/
├── src/
│   ├── public/
│   │   └── images/
│   ├── scripts/
│   │   ├── models/
│   │   │   └── story-model.js
│   │   ├── presenters/
│   │   │   └── story-presenter.js
│   │   ├── views/
│   │   │   ├── app.js
│   │   │   └── pages/
│   │   │       ├── home.js
│   │   │       ├── add-story.js
│   │   │       └── about.js
│   │   └── index.js
│   ├── styles/
│   │   ├── main.css
│   │   └── responsive.css
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Arsitektur

Aplikasi ini menggunakan pola Model-View-Presenter (MVP):

- **Model**: Menangani interaksi dengan API dan pengelolaan data
- **View**: Menangani rendering UI dan interaksi pengguna
- **Presenter**: Menghubungkan Model dan View, menangani logika bisnis

## Aksesibilitas

Aplikasi ini menerapkan beberapa fitur aksesibilitas:

- Skip to content link untuk pengguna keyboard
- ARIA labels dan roles untuk screen reader
- Elemen HTML semantik untuk struktur yang jelas
- Label yang terhubung dengan form control

## Lisensi

Proyek ini dibuat sebagai bagian dari kursus Pengembangan Front-End di Dicoding Academy.
