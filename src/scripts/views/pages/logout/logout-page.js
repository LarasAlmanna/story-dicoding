class Logout {
  constructor() {
    this._accessToken = sessionStorage.getItem('accessToken');
  }

  async render() {
    return `
      <div class="content">
        <h2 class="content__heading">Logout</h2>
        <div class="logout-message">
          <p>Anda telah berhasil logout.</p>
          <p>Terima kasih telah menggunakan aplikasi Dicoding Story.</p>
          <a href="#/login" class="button">Login Kembali</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      window.location.hash = '#/login';
    }, 2000);
  }
}

export default Logout; 