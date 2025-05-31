#!/bin/bash

# Build aplikasi
npm run build

# Salin service worker ke direktori dist
cp src/public/service-worker-v2.js dist/

# Salin manifest.json ke direktori dist
cp src/public/manifest.json dist/

# Pastikan folder images ada dan salin marker shadow
mkdir -p dist/images
cp src/public/images/marker-shadow.png dist/images/
cp src/public/images/marker-icon.png dist/images/
cp src/public/images/marker-icon-2x.png dist/images/

# Tambahkan file konfigurasi Vercel
cp vercel.json dist/
