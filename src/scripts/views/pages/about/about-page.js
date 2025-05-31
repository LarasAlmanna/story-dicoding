class About {
  async render() {
    return `
      <div class="about-container">
        <section class="about-header">
          <h1>About Dicoding Story</h1>
          <p class="about-subtitle">Platform berbagi cerita dengan lokasi yang memudahkan pengguna untuk berbagi momen spesial mereka.</p>
        </section>

        <section class="about-content">
          <div class="about-section">
            <h2>Tentang Aplikasi</h2>
            <p>Dicoding Story adalah platform berbagi cerita yang memungkinkan pengguna untuk membagikan momen dan pengalaman mereka dalam bentuk cerita dengan gambar dan lokasi. Dengan integrasi peta yang interaktif, pengguna dapat melihat di mana setiap cerita terjadi.</p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📸</div>
              <h3>Berbagi Cerita</h3>
              <p>Bagikan cerita Anda dengan mudah melalui antarmuka yang sederhana dan intuitif.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🗺️</div>
              <h3>Peta Interaktif</h3>
              <p>Lihat lokasi setiap cerita melalui peta interaktif yang mudah dinavigasi.</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>Responsif</h3>
              <p>Akses dari berbagai perangkat dengan tampilan yang optimal.</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  async afterRender() {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }
}

export default About;
