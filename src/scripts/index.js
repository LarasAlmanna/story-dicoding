// CSS imports
import "../styles/main.css";

import App from "./views/app.js";
import StoryPresenter from "./presenters/story-presenter";
import StoryModel from "./models/story-model";

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker-v2.js", {
        scope: "/",
      });
      console.log("ServiceWorker registration successful with scope:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        console.log("Service Worker update found!");

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("New Service Worker installed!");
          }
        });
      });
    } catch (error) {
      console.error("ServiceWorker registration failed:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.querySelector("#main-content");
  const app = new App(mainContent);

  // Store app instance in main-content element
  mainContent.__app = app;

  const storyModel = new StoryModel();
  const storyPresenter = new StoryPresenter({
    view: app,
    model: storyModel,
  });

  window.addEventListener("hashchange", () => {
    app.renderPage();
  });

  window.addEventListener("load", () => {
    app.renderPage();
  });

  // Misal di afterRender halaman About atau Home
  document.getElementById("clear-offline-stories").addEventListener("click", async () => {
    await database.clearAllStories();
    alert("Semua data offline berhasil dihapus!");
    // Refresh tampilan jika perlu
    window.location.reload();
  });
});
