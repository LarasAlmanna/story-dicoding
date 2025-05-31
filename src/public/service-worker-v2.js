const CACHE_NAME = "dicoding-story-v1";
// Mendeteksi apakah aplikasi berjalan di Vercel atau tidak
const BASE_URL = self.location.hostname.includes('vercel.app') ? '' : '';

const urlsToCache = [
  "./", // Halaman utama
  "./index.html", // File index.html
  // !!! UPDATE PATH INI SESUAI DENGAN NAMA FILE HASIL BUNDLING VITE DI direktori dist/assets !!!
  "./assets/index-CeurROEt.css", // Path ke file CSS setelah build
  "./assets/index-CAJs2LgW.js", // Path ke file JS setelah build

  // Path ke file-file yang disalin dari src/public/ (jika ada di sana)
  "./manifest.json",
  "./favicon.png",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  // Path ke ikon peta Leaflet
  "./images/marker-icon-2x.png",
  "./images/marker-icon.png",
  "./images/marker-shadow.png"

  // Tambahkan path aset statis lain jika ada dan perlu dicache di app shell
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching app shell");
      // Instead of using addAll which fails if any item fails,
      // we'll add items one by one and log errors but continue
      const cachePromises = urlsToCache.map(url => {
        return cache.add(url).catch(err => {
          console.error(`Failed to cache ${url}: ${err.message}`);
        });
      });
      return Promise.all(cachePromises);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  try {
    // Hanya proses dan coba cache request dengan skema http atau https.
    // Untuk skema lain (seperti chrome-extension://, blob://, dll.),
    // biarkan browser menanganinya secara langsung tanpa intervensi service worker untuk caching.
    if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
      console.log(`Service Worker: Skipping request with non-http(s) protocol: ${event.request.url}`);
      // Mengembalikan undefined (atau tidak memanggil event.respondWith) akan membiarkan browser menangani request ini.
      return;
    }
  } catch (error) {
    console.error("Service Worker: Error parsing URL", error);
    return;
  }

  // Strategi Network Falling Back to Cache untuk API endpoint cerita
  // Sesuaikan URL endpoint jika berbeda
  if (requestUrl.pathname.includes("/v1/stories") && requestUrl.hostname === "story-api.dicoding.dev") {
    console.log("Service Worker: Handling API request for stories:", event.request.url);
    event.respondWith(
      fetch(event.request)
        .then(async (networkResponse) => {
          // Periksa apakah response dari network valid untuk di-cache.
          // Hanya cache response dengan status 200.
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            console.log("Service Worker: Not caching invalid API response:", event.request.url, networkResponse);
            return networkResponse; // Kembalikan respons network meskipun tidak valid untuk cache
          }

          // Clone response karena response adalah stream dan hanya bisa dikonsumsi sekali.
          const responseToCache = networkResponse.clone();

          // Buka cache dan simpan respons API
          caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Caching API response:", event.request.url);
            cache.put(event.request, responseToCache);
          });

          return networkResponse; // Kembalikan respons dari network
        })
        .catch(async (error) => {
          console.error("Service Worker: Fetch API failed, trying cache:", event.request.url, error);
          // Jika fetch gagal (misal karena offline), coba cari di cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log("Service Worker: Serving API response from cache:", event.request.url);
            return cachedResponse;
          }
          // Jika tidak ada di cache dan fetch gagal, lempar error
          console.log("Service Worker: API response not found in cache:", event.request.url);
          throw error; // Penting untuk melempar error agar promise ditolak jika tidak ada fallback.
        })
    );
    return; // Penting: hentikan pemrosesan lebih lanjut untuk request API ini
  }

  // Strategi Cache First (atau Network Falling Back to Cache) untuk http/https lainnya (aset statis, dll.)
  // Kode ini sudah ada dan akan menangani request yang bukan ke API endpoint cerita
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // console.log('Service Worker: Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // console.log('Service Worker: Fetching from network:', event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          // Periksa apakah response dari network valid untuk di-cache.
          // Hanya cache response dengan tipe 'basic' (dari origin yang sama) dan status 200.
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            // console.log('Service Worker: Not caching invalid response:', event.request.url, networkResponse);

            return networkResponse;
          }

          // Clone response karena response adalah stream dan hanya bisa dikonsumsi sekali.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // console.log('Service Worker: Caching new resource:', event.request.url);
            // Pastikan sekali lagi bahwa event.request.url adalah http/https sebelum put (sebagai tindakan pencegahan tambahan)
            // Meskipun seharusnya sudah difilter di atas.
            if (new URL(event.request.url).protocol === "http:" || new URL(event.request.url).protocol === "https:") {
              cache.put(event.request, responseToCache);
            } else {
              console.warn(`Service Worker: Prevented caching non-http(s) request at put stage: ${event.request.url}`);
            }
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error("Service Worker: Fetch failed for:", event.request.url, error);
          // Anda bisa mengembalikan halaman offline default di sini jika ada
          // misalnya: return caches.match('/offline.html');
          throw error; // Penting untuk melempar kembali error agar promise ditolak jika tidak ada fallback.
        });
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Memastikan service worker baru mengambil kontrol segera.
        return self.clients.claim();
      })
  );
});

// Push notification event listener
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received.", event.data);
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: "Dicoding Story",
      body: event.data.text() || "You have a new notification.",
      icon: "/icons/icon-192x192.png",
    };
  }

  const options = {
    body: notificationData.body || "New story available!",
    icon: notificationData.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.primaryKey || 1,
      url: notificationData.url || "/",
    },
    actions: [
      {
        action: "explore",
        title: "View Story",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/icon-72x72.png",
      },
    ],
    tag: notificationData.tag || "story-notification",
    renotify: typeof notificationData.renotify === "boolean" ? notificationData.renotify : true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || "Dicoding Story", options).catch((error) => {
      console.error("Service Worker: Error showing notification:", error);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click received.", event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  if (event.action === "explore" || !event.action) {
    // Tangani klik pada action "explore" atau badan notifikasi
    console.log(`Service Worker: Action '${event.action || "body click"}'. Opening URL:`, urlToOpen);
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            // Mencoba mencocokkan pathname untuk fleksibilitas URL
            if (new URL(client.url).pathname === new URL(urlToOpen, self.location.origin).pathname && "focus" in client) {
              console.log("Service Worker: Found existing client. Focusing:", client.url);
              return client.focus();
            }
          }
          if (clients.openWindow) {
            console.log("Service Worker: No existing client found. Opening new window:", urlToOpen);
            return clients.openWindow(urlToOpen);
          }
        })
        .catch((error) => {
          console.error("Service Worker: Error handling notification click:", error);
        })
    );
  } else if (event.action === "close") {
    console.log("Service Worker: 'close' action clicked. Notification closed.");
    // Tidak ada tindakan lebih lanjut untuk 'close'
  }
});
