import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StoryPresenter from '../../../presenters/story-presenter.js';
import StoryModel from '../../../models/story-model.js';

class AddStory {
  constructor() {
    this._map = null;
    this._marker = null;
    this._stream = null;
    this._lat = null;
    this._lon = null;
    this._storyModel = new StoryModel();
    this._mapTilerKey = 'QTK4jDtapeC0lkg0AvHY';
    this._presenter = new StoryPresenter({ view: this, model: new StoryModel() });
  }

  async render() {
    return `
      <div class="add-story-container">
        <div class="add-story-header">
          <h1>Tambah Cerita Baru</h1>
        </div>
        
        <form class="add-story-form" id="addStoryForm">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="Ceritakan momen spesialmu..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Foto</label>
            <div class="camera-container" id="cameraContainer">
              <div class="camera-preview-wrapper">
                <video id="camera" autoplay playsinline class="camera-preview"></video>
                <canvas id="canvas" style="display: none;"></canvas>
                <div class="camera-overlay">
                  <div class="capture-button-wrapper">
                    <button type="button" id="captureButton" class="capture-button">
                      <span class="capture-icon">📸</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="photo-preview-container" id="photoPreviewContainer" style="display: none;">
              <img id="previewImage" class="photo-preview" alt="Preview foto">
              <div class="preview-controls">
                <button type="button" id="retakeButton" class="camera-button">
                  <span class="camera-icon">🔄</span>
                  <span>Ambil Ulang</span>
                </button>
              </div>
            </div>

            <div id="photoFallback" class="photo-upload-container" style="display: none;">
              <div class="photo-upload-icon">📸</div>
              <p class="photo-upload-text">Klik atau seret foto ke sini</p>
              <p class="photo-upload-hint">Format: JPG, PNG (Max: 5MB)</p>
              <input 
                type="file" 
                id="photo" 
                name="photo" 
                accept="image/*"
                style="display: none;"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Lokasi</label>
            <div class="location-picker">
              <div id="map" class="location-map"></div>
              <p class="location-hint">Klik pada peta untuk menandai lokasi</p>
              <div id="selectedLocation" class="selected-location" style="display: none;">
                <span class="location-icon">📍</span>
                <span id="locationText">Lokasi dipilih</span>
              </div>
            </div>
          </div>

          <div id="formError" class="error-message" style="display: none;"></div>

          <button type="submit" class="submit-button" id="submitButton">
            Bagikan Cerita
          </button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    // Initialize map first to ensure the container is ready
    this._initMap();
    // Then initialize camera
    await this._initCamera();
    this._initForm();
  }

  async _initCamera() {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      this._stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.getElementById('camera');
      video.srcObject = this._stream;
      
      // Show camera container
      document.getElementById('cameraContainer').style.display = 'block';
      document.getElementById('photoFallback').style.display = 'none';
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Show file upload fallback if camera not available
      document.getElementById('cameraContainer').style.display = 'none';
      document.getElementById('photoFallback').style.display = 'block';
      this._initPhotoUpload();
    }
  }

  _initMap() {
    if (!this._map) {
      const mapTilerUrl = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${this._mapTilerKey}`;
      const mapTilerAttribution = '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

      const baseMap = L.tileLayer(mapTilerUrl, {
        attribution: mapTilerAttribution,
        crossOrigin: true
      });

      // Default location: Bandung
      this._map = L.map('map', {
        center: [-6.9175, 107.6191],
        zoom: 12,
        layers: [baseMap],
        zoomControl: true
      });

      // Add click event
      this._map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        this._lat = lat;
        this._lon = lng;

        if (this._marker) {
          this._marker.remove();
        }

        this._marker = L.marker([lat, lng]).addTo(this._map);
        
        // Update location text
        const locationText = document.getElementById('locationText');
        const selectedLocation = document.getElementById('selectedLocation');
        locationText.textContent = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        selectedLocation.style.display = 'flex';
      });

      // Force a map resize after initialization
      setTimeout(() => {
        this._map.invalidateSize();
      }, 100);
    }
  }

  _initPhotoUpload() {
    const photoInput = document.getElementById('photo');
    const photoFallback = document.getElementById('photoFallback');
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('photoPreviewContainer');

    photoFallback.addEventListener('click', () => photoInput.click());
    
    photoFallback.addEventListener('dragover', (e) => {
      e.preventDefault();
      photoFallback.classList.add('dragover');
    });

    photoFallback.addEventListener('dragleave', () => {
      photoFallback.classList.remove('dragover');
    });

    photoFallback.addEventListener('drop', (e) => {
      e.preventDefault();
      photoFallback.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        photoInput.files = e.dataTransfer.files;
        this._showPhotoPreview(file);
      }
    });

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this._showPhotoPreview(file);
      }
    });
  }

  _showPhotoPreview(file) {
    const reader = new FileReader();
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('photoPreviewContainer');
    const photoFallback = document.getElementById('photoFallback');

    reader.onload = (e) => {
      previewImage.src = e.target.result;
      photoFallback.style.display = 'none';
      previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  _initForm() {
    const form = document.getElementById('addStoryForm');
    const captureButton = document.getElementById('captureButton');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const previewImage = document.getElementById('previewImage');
    const retakeButton = document.getElementById('retakeButton');
    const video = document.getElementById('camera');
    const cameraContainer = document.getElementById('cameraContainer');
    const formError = document.getElementById('formError');
    let photoData = null;

    if (captureButton) {
      captureButton.addEventListener('click', () => {
        try {
          const canvas = document.getElementById('canvas');
          const context = canvas.getContext('2d');

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);

          photoData = canvas.toDataURL('image/jpeg');
          previewImage.src = photoData;
          
          cameraContainer.style.display = 'none';
          photoPreviewContainer.style.display = 'block';
          formError.style.display = 'none';
        } catch (error) {
          console.error('Error capturing photo:', error);
          formError.textContent = 'Gagal mengambil foto. Silakan coba lagi atau unggah foto.';
          formError.style.display = 'block';
        }
      });
    }

    if (retakeButton) {
      retakeButton.addEventListener('click', () => {
        photoData = null;
        previewImage.src = '';
        photoPreviewContainer.style.display = 'none';
        cameraContainer.style.display = 'block';
        formError.style.display = 'none';
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = document.getElementById('submitButton');
      const formError = document.getElementById('formError');
      
      submitButton.disabled = true;
      submitButton.textContent = 'Mengunggah...';
      formError.style.display = 'none';

      try {
        // Validasi form
        if (!form.description.value.trim()) {
          throw new Error('Deskripsi tidak boleh kosong');
        }

        if (!photoData && !document.getElementById('photo').files[0]) {
          throw new Error('Silakan ambil atau unggah foto terlebih dahulu');
        }

        if (!this._lat || !this._lon) {
          throw new Error('Silakan pilih lokasi pada peta');
        }

        const formData = new FormData();
        formData.append('description', form.description.value);

        // Handle photo data
        if (photoData) {
          // Convert base64 to blob
          const response = await fetch(photoData);
          const blob = await response.blob();
          formData.append('photo', blob, 'photo.jpg');
        } else {
          const photoInput = document.getElementById('photo');
          if (photoInput && photoInput.files[0]) {
            formData.append('photo', photoInput.files[0]);
          }
        }

        // Add location
        formData.append('lat', this._lat);
        formData.append('lon', this._lon);

        await this._presenter.addStory(formData);
        // Success and error handling is now done via showSuccess/showError
      } catch (error) {
        this.showError(error.message || 'Gagal mengunggah cerita. Silakan coba lagi.');
      }
    });
  }

  showSuccess(message) {
    const submitButton = document.getElementById('submitButton');
    submitButton.textContent = 'Berhasil!';
    setTimeout(() => {
      window.location.hash = '#/';
    }, 1000);
  }

  showError(message) {
    const formError = document.getElementById('formError');
    formError.textContent = message;
    formError.style.display = 'block';
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.textContent = 'Bagikan Cerita';
  }

  destroy() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
    }
    if (this._map) {
      this._map.remove();
    }
  }
}

export default AddStory; 