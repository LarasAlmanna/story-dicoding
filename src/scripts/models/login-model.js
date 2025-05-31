import { loginUser } from '../data/api.js';

class LoginModel {
  async login(email, password) {
    return await loginUser(email, password);
  }
}

export default LoginModel; 