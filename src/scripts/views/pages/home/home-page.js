import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HomePresenter from "../../../presenters/home-presenter.js";
import StoryModel from "../../../models/story-model.js";
import { generateStoryItemTemplate } from "../../../templates/template-creator.js";

class Home {
  constructor() {
    this._map = null;
    this._markers = [];
    this._accessToken = sessionStorage.getItem("accessToken");
    this._mapTilerKey = "QTK4jDtapeC0lkg0AvHY";
    this._presenter = new HomePresenter({ view: this, model: new StoryModel() });
  }

  async render() {
    return `
      <div class="home-container">
        <section class="map-section">
          <div id="map" class="map-content"></div>
        </section>
        <section class="stories-section">
          <h2 class="section-title">Jelajahi Cerita</h2>
          <div id="storyList" class="stories-grid"></div>
        </section>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    await this._presenter.loadStories();
  }

  _initMap() {
    const mapTilerUrl = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${this._mapTilerKey}`;
    const mapTilerAttribution = '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

    const baseMap = L.tileLayer(mapTilerUrl, {
      attribution: mapTilerAttribution,
      crossOrigin: true,
    });

    this._map = L.map("map", {
      center: [-2.548926, 118.014863],
      zoom: 5,
      layers: [baseMap],
      zoomControl: true,
    });
  }

  _displayStories(stories) {
    const storyListElement = document.querySelector("#storyList");

    if (!stories || stories.length === 0) {
      storyListElement.innerHTML = '<p class="no-stories">Belum ada cerita yang ditambahkan.</p>';
      return;
    }

    storyListElement.innerHTML = stories.map((story) => generateStoryItemTemplate(story)).join("");

    this._markers.forEach((marker) => marker.remove());
    this._markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .addTo(this._map)
          .bindPopup(
            `
            <div class="map-popup">
              <div class="popup-header">
                <div class="popup-user">
                  <div class="popup-avatar">${story.name.charAt(0).toUpperCase()}</div>
                  <div class="popup-user-info">
                    <strong>${story.name}</strong>
                    <span class="popup-location">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button class="popup-close" onclick="document.querySelector('.leaflet-popup-close-button').click()">×</button>
              </div>
              <div class="popup-image">
                <img src="${story.photoUrl}" alt="Story location" loading="lazy">
              </div>
              <div class="popup-content">
                <p>${story.description}</p>
                <div class="popup-footer">
                  <span class="popup-date">${this._formatDate(story.createdAt)}</span>
                  <a href="https://www.google.com/maps?q=${story.lat},${story.lon}" target="_blank" class="popup-locate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"></path>
                      <circle cx="12" cy="9" r="2.5"></circle>
                    </svg>
                    Buka Maps
                  </a>
                </div>
              </div>
            </div>
          `,
            {
              maxWidth: 280,
              minWidth: 280,
              className: "custom-popup",
            }
          );
        this._markers.push(marker);
      }
    });

    if (this._markers.length > 0) {
      const group = L.featureGroup(this._markers);
      this._map.fitBounds(group.getBounds(), {
        padding: [50, 50],
      });
    }
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit yang lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam yang lalu`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari yang lalu`;

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  _showError(message) {
    const storyListElement = document.querySelector("#storyList");
    storyListElement.innerHTML = `<p class="error-message">${message}</p>`;
  }

  showStories(stories) {
    this._displayStories(stories);
  }

  showError(message) {
    this._showError(message);
  }

  destroy() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}

export default Home;
