// Student Dashboard Page
class StudentDashboardPage extends Page {
  async render(container) {
    const user = Auth.getUser();
    let allocationsHtml = '<p>Loading...</p>';
    let guestRequestsHtml = '<p>Loading...</p>';
    let feesHtml = '<p>Loading...</p>';

    try {
      const [allocations, guestRequests, fees] = await Promise.all([
        API.getAllocations(user.id),
        API.getGuestRequests({ host_student_id: user.id }),
        API.getFees(user.id)
      ]);

      allocationsHtml = allocations.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Check-in Date</th>
              <th>Check-out Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allocations.map(a => `
              <tr>
                <td>${a.room_id}</td>
                <td>${a.check_in_date}</td>
                <td>${a.check_out_date || 'Active'}</td>
                <td><span class="badge badge-success">${a.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No allocations found.</p>';

      guestRequestsHtml = guestRequests.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${guestRequests.map(g => `
              <tr>
                <td>${g.guest_name}</td>
                <td>${new Date(g.check_in).toLocaleString()}</td>
                <td>${new Date(g.check_out).toLocaleString()}</td>
                <td><span class="badge badge-${g.status === 'approved' ? 'success' : g.status === 'pending' ? 'warning' : 'danger'}">${g.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No guest requests.</p>';

      feesHtml = fees.length ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${fees.map(f => `
              <tr>
                <td>${f.fee_type}</td>
                <td>₹${f.amount}</td>
                <td>${f.due_date || '-'}</td>
                <td><span class="badge badge-${f.paid ? 'success' : 'danger'}">${f.paid ? 'Paid' : 'Unpaid'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>No fees.</p>';
    } catch (error) {
      console.error('Error loading dashboard:', error);
      allocationsHtml = `<p class="error">Error loading allocations</p>`;
    }

    const html = `
      <div class="dashboard">
        <h1>Student Dashboard</h1>
        
        <div class="dashboard-cards">
          <div class="card">
            <h3>My Allocations</h3>
            ${allocationsHtml}
          </div>
          
          <div class="card">
            <h3>Guest Requests</h3>
            ${guestRequestsHtml}
          </div>
          
          <div class="card">
            <h3>My Fees</h3>
            ${feesHtml}
          </div>
        </div>
      </div>
    `;

    Layout.render(container, html);
  }
}

Router.registerPage('student-dashboard', StudentDashboardPage);
