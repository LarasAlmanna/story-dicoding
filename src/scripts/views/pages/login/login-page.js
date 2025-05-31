import LoginPresenter from '../../../presenters/login-presenter.js';
import LoginModel from '../../../models/login-model.js';

class Login {
  constructor() {
    this._initialSetup();
    this._presenter = new LoginPresenter({ view: this, model: new LoginModel() });
  }

  _initialSetup() {
    // Clear any existing session
    sessionStorage.removeItem('accessToken');
  }

  async render() {
    return `
      <a href="#main-content" class="skip-to-content">Skip to content</a>
      <main id="main-content" tabindex="-1">
        <div class="login-container">
          <div class="login-card">
            <h1 class="login-logo">Welcome Back</h1>
            <p class="login-subtitle">Sign in to continue to Dicoding Story</p>
            
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required
                  autocomplete="email"
                >
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  required
                  autocomplete="current-password"
                >
              </div>
              
              <div id="loginError" class="error-message" aria-live="polite" style="display:none;"></div>
              
              <button type="submit" class="button">Sign In</button>
            </form>

            <div class="login-info">
              <p class="demo-title">Demo Account</p>
              <div class="demo-credentials">
                <div class="credential-item">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">laras1@gmail.com</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">larascantik1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#loginForm');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const loginError = document.getElementById('loginError');
      loginError.style.display = 'none';
      loginError.textContent = '';
      const formData = {
        email: form.email.value,
        password: form.password.value,
      };
      await this._presenter.login(formData.email, formData.password);
    });

    // Fokus langsung ke input email jika main-content sedang fokus (setelah skip to content)
    const main = document.getElementById('main-content');
    const emailInput = document.getElementById('email');
    if (document.activeElement === main && emailInput) {
      emailInput.focus();
    }
  }

  showLoginSuccess(token) {
    sessionStorage.setItem('accessToken', token);
    const app = document.querySelector('#main-content').__app;
    if (app) {
      app._accessToken = token;
      app._updateNavigation();
    }
    window.location.hash = '#/';
  }

  showLoginError(message) {
    const loginError = document.getElementById('loginError');
    loginError.textContent = message;
    loginError.style.display = 'block';
  }
}

export default Login; 