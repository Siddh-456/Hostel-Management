// Layout Component
class Layout {
  static render(container, content) {
    const layout = document.createElement('div');
    layout.className = 'layout';

    const user = Auth.getUser();
    const isSidebarVisible = Auth.isLoggedIn();

    layout.innerHTML = `
      <div class="layout-wrapper">
        ${isSidebarVisible ? `
        <aside class="sidebar">
          <div class="sidebar-header">
            <h1 class="logo">Hostel</h1>
          </div>
          <nav class="sidebar-nav">
            ${Auth.isStudent() ? `
              <a href="#" data-page="student-dashboard" class="nav-link">Dashboard</a>
              <a href="#" data-page="guest-request" class="nav-link">Request Guest Visit</a>
              <a href="#" data-page="visitor-log" class="nav-link">Visitor Log</a>
              <a href="#" data-page="pay-fees" class="nav-link">Pay Fees</a>
              <a href="#" data-page="raise-complaint" class="nav-link">Raise Complaint</a>
              <a href="#" data-page="transfer-request" class="nav-link">Transfer Request</a>
              <a href="#" data-page="my-allocations" class="nav-link">My Allocations</a>
            ` : `
              <a href="#" data-page="staff-dashboard" class="nav-link">Dashboard</a>
              <a href="#" data-page="guest-queue" class="nav-link">Guest Requests</a>
              <a href="#" data-page="guest-calendar" class="nav-link">Guest Calendar</a>
              <a href="#" data-page="kiosk" class="nav-link">Check-in/Check-out</a>
              <a href="#" data-page="rooms-management" class="nav-link">Rooms & Blocks</a>
              <a href="#" data-page="fees-payments" class="nav-link">Fees & Payments</a>
              <a href="#" data-page="complaints-board" class="nav-link">Complaints</a>
              <a href="#" data-page="transfers-waitlist" class="nav-link">Transfers & Waitlist</a>
              <a href="#" data-page="inventory" class="nav-link">Inventory</a>
              <a href="#" data-page="audit-pii" class="nav-link">Audit & PII</a>
            `}
          </nav>
        </aside>
        ` : ''}
        <div class="main-content">
          <header class="topbar">
            <div class="topbar-left">
              <h2>Hostel Management System</h2>
            </div>
            <div class="topbar-right">
              ${isSidebarVisible ? `
                <span class="user-info">${user.full_name} (${user.role})</span>
                <button class="btn btn-logout" id="logout-btn">Logout</button>
              ` : ''}
            </div>
          </header>
          <main class="page-content">
            ${content}
          </main>
        </div>
      </div>
    `;

    container.appendChild(layout);

    // Setup navigation
    layout.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate(link.dataset.page);
      });
    });

    // Setup logout
    const logoutBtn = layout.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
        Router.navigate('login');
      });
    }
  }
}
