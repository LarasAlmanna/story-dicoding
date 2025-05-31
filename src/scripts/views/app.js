import Home from "./pages/home/home-page.js";
import AddStory from "./pages/add-story/addStory-page.js";
import Login from "./pages/login/login-page.js";
import Logout from "./pages/logout/logout-page.js";
import About from "./pages/about/about-page.js";
import BookmarkPage from "./pages/bookmark/bookmark-page.js";
import StoryDetailPage from "./pages/story-detail/story-detail-page.js";
import StoryModel from "../models/story-model.js";
import CONFIG from "../config.js";

const API_ENDPOINT = CONFIG.BASE_URL;

class App {
  constructor(content) {
    this._content = content;
    this._accessToken = sessionStorage.getItem("accessToken");
    this._drawerButton = document.querySelector("#drawer-button");
    this._navigationDrawer = document.querySelector("#navigation-drawer");
    this._storyModel = new StoryModel();
    this._isSubscribed = false;

    // Expose app instance to window
    window.app = this;

    console.log("App initialized with accessToken:", this._accessToken ? "Present" : "Not present");

    this._initDrawer();
    this._updateNavigation();
    this._initOfflineSync();
    this._initPushNotification();
    this._checkSubscriptionStatus();
  }

  _initDrawer() {
    this._drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this._navigationDrawer.classList.toggle("open");
      this._drawerButton.setAttribute("aria-expanded", this._navigationDrawer.classList.contains("open"));
      document.body.classList.toggle("sidebar-open", this._navigationDrawer.classList.contains("open"));
    });

    document.addEventListener("click", (event) => {
      if (!this._navigationDrawer.contains(event.target) && !this._drawerButton.contains(event.target)) {
        this._navigationDrawer.classList.remove("open");
        this._drawerButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("sidebar-open");
      }
    });
  }

  async _initOfflineSync() {
    // Check online status
    window.addEventListener("online", async () => {
      console.log("App is online, syncing offline stories...");
      try {
        await this._storyModel.syncOfflineStories();
        // Refresh the current page to show synced stories
        this.renderPage();
      } catch (error) {
        console.error("Failed to sync offline stories:", error);
      }
    });

    // Initial sync if online
    if (navigator.onLine) {
      try {
        await this._storyModel.syncOfflineStories();
      } catch (error) {
        console.error("Failed to sync offline stories:", error);
      }
    }
  }

  async _initPushNotification() {
    if (!("serviceWorker" in navigator)) {
      console.log("This browser does not support service workers");
      return;
    }

    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    try {
      // Request notification permission first
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        console.log("Notification permission status:", permission);
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker ready:", registration);

      if (Notification.permission === "granted") {
        console.log("Notification permission granted");
        await this._checkSubscriptionStatus();
      } else {
        console.log("Notification permission not granted:", Notification.permission);
      }
    } catch (error) {
      console.error("Error initializing push notification:", error);
    }
  }

  async _checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      this._isSubscribed = !!subscription;
      console.log("Subscription status:", this._isSubscribed ? "Subscribed" : "Not subscribed");
      this._updateNavigation();
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      this._isSubscribed = false;
      this._updateNavigation();
    }
  }

  async _subscribePushNotification() {
    try {
      // Check notification permission first
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied");
          this._showNotification("Izin Diperlukan", "Anda perlu mengizinkan notifikasi untuk berlangganan. Silakan refresh halaman dan coba lagi.");
          return;
        }
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker ready for subscription");

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed:", existingSubscription);
        this._isSubscribed = true;
        this._updateNavigation();
        this._showNotification("Informasi", "Anda sudah berlangganan notifikasi");
        return;
      }

      // Convert VAPID public key to Uint8Array
      const vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
      const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log("Push subscription successful:", subscription);

      // Send subscription to server
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        console.log("User not logged in, skipping push subscription");
        this._showNotification("Error", "Anda harus login terlebih dahulu untuk berlangganan notifikasi");
        return;
      }

      const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh")))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth")))),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send push subscription to server");
      }

      const result = await response.json();
      if (!result.error) {
        this._isSubscribed = true;
        this._updateNavigation();

        // Show success notification
        const notification = new Notification("Berhasil Berlangganan", {
          body: "Anda telah berhasil berlangganan notifikasi. Anda akan menerima notifikasi ketika ada story baru.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: "subscription-success",
          vibrate: [100, 50, 100],
          requireInteraction: true,
          actions: [
            {
              action: "close",
              title: "Tutup",
              icon: "/icons/icon-192x192.png",
            },
          ],
        });

        // Handle notification click
        notification.addEventListener("click", (event) => {
          event.preventDefault();
          notification.close();
          window.focus();
        });

        // Auto close after 10 seconds
        setTimeout(() => {
          if (notification.requireInteraction) {
            notification.close();
          }
        }, 10000);
      } else {
        throw new Error(result.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      this._showNotification("Gagal Berlangganan", "Maaf, terjadi kesalahan saat berlangganan notifikasi. Silakan coba lagi nanti.");
      this._isSubscribed = false;
      this._updateNavigation();
    }
  }

  async _unsubscribePushNotification() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log("No active subscription found");
        this._showNotification("Informasi", "Anda belum berlangganan notifikasi");
        return;
      }

      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        console.log("User not logged in, skipping push unsubscription");
        this._showNotification("Error", "Anda harus login terlebih dahulu untuk mengelola notifikasi");
        return;
      }

      const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe from push notifications");
      }

      const result = await response.json();
      if (!result.error) {
        await subscription.unsubscribe();
        this._isSubscribed = false;
        this._updateNavigation();
        this._showNotification("Berhasil Berhenti Berlangganan", "Anda telah berhasil berhenti berlangganan notifikasi. Anda tidak akan lagi menerima notifikasi story baru.");
      } else {
        throw new Error(result.message || "Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      this._showNotification("Gagal Berhenti Berlangganan", "Maaf, terjadi kesalahan saat berhenti berlangganan notifikasi. Silakan coba lagi nanti.");
      this._isSubscribed = true;
      this._updateNavigation();
    }
  }

  _showNotification(title, message) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "story-notification",
        vibrate: [100, 50, 100],
        requireInteraction: true, // Notification will stay until user interacts
        actions: [
          {
            action: "close",
            title: "Tutup",
            icon: "/icons/icon-192x192.png",
          },
        ],
        data: {
          url: "/",
        },
      });

      // Handle notification click
      notification.addEventListener("click", (event) => {
        event.preventDefault();
        notification.close();
        window.focus();
        window.location.hash = "#/";
      });

      // Handle notification close action
      notification.addEventListener("close", () => {
        console.log("Notification closed");
      });

      // Auto close after 10 seconds if not interacted
      setTimeout(() => {
        if (notification.requireInteraction) {
          notification.close();
        }
      }, 10000);
    }
  }

  _updateNavigation() {
    const navList = document.querySelector(".nav-list");
    const isLoggedIn = !!this._accessToken;

    console.log("Updating navigation, isLoggedIn:", isLoggedIn);

    if (isLoggedIn) {
      navList.innerHTML = `
        <li><a href="#/">Home</a></li>
        <li><a href="#/add-story">Add Story</a></li>
        <li><a href="#/bookmark">Bookmark</a></li>
        <li><a href="#/about">About</a></li>
        <li><button id="notificationButton" class="notification-button" data-subscribed="${this._isSubscribed}">
          ${this._isSubscribed ? "Unsubscribe Notifications" : "Subscribe Notifications"}
        </button></li>
        <li><a href="#" id="logoutButton">Logout</a></li>
      `;

      // Add event listener for notification button
      const notificationButton = document.querySelector("#notificationButton");
      if (notificationButton) {
        notificationButton.addEventListener("click", async (e) => {
          e.preventDefault();
          if (this._isSubscribed) {
            await this._unsubscribePushNotification();
          } else {
            await this._subscribePushNotification();
          }
          // Update button state
          notificationButton.setAttribute("data-subscribed", this._isSubscribed);
          notificationButton.textContent = this._isSubscribed ? "Unsubscribe Notifications" : "Subscribe Notifications";
        });
      }

      // Add event listener for logout button
      const logoutButton = document.querySelector("#logoutButton");
      if (logoutButton) {
        console.log("Adding logout button event listener");
        logoutButton.addEventListener("click", (e) => {
          e.preventDefault();
          this._logout();
        });
      }
    } else {
      navList.innerHTML = `
        <li><a href="#/">Home</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/login">Login</a></li>
      `;
    }

    // Update mobile navigation
    const mobileNavList = document.querySelector("#navigation-drawer .nav-list");
    if (mobileNavList) {
      mobileNavList.innerHTML = navList.innerHTML;

      // Re-add event listeners for mobile buttons if logged in
      if (isLoggedIn) {
        const mobileNotificationButton = mobileNavList.querySelector("#notificationButton");
        if (mobileNotificationButton) {
          mobileNotificationButton.addEventListener("click", async (e) => {
            e.preventDefault();
            if (this._isSubscribed) {
              await this._unsubscribePushNotification();
            } else {
              await this._subscribePushNotification();
            }
            // Update button state
            mobileNotificationButton.setAttribute("data-subscribed", this._isSubscribed);
            mobileNotificationButton.textContent = this._isSubscribed ? "Unsubscribe Notifications" : "Subscribe Notifications";
          });
        }

        const mobileLogoutButton = mobileNavList.querySelector("#logoutButton");
        if (mobileLogoutButton) {
          mobileLogoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            this._logout();
          });
        }
      }
    }
  }

  _logout() {
    console.log("Logging out user");
    sessionStorage.removeItem("accessToken");
    this._accessToken = null;
    this._updateNavigation();
    window.location.hash = "#/logout";
  }

  // Add method to handle story creation notification
  async _handleStoryNotification(storyDescription) {
    if (Notification.permission === "granted" && this._isSubscribed) {
      this._showNotification("Story berhasil dibuat", `Anda telah membuat story baru dengan deskripsi: ${storyDescription}`);
    }
  }

  // Helper function to convert base64 string to Uint8Array
  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async renderPage() {
    const hash = window.location.hash;
    const [path, query] = hash.slice(1).split("?");
    const queryParams = new URLSearchParams(query || "");

    console.log("Rendering page:", path);
    console.log("Query params:", Object.fromEntries(queryParams));
    console.log("Current accessToken:", this._accessToken ? "Present" : "Not present");

    // Home dan About selalu public
    const publicRoutes = ["/", "/about", "/login"];
    if (!publicRoutes.includes(path) && !this._accessToken) {
      console.log("Route requires authentication, redirecting to login");
      window.location.hash = "#/login";
      return;
    }

    // If user is logged in and tries to access login page, redirect to home
    if (path === "/login" && this._accessToken) {
      console.log("Logged in user trying to access login page, redirecting to home");
      window.location.hash = "#/";
      return;
    }

    let page;
    switch (path) {
      case "/":
        page = new Home();
        break;
      case "/about":
        page = new About();
        break;
      case "/add-story":
        page = new AddStory();
        break;
      case "/login":
        page = new Login();
        break;
      case "/logout":
        page = new Logout();
        break;
      case "/bookmark":
        page = new BookmarkPage();
        break;
      case "/story":
        const storyPage = new StoryDetailPage();
        storyPage.storyId = queryParams.get("id");
        page = storyPage;
        break;
      default:
        page = new Home();
    }

    // Close drawer when navigating
    this._navigationDrawer.classList.remove("open");
    this._drawerButton.setAttribute("aria-expanded", "false");

    // Cleanup previous page if needed
    if (this._currentPage && this._currentPage.destroy) {
      console.log("Cleaning up previous page");
      this._currentPage.destroy();
    }

    // Store current page
    this._currentPage = page;

    if (!document.startViewTransition) {
      this._content.innerHTML = await page.render();
      await page.afterRender();
      this._updateNavigation(); // Update navigation after page render
      return;
    }

    document.startViewTransition(async () => {
      // Custom animation: fade out old, fade in new
      this._content.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(20px)" },
        ],
        { duration: 200, fill: "forwards" }
      );
      await new Promise((r) => setTimeout(r, 200));
      this._content.innerHTML = await page.render();
      this._content.animate(
        [
          { opacity: 0, transform: "translateY(20px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 250, fill: "forwards" }
      );
      await page.afterRender();
      this._updateNavigation(); // Update navigation after page render
    });
  }
}

export default App;
