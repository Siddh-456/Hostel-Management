// Router
class Router {
  static currentPage = null;
  static pages = {};

  static registerPage(name, pageClass) {
    this.pages[name] = pageClass;
  }

  static async navigate(pageName) {
    if (pageName === 'login' || !Auth.isLoggedIn()) {
      if (pageName !== 'login') {
        pageName = 'login';
      }
    } else if (pageName === 'login') {
      // Redirect staff and students to their dashboards
      const user = Auth.getUser();
      pageName = user.role === 'student' ? 'student-dashboard' : 'staff-dashboard';
    }

    const PageClass = this.pages[pageName];
    if (!PageClass) {
      console.error(`Page ${pageName} not found`);
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = '';

    this.currentPage = new PageClass();
    await this.currentPage.render(app);
  }

  static getPage(name) {
    return this.pages[name];
  }
}

// Base Page class
class Page {
  constructor() {}

  async render(container) {
    throw new Error('render() must be implemented');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  createModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${buttons.map(btn => `<button class="btn btn-${btn.type || 'default'}" data-action="${btn.action}">${btn.label}</button>`).join('')}
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    buttons.forEach(btn => {
      const btnEl = modal.querySelector(`[data-action="${btn.action}"]`);
      if (btnEl) {
        btnEl.addEventListener('click', async () => {
          if (btn.onClick) await btn.onClick();
          modal.remove();
        });
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }
}
