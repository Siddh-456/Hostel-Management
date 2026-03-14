// Authentication module
class Auth {
  static isLoggedIn() {
    return !!localStorage.getItem(CONFIG.TOKEN_KEY);
  }

  static getUser() {
    const user = localStorage.getItem(CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user, token) {
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  }

  static logout() {
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.TOKEN_KEY);
  }

  static hasRole(roles) {
    const user = this.getUser();
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  }

  static isStudent() {
    return this.hasRole('student');
  }

  static isStaff() {
    return this.hasRole(['warden', 'caretaker', 'accountant', 'superadmin']);
  }
}
