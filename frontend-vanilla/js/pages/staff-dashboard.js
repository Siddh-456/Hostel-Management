// Staff Dashboard Page
class StaffDashboardPage extends Page {
  async render(container) {
    const statsHtml = await this.loadStats();

    const html = `
      <div class="dashboard">
        <h1>Staff Dashboard</h1>
        
        <div class="dashboard-cards">
          ${statsHtml}
        </div>
      </div>
    `;

    Layout.render(container, html);
  }

  async loadStats() {
    try {
      const [guestRequests, complaints, rooms, allocations] = await Promise.all([
        API.getGuestRequests({ status: 'pending' }),
        API.getComplaints(),
        API.getRooms(),
        API.getAllocations(null) // Get all - will need mock adjustment
      ]);

      const pendingRequests = guestRequests.length;
      const unresolvedComplaints = complaints.filter(c => ['open', 'in_progress'].includes(c.status)).length;
      const totalRooms = rooms.length;
      const occupiedRooms = allocations?.length || 0;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      return `
        <div class="stat-card">
          <h3>${pendingRequests}</h3>
          <p>Pending Guest Requests</p>
        </div>
        <div class="stat-card">
          <h3>${unresolvedComplaints}</h3>
          <p>Unresolved Complaints</p>
        </div>
        <div class="stat-card">
          <h3>${occupancyRate}%</h3>
          <p>Occupancy Rate</p>
        </div>
        <div class="stat-card">
          <h3>${occupiedRooms}/${totalRooms}</h3>
          <p>Rooms Occupied</p>
        </div>
      `;
    } catch (error) {
      return `<div class="stat-card error">Error loading statistics: ${error.message}</div>`;
    }
  }
}

Router.registerPage('staff-dashboard', StaffDashboardPage);
