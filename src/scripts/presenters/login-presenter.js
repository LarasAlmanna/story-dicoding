class LoginPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  async login(email, password) {
    try {
      const responseData = await this._model.login(email, password);
      if (responseData && responseData.loginResult && responseData.loginResult.token) {
        this._view.showLoginSuccess(responseData.loginResult.token);
      } else {
        this._view.showLoginError('Login gagal, cek email/password.');
      }
    } catch (error) {
      this._view.showLoginError('Gagal login: ' + error.message);
    }
  }
}

export default LoginPresenter; 