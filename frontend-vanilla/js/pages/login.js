// Login Page
class LoginPage extends Page {
  async render(container) {
    const html = `
      <div class="login-container">
        <div class="login-box">
          <h1>Hostel Management</h1>
          <p>Student & Staff Portal</p>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="your@college.edu">
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="Password">
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </form>
          
          <div class="login-hint">
            <p><strong>Demo Credentials:</strong></p>
            <p>Student: s101@students.edu</p>
            <p>Warden: warden@college.edu</p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const form = container.querySelector('#login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = form.email.value;
      const password = form.password.value;

      try {
        const response = await API.login(email, password);
        const { token, user } = response;

        if (token && user) {
          Auth.setUser(user, token);
          Router.navigate('student-dashboard');
        }
      } catch (error) {
        this.showError('Login failed: ' + error.message);
      }
    });
  }
}

Router.registerPage('login', LoginPage);
